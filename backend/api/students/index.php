
<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../config/jwt.php';
require_once '../../models/Student.php';

$database = new Database();
$db = $database->getConnection();
$student = new Student($db);
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
        $students = $student->getAll();
        echo json_encode([
            "success" => true,
            "data" => $students
        ]);
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        
        if (!empty($data->name) && !empty($data->nis) && !empty($data->class)) {
            $student->name = $data->name;
            $student->nis = $data->nis;
            $student->class = $data->class;
            
            if ($student->create()) {
                http_response_code(201);
                echo json_encode([
                    "success" => true,
                    "message" => "Student created successfully"
                ]);
            } else {
                http_response_code(500);
                echo json_encode([
                    "success" => false,
                    "message" => "Failed to create student"
                ]);
            }
        } else {
            http_response_code(400);
            echo json_encode([
                "success" => false,
                "message" => "Incomplete data"
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
