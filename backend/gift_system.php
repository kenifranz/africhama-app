<?php
require_once 'config.php';
require_once 'auth_middleware.php';

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT");
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
    // Fetch gift history
    try {
        $stmt = $pdo->prepare("
            SELECT g.id, g.amount, g.status, g.created_at, 
                   s.username as sender_username, r.username as receiver_username
            FROM gifts g
            JOIN users s ON g.sender_id = s.id
            JOIN users r ON g.receiver_id = r.id
            WHERE g.sender_id = :user_id OR g.receiver_id = :user_id
            ORDER BY g.created_at DESC
        ");
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();

        $gifts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode(array("gifts" => $gifts));
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Error fetching gift history: " . $e->getMessage()));
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Send a gift
    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->receiver_member_code) || !isset($data->amount)) {
        http_response_code(400);
        echo json_encode(array("message" => "Receiver member code and amount are required."));
        exit();
    }

    try {
        $pdo->beginTransaction();

        // Get receiver's user ID
        $stmt = $pdo->prepare("SELECT id, class FROM users WHERE member_code = :member_code");
        $stmt->bindParam(':member_code', $data->receiver_member_code);
        $stmt->execute();
        $receiver = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$receiver) {
            $pdo->rollBack();
            http_response_code(400);
            echo json_encode(array("message" => "Invalid receiver member code."));
            exit();
        }

        // Check if amount is valid for sender's class
        $stmt = $pdo->prepare("SELECT class FROM users WHERE id = :user_id");
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        $sender_class = $stmt->fetchColumn();

        $valid_amounts = array(
            'E' => array(10),
            'P' => array(30),
            'B' => array(100)
        );

        if (!in_array($data->amount, $valid_amounts[$sender_class])) {
            $pdo->rollBack();
            http_response_code(400);
            echo json_encode(array("message" => "Invalid gift amount for your class."));
            exit();
        }

        // Create gift
        $stmt = $pdo->prepare("
            INSERT INTO gifts (sender_id, receiver_id, amount, status)
            VALUES (:sender_id, :receiver_id, :amount, 'pending')
        ");
        $stmt->bindParam(':sender_id', $user_id);
        $stmt->bindParam(':receiver_id', $receiver['id']);
        $stmt->bindParam(':amount', $data->amount);
        $stmt->execute();

        $pdo->commit();

        http_response_code(201);
        echo json_encode(array("message" => "Gift sent successfully."));
    } catch(PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(array("message" => "Error sending gift: " . $e->getMessage()));
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Approve a received gift
    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->gift_id)) {
        http_response_code(400);
        echo json_encode(array("message" => "Gift ID is required."));
        exit();
    }

    try {
        $pdo->beginTransaction();

        // Check if the gift exists and belongs to the user
        $stmt = $pdo->prepare("
            SELECT * FROM gifts 
            WHERE id = :gift_id AND receiver_id = :user_id AND status = 'pending'
        ");
        $stmt->bindParam(':gift_id', $data->gift_id);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();

        $gift = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$gift) {
            $pdo->rollBack();
            http_response_code(400);
            echo json_encode(array("message" => "Invalid gift ID or gift already approved."));
            exit();
        }

        // Approve the gift
        $stmt = $pdo->prepare("UPDATE gifts SET status = 'approved' WHERE id = :gift_id");
        $stmt->bindParam(':gift_id', $data->gift_id);
        $stmt->execute();

        $pdo->commit();

        http_response_code(200);
        echo json_encode(array("message" => "Gift approved successfully."));
    } catch(PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(array("message" => "Error approving gift: " . $e->getMessage()));
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