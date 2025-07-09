
-- Database: spk_siswa_berprestasi
-- Struktur tabel untuk sistem SPK Siswa Berprestasi menggunakan metode AHP

-- 1. Tabel untuk menyimpan data siswa
CREATE TABLE students (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    nis VARCHAR(50) NOT NULL UNIQUE,
    class VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_nis (nis),
    INDEX idx_class (class)
);

-- 2. Tabel untuk menyimpan kriteria penilaian
CREATE TABLE criteria (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    weight DECIMAL(10,8) DEFAULT 0.0000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
);

-- 3. Tabel untuk menyimpan nilai siswa per kriteria
CREATE TABLE student_scores (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    criteria_id VARCHAR(36) NOT NULL,
    score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (criteria_id) REFERENCES criteria(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_criteria (student_id, criteria_id),
    INDEX idx_student_id (student_id),
    INDEX idx_criteria_id (criteria_id)
);

-- 4. Tabel untuk menyimpan perbandingan berpasangan kriteria (AHP)
CREATE TABLE criteria_comparison (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    criteria1_id VARCHAR(36) NOT NULL,
    criteria2_id VARCHAR(36) NOT NULL,
    value DECIMAL(10,8) NOT NULL DEFAULT 1.0000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (criteria1_id) REFERENCES criteria(id) ON DELETE CASCADE,
    FOREIGN KEY (criteria2_id) REFERENCES criteria(id) ON DELETE CASCADE,
    UNIQUE KEY unique_criteria_pair (criteria1_id, criteria2_id),
    INDEX idx_criteria1 (criteria1_id),
    INDEX idx_criteria2 (criteria2_id)
);

-- 5. Tabel untuk menyimpan hasil perhitungan AHP
CREATE TABLE ahp_results (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id VARCHAR(36) NOT NULL,
    final_score DECIMAL(10,8) NOT NULL,
    rank INT,
    calculation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_rank (rank),
    INDEX idx_final_score (final_score DESC)
);

-- 6. Tabel untuk manajemen user (authentication)
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(255),
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- 7. Tabel untuk session management
CREATE TABLE user_sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires (expires_at)
);

-- Insert data kriteria default
INSERT INTO criteria (id, name, description, weight) VALUES 
(UUID(), 'Akademik', 'Nilai rata-rata akademik siswa dari semua mata pelajaran', 0.0000),
(UUID(), 'Perilaku', 'Penilaian sikap dan perilaku siswa di sekolah', 0.0000),
(UUID(), 'Prestasi', 'Prestasi yang diraih siswa baik akademik maupun non-akademik', 0.0000),
(UUID(), 'Kepemimpinan', 'Kemampuan kepemimpinan dan organisasi siswa', 0.0000),
(UUID(), 'Kehadiran', 'Tingkat kehadiran dan kedisiplinan siswa', 0.0000);

-- Insert user admin default
INSERT INTO users (id, email, password, username, role) VALUES 
(UUID(), 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'admin');

-- Trigger untuk auto-update timestamp
DELIMITER //
CREATE TRIGGER update_users_timestamp 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//
DELIMITER ;

-- View untuk ranking siswa dengan detail
CREATE VIEW student_ranking AS
SELECT 
    s.id,
    s.name,
    s.nis,
    s.class,
    ar.final_score,
    ar.rank,
    ar.calculation_date,
    (ar.final_score * 100) as percentage_score
FROM students s
JOIN ahp_results ar ON s.id = ar.student_id
ORDER BY ar.rank ASC;

-- View untuk statistik dashboard
CREATE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM students) as total_students,
    (SELECT COUNT(*) FROM criteria WHERE weight > 0) as active_criteria,
    (SELECT COUNT(*) FROM ahp_results) as total_calculations,
    (SELECT COUNT(*) FROM ahp_results WHERE rank <= 3) as top_students;

-- Procedure untuk menghitung ulang ranking setelah perhitungan AHP
DELIMITER //
CREATE PROCEDURE RecalculateRanking()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE student_id_var VARCHAR(36);
    DECLARE rank_counter INT DEFAULT 1;
    
    DECLARE cur CURSOR FOR 
        SELECT student_id 
        FROM ahp_results 
        ORDER BY final_score DESC;
        
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    
    rank_loop: LOOP
        FETCH cur INTO student_id_var;
        IF done THEN
            LEAVE rank_loop;
        END IF;
        
        UPDATE ahp_results 
        SET rank = rank_counter 
        WHERE student_id = student_id_var;
        
        SET rank_counter = rank_counter + 1;
    END LOOP;
    
    CLOSE cur;
END//
DELIMITER ;
