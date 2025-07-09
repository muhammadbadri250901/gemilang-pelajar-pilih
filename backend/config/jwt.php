
<?php
require_once __DIR__ . '/../vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JWTHandler {
    private $secret_key = "your-secret-key-here";
    private $algorithm = "HS256";

    public function generateToken($user_data) {
        $payload = array(
            "iss" => "spk-system",
            "aud" => "spk-users",
            "iat" => time(),
            "exp" => time() + (24 * 60 * 60), // 24 hours
            "data" => $user_data
        );

        return JWT::encode($payload, $this->secret_key, $this->algorithm);
    }

    public function validateToken($token) {
        try {
            $decoded = JWT::decode($token, new Key($this->secret_key, $this->algorithm));
            return $decoded->data;
        } catch (Exception $e) {
            return false;
        }
    }

    public function getTokenFromHeader() {
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            $auth_header = $headers['Authorization'];
            if (preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
                return $matches[1];
            }
        }
        return null;
    }
}
?>
