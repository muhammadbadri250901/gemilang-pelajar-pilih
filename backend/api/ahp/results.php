
<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../config/jwt.php';
require_once '../../models/AHPCalculation.php';

$database = new Database();
$db = $database->getConnection();
$ahp = new AHPCalculation($db);
$jwt_handler = new JWTHandler();

// Verify token
$token = $jwt_handler->getTokenFromHeader();
if (!$token || !$jwt_handler->validateToken($token)) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        $results = $ahp->getResults();
        echo json_encode([
            "success" => true,
            "data" => $results
        ]);
        break;
        
    case 'DELETE':
        if ($ahp->resetResults()) {
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Results reset successfully"
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Failed to reset results"
            ]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode([
            "success" => false,
            "message" => "Method not allowed"
        ]);
}
?>
