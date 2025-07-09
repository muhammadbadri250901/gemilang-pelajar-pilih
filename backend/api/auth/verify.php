
<?php
require_once '../../config/cors.php';
require_once '../../config/jwt.php';

$jwt_handler = new JWTHandler();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $jwt_handler->getTokenFromHeader();
    
    if ($token) {
        $user_data = $jwt_handler->validateToken($token);
        
        if ($user_data) {
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "data" => $user_data
            ]);
        } else {
            http_response_code(401);
            echo json_encode([
                "success" => false,
                "message" => "Token tidak valid"
            ]);
        }
    } else {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Token tidak ditemukan"
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
