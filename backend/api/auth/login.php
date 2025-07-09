
<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../config/jwt.php';
require_once '../../models/User.php';

$database = new Database();
$db = $database->getConnection();
$user = new User($db);
$jwt_handler = new JWTHandler();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->email) && !empty($data->password)) {
        if ($user->login($data->email, $data->password)) {
            $user_data = $user->getUserData();
            $token = $jwt_handler->generateToken($user_data);
            
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "data" => [
                    "token" => $token,
                    "user" => $user_data
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode([
                "success" => false,
                "message" => "Email atau password salah"
            ]);
        }
    } else {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Email dan password harus diisi"
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Method not allowed"
    ]);
}
?>
