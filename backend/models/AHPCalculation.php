
<?php
class AHPCalculation {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function calculateAHP() {
        try {
            // Get all students
            $students_query = "SELECT * FROM students";
            $students_stmt = $this->conn->prepare($students_query);
            $students_stmt->execute();
            $students = $students_stmt->fetchAll();

            // Get criteria weights
            $criteria_query = "SELECT * FROM criteria WHERE weight > 0";
            $criteria_stmt = $this->conn->prepare($criteria_query);
            $criteria_stmt->execute();
            $criteria = $criteria_stmt->fetchAll();

            if (empty($criteria)) {
                throw new Exception("No criteria with weights found");
            }

            // Clear previous results
            $clear_query = "DELETE FROM ahp_results";
            $this->conn->prepare($clear_query)->execute();

            $results = [];

            foreach ($students as $student) {
                $final_score = 0;

                // Get student scores for each criteria
                foreach ($criteria as $criterion) {
                    $score_query = "SELECT score FROM student_scores WHERE student_id = :student_id AND criteria_id = :criteria_id";
                    $score_stmt = $this->conn->prepare($score_query);
                    $score_stmt->bindParam(":student_id", $student['id']);
                    $score_stmt->bindParam(":criteria_id", $criterion['id']);
                    $score_stmt->execute();
                    
                    $score_row = $score_stmt->fetch();
                    $score = $score_row ? $score_row['score'] : 0;
                    
                    // Normalize score (0-1) and multiply by weight
                    $normalized_score = $score / 100;
                    $final_score += $normalized_score * $criterion['weight'];
                }

                $results[] = [
                    'student_id' => $student['id'],
                    'final_score' => $final_score
                ];
            }

            // Sort by final score descending
            usort($results, function($a, $b) {
                return $b['final_score'] <=> $a['final_score'];
            });

            // Insert results with ranks
            foreach ($results as $index => $result) {
                $rank = $index + 1;
                $insert_query = "INSERT INTO ahp_results (id, student_id, final_score, rank) VALUES (UUID(), :student_id, :final_score, :rank)";
                $insert_stmt = $this->conn->prepare($insert_query);
                $insert_stmt->bindParam(":student_id", $result['student_id']);
                $insert_stmt->bindParam(":final_score", $result['final_score']);
                $insert_stmt->bindParam(":rank", $rank);
                $insert_stmt->execute();
            }

            return true;
        } catch (Exception $e) {
            error_log("AHP Calculation Error: " . $e->getMessage());
            return false;
        }
    }

    public function getResults() {
        $query = "SELECT ar.*, s.name, s.nis, s.class 
                  FROM ahp_results ar
                  JOIN students s ON ar.student_id = s.id
                  ORDER BY ar.rank ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        $results = $stmt->fetchAll();
        
        // Format results with criteria scores
        foreach ($results as &$result) {
            $criteria_scores = [];
            $scores_query = "SELECT c.name, ss.score 
                           FROM student_scores ss
                           JOIN criteria c ON ss.criteria_id = c.id
                           WHERE ss.student_id = :student_id";
            $scores_stmt = $this->conn->prepare($scores_query);
            $scores_stmt->bindParam(":student_id", $result['student_id']);
            $scores_stmt->execute();
            
            while ($score_row = $scores_stmt->fetch()) {
                $criteria_scores[$score_row['name']] = (int)$score_row['score'];
            }
            
            $result['student'] = [
                'id' => $result['student_id'],
                'name' => $result['name'],
                'nis' => $result['nis'],
                'class' => $result['class']
            ];
            $result['criteria_scores'] = $criteria_scores;
        }
        
        return $results;
    }

    public function resetResults() {
        $query = "DELETE FROM ahp_results";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute();
    }
}
?>
