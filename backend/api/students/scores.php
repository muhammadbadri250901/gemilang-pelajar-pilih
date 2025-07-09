
<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../config/jwt.php';
require_once '../../models/StudentScore.php';

$database = new Database();
$db = $database->getConnection();
$student_score = new StudentScore($db);
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
        $scores = $student_score->getAll();
        echo json_encode([
            "success" => true,
            "data" => $scores
        ]);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->scores)) {
            if ($student_score->saveMultiple($data->scores)) {
                http_response_code(200);
                echo json_encode([
                    "success" => true,
                    "message" => "Scores saved successfully"
                ]);
            } else {
                http_response_code(500);
                echo json_encode([
                    "success" => false,
                    "message" => "Failed to save scores"
                ]);
            }
        } else {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "No scores provided"
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
