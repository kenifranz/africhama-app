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
    // Fetch support tickets
    try {
        $stmt = $pdo->prepare("
            SELECT id, subject, message, status, created_at, updated_at
            FROM support_tickets
            WHERE user_id = :user_id
            ORDER BY created_at DESC
        ");
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();

        $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode(array("tickets" => $tickets));
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Error fetching support tickets: " . $e->getMessage()));
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Create a new support ticket
    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->subject) || !isset($data->message)) {
        http_response_code(400);
        echo json_encode(array("message" => "Subject and message are required."));
        exit();
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO support_tickets (user_id, subject, message, status, created_at, updated_at)
            VALUES (:user_id, :subject, :message, 'open', NOW(), NOW())
        ");
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':subject', $data->subject);
        $stmt->bindParam(':message', $data->message);
        $stmt->execute();

        $ticket_id = $pdo->lastInsertId();

        http_response_code(201);
        echo json_encode(array(
            "message" => "Support ticket created successfully.",
            "ticket_id" => $ticket_id
        ));
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Error creating support ticket: " . $e->getMessage()));
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