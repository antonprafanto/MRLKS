-- Database Schema untuk Sistem Penilaian Mobile Robotics LKS 2025

-- Tabel Master Peserta
CREATE TABLE peserta (
    id VARCHAR(50) PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    sekolah VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Master Juri
CREATE TABLE juri (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Master Items (berdasarkan penilaian.md)
CREATE TABLE master_items (
    item_code VARCHAR(10) PRIMARY KEY,
    kategori VARCHAR(10) NOT NULL,
    sub_kategori VARCHAR(10),
    deskripsi TEXT NOT NULL,
    metode VARCHAR(1) NOT NULL, -- J atau M
    bobot INT NOT NULL,
    hari VARCHAR(10) NOT NULL, -- C1, C2, C3
    max_score INT NOT NULL
);

-- Tabel Detail Penilaian Judgment (3 juri, skala 0-3)
CREATE TABLE judgment_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    peserta_id VARCHAR(50) NOT NULL,
    item_code VARCHAR(10) NOT NULL,
    hari VARCHAR(10) NOT NULL,
    juri_1 INT CHECK (juri_1 >= 0 AND juri_1 <= 3),
    juri_2 INT CHECK (juri_2 >= 0 AND juri_2 <= 3),
    juri_3 INT CHECK (juri_3 >= 0 AND juri_3 <= 3),
    rata_rata DECIMAL(3,2),
    bobot INT,
    skor_final DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (peserta_id) REFERENCES peserta(id),
    FOREIGN KEY (item_code) REFERENCES master_items(item_code),
    UNIQUE KEY unique_judgment (peserta_id, item_code)
);

-- Tabel Detail Penilaian Measurement (objektif 0-1)
CREATE TABLE measurement_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    peserta_id VARCHAR(50) NOT NULL,
    item_code VARCHAR(10) NOT NULL,
    hari VARCHAR(10) NOT NULL,
    nilai_ukur INT CHECK (nilai_ukur IN (0, 1)),
    bobot INT,
    skor_final DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (peserta_id) REFERENCES peserta(id),
    FOREIGN KEY (item_code) REFERENCES master_items(item_code),
    UNIQUE KEY unique_measurement (peserta_id, item_code)
);

-- Tabel Summary Skor per Kategori
CREATE TABLE main_score (
    id INT AUTO_INCREMENT PRIMARY KEY,
    peserta_id VARCHAR(50) NOT NULL,
    peserta_name VARCHAR(100),
    kategori VARCHAR(10) NOT NULL, -- A, B, C, D, E1, E2, F1, F2
    hari VARCHAR(10) NOT NULL, -- C1, C2, C3
    skor_diperoleh DECIMAL(5,2) DEFAULT 0,
    skor_maksimal DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (peserta_id) REFERENCES peserta(id),
    UNIQUE KEY unique_category_score (peserta_id, kategori)
);

-- Tabel Audit Trail
CREATE TABLE audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(50),
    record_id VARCHAR(50),
    action VARCHAR(20), -- INSERT, UPDATE, DELETE
    old_values JSON,
    new_values JSON,
    user_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Master Items berdasarkan penilaian.md
INSERT INTO master_items VALUES
-- Kategori A: Organisasi dan Manajemen Kerja (6 poin total)
('A1', 'A', 'A1', 'Organisasi dan manajemen kerja hari 1', 'J', 2, 'C1', 6),
('A2', 'A', 'A2', 'Organisasi dan manajemen kerja hari 2', 'J', 2, 'C2', 6),
('A3', 'A', 'A3', 'Organisasi dan manajemen kerja hari 3', 'J', 2, 'C3', 6),

-- Kategori B: Jurnal/Laporan Teknis (10 poin total)
('B1', 'B', 'B1', 'Desain Rangka Robot', 'J', 2, 'C1', 6),
('B2', 'B', 'B2', 'Pengkabelan Elektronik', 'J', 1, 'C1', 3),
('B3', 'B', 'B3', 'Sensor dan Aktuator', 'J', 1, 'C1', 3),
('B4', 'B', 'B4', 'Sistem Navigasi', 'J', 2, 'C1', 6),
('B5', 'B', 'B5', 'Pemrograman', 'J', 2, 'C1', 6),
('B6', 'B', 'B6', 'Ketepatan Mengumpulkan Sesuai Waktu', 'M', 2, 'C1', 2),

-- Kategori C: Pembuatan dan Perakitan Robot (10 poin total)
('C1', 'C', 'C1', 'Struktur Robot (rangka dan roda)', 'J', 2, 'C1', 6),
('C2', 'C', 'C2', 'Struktur Manajemen Objek (lengan/lifter/gripper)', 'J', 2, 'C1', 6),
('C3', 'C', 'C3', 'Fabrikasi Robot', 'J', 2, 'C1', 6),
('C4', 'C', 'C4', 'Tata Letak Sensor dan Aktuator', 'J', 2, 'C1', 6),
('C5', 'C', 'C5', 'Standar Kerapian Pengkabelan', 'J', 2, 'C1', 6),

-- Kategori D: Gerakan Dasar Robot (15 poin total)
('D1', 'D', 'D1', 'Robot bergerak maju, mundur, ke kiri atau ke kanan', 'M', 1, 'C1', 1),
('D2', 'D', 'D2', 'Robot mendeteksi halangan/dinding kemudian berhenti', 'M', 1, 'C1', 1),
('D3', 'D', 'D3', 'Robot mengikuti garis hitam berbentuk U', 'M', 2, 'C1', 2),
('D4', 'D', 'D4', 'Robot dapat membaca QRCode', 'M', 1, 'C1', 1),
('D5', 'D', 'D5', 'Robot dapat membedakan warna kubus', 'M', 2, 'C1', 2),
('D6', 'D', 'D6', 'Lengan robot mengambil kubus dari rak obat', 'M', 2, 'C1', 2),
('D7', 'D', 'D7', 'Lengan robot meletakkan kubus ke standcube', 'M', 2, 'C1', 2),
('D8', 'D', 'D8', 'Lengan robot mengambil brankar dari penyimpanan', 'M', 2, 'C1', 2),
('D9', 'D', 'D9', 'Lengan robot meletakkan brankar ke penyimpanan', 'M', 2, 'C1', 2),

-- Kategori E1: Sistem Otonom Pre-defined (10 poin total)
('E1K1', 'E1', 'K1', 'QRCode K1 + Menuju Rak + Ambil Kubus', 'M', 3, 'C2', 3),
('E1K2', 'E1', 'K2', 'QRCode K2 + Menuju Rak + Ambil Kubus', 'M', 3, 'C2', 3),
('E1K3', 'E1', 'K3', 'QRCode K3 + Menuju Rak + Ambil Kubus', 'M', 4, 'C2', 4),

-- Kategori E2: Full Sistem Otonom (17 poin total)
('E2K4', 'E2', 'K4', 'QRCode K4 + Menuju Rak + Ambil Kubus', 'M', 5, 'C2', 5),
('E2K5', 'E2', 'K5', 'QRCode K5 + Menuju Rak + Ambil Kubus', 'M', 6, 'C2', 6),
('E2K6', 'E2', 'K6', 'QRCode K6 + Menuju Rak + Ambil Kubus', 'M', 6, 'C2', 6),

-- Kategori F1: Delivery & Return Pre-defined (12 poin total)
('F1K1', 'F1', 'K1', 'Delivery & Return K1', 'M', 4, 'C3', 4),
('F1K2', 'F1', 'K2', 'Delivery & Return K2', 'M', 4, 'C3', 4),
('F1K3', 'F1', 'K3', 'Delivery & Return K3', 'M', 4, 'C3', 4),

-- Kategori F2: Full Delivery & Return (20 poin total)
('F2K4', 'F2', 'K4', 'Full Delivery & Return K4', 'M', 6, 'C3', 6),
('F2K5', 'F2', 'K5', 'Full Delivery & Return K5', 'M', 7, 'C3', 7),
('F2K6', 'F2', 'K6', 'Full Delivery & Return K6', 'M', 7, 'C3', 7);

-- Sample Data Peserta
INSERT INTO peserta VALUES
('P001', 'Tim Robotics SMKN 1 Jakarta', 'SMKN 1 Jakarta'),
('P002', 'Team Alpha SMKN 2 Bandung', 'SMKN 2 Bandung'),
('P003', 'Robot Warriors SMKN 3 Surabaya', 'SMKN 3 Surabaya');

-- Sample Data Juri
INSERT INTO juri (nama, email) VALUES
('Dr. Ahmad Fauzi', 'ahmad.fauzi@email.com'),
('Prof. Siti Nurhaliza', 'siti.nurhaliza@email.com'),
('Ir. Budi Santoso', 'budi.santoso@email.com');