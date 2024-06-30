<?php
require_once 'config.php';
require_once 'auth_middleware.php';

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$token = getBearerToken();
$user_id = validateToken($token);

if (!$user_id) {
    http_response_code(401);
    echo json_encode(array("message" => "Invalid or expired token."));
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Fetch subscription and maintenance status
    try {
        $stmt = $pdo->prepare("SELECT s.status as subscription_status, s.end_date as subscription_end_date, 
                               m.status as maintenance_status, m.last_payment_date
                               FROM users u
                               LEFT JOIN subscriptions s ON u.id = s.user_id
                               LEFT JOIN maintenance_fees m ON u.id = m.user_id
                               WHERE u.id = :user_id
                               ORDER BY s.end_date DESC, m.last_payment_date DESC
                               LIMIT 1");
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();

        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode(array(
            "subscription" => array(
                "status" => $result['subscription_status'] ?? 'inactive',
                "endDate" => $result['subscription_end_date'] ?? null
            ),
            "maintenance" => array(
                "status" => $result['maintenance_status'] ?? 'unpaid',
                "lastPaymentDate" => $result['last_payment_date'] ?? null
            )
        ));
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Error fetching subscription data: " . $e->getMessage()));
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->action)) {
        http_response_code(400);
        echo json_encode(array("message" => "Action is required."));
        exit();
    }

    if ($data->action === 'subscribe') {
        try {
            $pdo->beginTransaction();

            // Check if user already has an active subscription
            $stmt = $pdo->prepare("SELECT id FROM subscriptions WHERE user_id = :user_id AND end_date > NOW()");
            $stmt->bindParam(':user_id', $user_id);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                $pdo->rollBack();
                http_response_code(400);
                echo json_encode(array("message" => "User already has an active subscription."));
                exit();
            }

            // Create new subscription
            $stmt = $pdo->prepare("INSERT INTO subscriptions (user_id, status, start_date, end_date) 
                                   VALUES (:user_id, 'active', NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR))");
            $stmt->bindParam(':user_id', $user_id);
            $stmt->execute();

            $pdo->commit();

            http_response_code(200);
            echo json_encode(array("message" => "Subscription created successfully."));
        } catch(PDOException $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(array("message" => "Error creating subscription: " . $e->getMessage()));
        }
    } elseif ($data->action === 'pay_maintenance') {
        try {
            $pdo->beginTransaction();

            // Check if maintenance fee is already paid for this year
            $stmt = $pdo->prepare("SELECT id FROM maintenance_fees 
                                   WHERE user_id = :user_id AND YEAR(last_payment_date) = YEAR(CURDATE())");
            $stmt->bindParam(':user_id', $user_id);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                $pdo->rollBack();
                http_response_code(400);
                echo json_encode(array("message" => "Maintenance fee already paid for this year."));
                exit();
            }

            // Record maintenance fee payment
            $stmt = $pdo->prepare("INSERT INTO maintenance_fees (user_id, status, last_payment_date, amount) 
                                   VALUES (:user_id, 'paid', NOW(), :amount)");
            $stmt->bindParam(':user_id', $user_id);
            $stmt->bindParam(':amount', config('YEARLY_MAINTENANCE_FEE'));
            $stmt->execute();

            $pdo->commit();

            http_response_code(200);
            echo json_encode(array("message" => "Maintenance fee paid successfully."));
        } catch(PDOException $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(array("message" => "Error paying maintenance fee: " . $e->getMessage()));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Invalid action."));
    }
} else {
    http_response_code(405);
    echo json_encode(array("message" => "Method not allowed."));
}

function getBearerToken() {
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
            return $matches[1];
        }
    }
    return null;
}