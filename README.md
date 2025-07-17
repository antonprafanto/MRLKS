# Sistem Penilaian Mobile Robotics LKS 2025 (MRLKS)

Sistem web application untuk penilaian kompetisi robotika mobile berdasarkan standar LKS 2025.

## 🚀 Fitur Utama

- **Manajemen Peserta**: CRUD peserta kompetisi
- **Sistem Penilaian**: 
  - Judgment (3 juri, skala 0-3)
  - Measurement (objektif 0-1)
- **Perhitungan Otomatis**: Real-time scoring dan ranking
- **Dashboard**: Overview statistik kompetisi
- **Reporting**: Ranking dan detail skor peserta
- **Multi-hari**: Mendukung 3 hari kompetisi (C1, C2, C3)

## 📊 Struktur Penilaian

- **Total**: 100 poin
- **Hari 1 (C1)**: 39 poin (Organisasi + Laporan + Konstruksi + Gerakan Dasar)
- **Hari 2 (C2)**: 27 poin (Delivery System)
- **Hari 3 (C3)**: 32 poin (Delivery & Return System)

## 🛠 Teknologi

- **Backend**: Node.js + Express.js
- **Database**: MySQL
- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript
- **API**: RESTful API

## 📦 Instalasi

### Prasyarat
- Node.js (v14 atau lebih baru)
- MySQL (v5.7 atau lebih baru)
- NPM atau Yarn

### Langkah Instalasi

1. **Clone repository**
   ```bash
   git clone https://github.com/antonprafanto/MRLKS.git
   cd MRLKS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Database**
   ```bash
   # Buat database MySQL
   mysql -u root -p
   CREATE DATABASE mobile_robotics_scoring;
   exit
   
   # Setup schema dan data
   npm run setup-db
   ```

4. **Konfigurasi Environment**
   ```bash
   # Buat file .env (opsional)
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=mobile_robotics_scoring
   DB_PORT=3306
   PORT=3000
   ```

5. **Jalankan Server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

6. **Akses Aplikasi**
   - Buka browser: `http://localhost:3000`
   - API Endpoint: `http://localhost:3000/api`

## 🔧 API Endpoints

### Peserta
- `GET /api/peserta` - Get all peserta
- `POST /api/peserta` - Create peserta
- `GET /api/peserta/:id` - Get peserta by ID
- `PUT /api/peserta/:id` - Update peserta
- `DELETE /api/peserta/:id` - Delete peserta
- `GET /api/peserta/search?q=query` - Search peserta

### Scoring
- `GET /api/scoring/master-items` - Get master items
- `POST /api/scoring/judgment` - Save judgment score
- `POST /api/scoring/measurement` - Save measurement score
- `GET /api/scoring/peserta/:id` - Get peserta scores
- `GET /api/scoring/ranking` - Get ranking
- `GET /api/scoring/hari/:hari` - Get scores by hari

## 📱 Panduan Penggunaan

### 1. Tambah Peserta
1. Klik menu "Peserta"
2. Klik "Tambah Peserta"
3. Isi form (ID, Nama Tim, Sekolah)
4. Klik "Simpan"

### 2. Input Penilaian
1. Klik menu "Penilaian"
2. Pilih hari kompetisi (C1/C2/C3)
3. Pilih peserta
4. Isi nilai untuk setiap item:
   - **Judgment**: Input nilai 3 juri (0-3)
   - **Measurement**: Pilih Gagal (0) atau Berhasil (1)
5. Klik "Simpan" pada setiap item

### 3. Lihat Ranking
1. Klik menu "Ranking"
2. Lihat ranking real-time
3. Klik "Detail" untuk melihat breakdown skor

## 🌐 Deployment ke Railway (Recommended)

### Step 1: Setup Railway
1. Daftar di [railway.app](https://railway.app)
2. Connect dengan GitHub account
3. Create new project dari repository ini

### Step 2: Add MySQL Database
1. Klik "Add Service" → "Database" → "MySQL"
2. Tunggu database provisioning selesai

### Step 3: Configure Environment Variables
Set variables berikut di Railway dashboard:
```env
NODE_ENV=production
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_USER=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
DB_NAME=${{MySQL.MYSQL_DATABASE}}
DB_PORT=${{MySQL.MYSQL_PORT}}
PORT=3000
```

### Step 4: Deploy
- Railway akan auto-deploy dari GitHub
- Database akan ter-setup otomatis
- Akses via domain Railway: `https://your-app.up.railway.app`

## 🔐 Security Notes

- Ganti password database default
- Set strong environment variables
- Enable HTTPS di production
- Backup database secara berkala

## 🤝 Support

Jika ada masalah atau pertanyaan:
1. Check dokumentasi API
2. Lihat logs di Railway dashboard
3. Test API endpoints dengan Postman
4. Backup database sebelum perubahan besar

## 📄 License

MIT License - Bebas digunakan untuk kompetisi LKS
