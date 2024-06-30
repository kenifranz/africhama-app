<?php
// Database configuration
$host = 'localhost:3305';  // Note the port specification
$db   = 'africhama';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
     throw new \PDOException($e->getMessage(), (int)$e->getCode());
}

// Error logging setup
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$logFile = __DIR__ . '/error_log.txt';
ini_set('error_log', $logFile);

function logError($message) {
    error_log(date('[Y-m-d H:i:s] ') . $message . "\n", 3, $GLOBALS['logFile']);
}

// Other configuration settings
define('JWT_SECRET', 'your_jwt_secret_here');  // Replace with a secure random string
define('JWT_EXPIRATION', 3600);  // 1 hour in seconds
?>