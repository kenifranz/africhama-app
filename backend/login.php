<?php
require_once 'config.php';
require_once 'vendor/autoload.php';
use Firebase\JWT\JWT;

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Check if username and password are set
if (!isset($data->username) || !isset($data->password)) {
    http_response_code(400);
    echo json_encode(array("message" => "Username and password are required."));
    exit();
}

$username = $data->username;
$password = $data->password;

try {
    // Prepare a select statement
    $sql = "SELECT id, username, password, email, first_name, last_name, class FROM users WHERE username = :username";
    $stmt = $pdo->prepare($sql);
    
    // Bind parameters
    $stmt->bindParam(':username', $username, PDO::PARAM_STR);
    
    // Execute the prepared statement
    $stmt->execute();

    if ($stmt->rowCount() == 1) {
        $row = $stmt->fetch();
        
        if (password_verify($password, $row['password'])) {
            $token = array(
                "iss" => API_BASE_URL,
                "aud" => API_BASE_URL,
                "iat" => time(),
                "nbf" => time(),
                "exp" => time() + JWT_EXPIRATION,
                "data" => array(
                    "id" => $row['id'],
                    "username" => $row['username'],
                    "email" => $row['email']
                )
            );

            // Generate JWT
            $jwt = JWT::encode($token, JWT_SECRET, 'HS256');

            http_response_code(200);
            echo json_encode(
                array(
                    "message" => "Successful login.",
                    "jwt" => $jwt,
                    "user" => array(
                        "id" => $row['id'],
                        "username" => $row['username'],
                        "email" => $row['email'],
                        "firstName" => $row['first_name'],
                        "lastName" => $row['last_name'],
                        "class" => $row['class']
                    )
                )
            );
        } else {
            http_response_code(401);
            echo json_encode(array("message" => "Login failed. Invalid username or password."));
        }
    } else {
        http_response_code(401);
        echo json_encode(array("message" => "Login failed. Invalid username or password."));
    }
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Login failed: " . $e->getMessage()));
}