-- SPK Siswa Berprestasi Database Structure
-- MySQL Database

-- Create database
CREATE DATABASE IF NOT EXISTS spk_siswa_berprestasi;
USE spk_siswa_berprestasi;

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: students
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    nis VARCHAR(50) NOT NULL UNIQUE,
    class VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: criteria
CREATE TABLE IF NOT EXISTS criteria (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    weight DECIMAL(10, 4) DEFAULT 0,
    type ENUM('benefit', 'cost') DEFAULT 'benefit',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: criteria_comparisons
CREATE TABLE IF NOT EXISTS criteria_comparisons (
    id VARCHAR(36) PRIMARY KEY,
    criteria1_id VARCHAR(36) NOT NULL,
    criteria2_id VARCHAR(36) NOT NULL,
    comparison_value DECIMAL(10, 4) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (criteria1_id) REFERENCES criteria(id) ON DELETE CASCADE,
    FOREIGN KEY (criteria2_id) REFERENCES criteria(id) ON DELETE CASCADE,
    UNIQUE KEY unique_comparison (criteria1_id, criteria2_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: student_scores
CREATE TABLE IF NOT EXISTS student_scores (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL,
    criteria_id VARCHAR(36) NOT NULL,
    score DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (criteria_id) REFERENCES criteria(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_criteria (student_id, criteria_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: ahp_results
CREATE TABLE IF NOT EXISTS ahp_results (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL,
    final_score DECIMAL(10, 4) NOT NULL,
    ranking INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_result (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user
-- Password: password (hashed with bcrypt)
INSERT INTO users (id, email, username, password, role) VALUES 
(UUID(), 'admin@example.com', 'Administrator', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Insert sample criteria (AHP method)
INSERT INTO criteria (id, code, name, weight, type) VALUES
(UUID(), 'C1', 'Nilai Akademik', 0, 'benefit'),
(UUID(), 'C2', 'Prestasi Non-Akademik', 0, 'benefit'),
(UUID(), 'C3', 'Kehadiran', 0, 'benefit'),
(UUID(), 'C4', 'Perilaku', 0, 'benefit'),
(UUID(), 'C5', 'Kepemimpinan', 0, 'benefit');

-- Insert sample students
INSERT INTO students (id, name, nis, class) VALUES
(UUID(), 'Ahmad Fauzi', '2024001', 'XII IPA 1'),
(UUID(), 'Siti Nurhaliza', '2024002', 'XII IPA 1'),
(UUID(), 'Budi Santoso', '2024003', 'XII IPA 2'),
(UUID(), 'Dewi Lestari', '2024004', 'XII IPS 1'),
(UUID(), 'Eko Prasetyo', '2024005', 'XII IPS 2');

-- Create indexes for better performance
CREATE INDEX idx_students_nis ON students(nis);
CREATE INDEX idx_students_class ON students(class);
CREATE INDEX idx_student_scores_student ON student_scores(student_id);
CREATE INDEX idx_student_scores_criteria ON student_scores(criteria_id);
CREATE INDEX idx_ahp_results_student ON ahp_results(student_id);
CREATE INDEX idx_ahp_results_ranking ON ahp_results(ranking);
CREATE INDEX idx_criteria_code ON criteria(code);
