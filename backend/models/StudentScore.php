
<?php
class StudentScore {
    private $conn;
    private $table_name = "student_scores";

    public $id;
    public $student_id;
    public $criteria_id;
    public $score;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $query = "SELECT ss.*, s.name as student_name, c.name as criteria_name 
                  FROM " . $this->table_name . " ss
                  JOIN students s ON ss.student_id = s.id
                  JOIN criteria c ON ss.criteria_id = c.id
                  ORDER BY s.name, c.name";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function saveMultiple($scores) {
        try {
            $this->conn->beginTransaction();
            
            foreach ($scores as $score) {
                $query = "INSERT INTO " . $this->table_name . " (id, student_id, criteria_id, score) 
                         VALUES (UUID(), :student_id, :criteria_id, :score)
                         ON DUPLICATE KEY UPDATE score = :score";
                $stmt = $this->conn->prepare($query);
                
                $stmt->bindParam(":student_id", $score['student_id']);
                $stmt->bindParam(":criteria_id", $score['criteria_id']);
                $stmt->bindParam(":score", $score['score']);
                
                $stmt->execute();
            }
            
            $this->conn->commit();
            return true;
        } catch (Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }
}
?>
