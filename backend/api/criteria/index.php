
<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../config/jwt.php';
require_once '../../models/Criteria.php';

$database = new Database();
$db = $database->getConnection();
$criteria = new Criteria($db);
$jwt_handler = new JWTHandler();

// Verify token
$token = $jwt_handler->getTokenFromHeader();
if (!$token || !$jwt_handler->validateToken($token)) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $all_criteria = $criteria->getAll();
    echo json_encode([
        "success" => true,
        "data" => $all_criteria
    ]);
} else {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Method not allowed"
    ]);
}
?>
