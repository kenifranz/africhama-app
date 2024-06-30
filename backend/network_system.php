<?php
require_once 'config.php';
require_once 'auth_middleware.php';

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, PUT");
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
    // Fetch network members
    try {
        $stmt = $pdo->prepare("
            SELECT id, username, email, first_name, last_name, member_code, class
            FROM users
            WHERE sponsor_code = (SELECT member_code FROM users WHERE id = :user_id)
        ");
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();

        $network_members = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Group members by class
        $network = array(
            'E' => array(),
            'P' => array(),
            'B' => array()
        );

        foreach ($network_members as $member) {
            $network[$member['class']][] = $member;
        }

        // Fetch user's current class
        $stmt = $pdo->prepare("SELECT class FROM users WHERE id = :user_id");
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        $user_class = $stmt->fetchColumn();

        http_response_code(200);
        echo json_encode(array(
            "network" => $network,
            "user_class" => $user_class
        ));
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Error fetching network data: " . $e->getMessage()));
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Upgrade class
    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->new_class)) {
        http_response_code(400);
        echo json_encode(array("message" => "New class is required."));
        exit();
    }

    $valid_upgrades = array(
        'E' => array('P', 'B'),
        'P' => array('B')
    );

    try {
        $pdo->beginTransaction();

        // Get current class
        $stmt = $pdo->prepare("SELECT class FROM users WHERE id = :user_id");
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        $current_class = $stmt->fetchColumn();

        // Validate upgrade
        if (!isset($valid_upgrades[$current_class]) || !in_array($data->new_class, $valid_upgrades[$current_class])) {
            $pdo->rollBack();
            http_response_code(400);
            echo json_encode(array("message" => "Invalid class upgrade."));
            exit();
        }

        // Perform upgrade
        $stmt = $pdo->prepare("UPDATE users SET class = :new_class WHERE id = :user_id");
        $stmt->bindParam(':new_class', $data->new_class);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();

        // Record upgrade transaction
        $stmt = $pdo->prepare("
            INSERT INTO class_upgrades (user_id, from_class, to_class, upgrade_date)
            VALUES (:user_id, :from_class, :to_class, NOW())
        ");
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':from_class', $current_class);
        $stmt->bindParam(':to_class', $data->new_class);
        $stmt->execute();

        $pdo->commit();

        http_response_code(200);
        echo json_encode(array("message" => "Class upgraded successfully.", "new_class" => $data->new_class));
    } catch(PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(array("message" => "Error upgrading class: " . $e->getMessage()));
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