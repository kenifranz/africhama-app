<?php
require_once 'config.php';
require_once 'auth_middleware.php';

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, PUT");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Get the JWT token from the Authorization header
$token = getBearerToken();

// Validate the token
$user_id = validateToken($token);

if (!$user_id) {
    http_response_code(401);
    echo json_encode(array("message" => "Invalid or expired token."));
    exit();
}

// Handle GET request to fetch user profile
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $pdo->prepare("SELECT username, email, first_name, last_name, country, city, age, member_code, class FROM users WHERE id = :user_id");
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            http_response_code(200);
            echo json_encode(array("user" => $user));
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "User not found."));
        }
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Error fetching user profile: " . $e->getMessage()));
    }
}

// Handle PUT request to update user profile
elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents("php://input"));

    $updateFields = array();
    $params = array(':user_id' => $user_id);

    // Check which fields are provided and add them to the update query
    $allowedFields = ['first_name', 'last_name', 'country', 'city', 'age'];
    foreach ($allowedFields as $field) {
        if (isset($data->$field)) {
            $updateFields[] = "$field = :$field";
            $params[":$field"] = $data->$field;
        }
    }

    if (empty($updateFields)) {
        http_response_code(400);
        echo json_encode(array("message" => "No fields to update."));
        exit();
    }

    try {
        $sql = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = :user_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        if ($stmt->rowCount() > 0) {
            // Fetch the updated user profile
            $stmt = $pdo->prepare("SELECT username, email, first_name, last_name, country, city, age, member_code, class FROM users WHERE id = :user_id");
            $stmt->bindParam(':user_id', $user_id);
            $stmt->execute();
            $updatedUser = $stmt->fetch(PDO::FETCH_ASSOC);

            http_response_code(200);
            echo json_encode(array("message" => "Profile updated successfully.", "user" => $updatedUser));
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "No changes were made to the profile."));
        }
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Error updating user profile: " . $e->getMessage()));
    }
}

else {
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