
<?php
class Criteria {
    private $conn;
    private $table_name = "criteria";

    public $id;
    public $name;
    public $description;
    public $weight;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY name ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function update() {
        $query = "UPDATE " . $this->table_name . " SET weight = :weight WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(":weight", $this->weight);
        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }
}
?>
