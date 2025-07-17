# Sistem Penilaian Mobile Robotics LKS 2025

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
   git clone <repository-url>
   cd mobile-robotics-scoring
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

## 🌐 Deployment Online

### Opsi 1: Vercel (Recommended untuk Frontend + Serverless)

1. **Persiapan**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   # Ikuti instruksi setup
   ```

3. **Environment Variables**
   - Set di Vercel dashboard:
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

### Opsi 2: Railway (Recommended untuk Full-Stack)

1. **Persiapan**
   - Daftar di [railway.app](https://railway.app)
   - Install Railway CLI

2. **Deploy**
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Database**
   - Add MySQL service di Railway dashboard
   - Set environment variables

### Opsi 3: DigitalOcean App Platform

1. **Persiapan**
   - Push ke GitHub repository
   - Daftar di DigitalOcean

2. **Deploy**
   - Create new App di DigitalOcean
   - Connect GitHub repository
   - Add MySQL database component

### Opsi 4: Heroku

1. **Persiapan**
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Deploy**
   ```bash
   heroku create your-app-name
   heroku addons:create jawsdb:kitefin  # MySQL addon
   git push heroku main
   ```

### Opsi 5: VPS (Manual Setup)

1. **Server Setup (Ubuntu)**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install MySQL
   sudo apt install mysql-server -y
   
   # Install PM2
   npm install -g pm2
   ```

2. **Deploy Application**
   ```bash
   # Clone repository
   git clone <your-repo>
   cd mobile-robotics-scoring
   
   # Install dependencies
   npm install
   
   # Setup database
   npm run setup-db
   
   # Start with PM2
   pm2 start backend/server.js --name "robotics-scoring"
   pm2 startup
   pm2 save
   ```

3. **Setup Nginx (Optional)**
   ```bash
   sudo apt install nginx -y
   sudo nano /etc/nginx/sites-available/robotics-scoring
   ```
   
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 🚀 Rekomendasi Deployment

**Untuk Penggunaan Kompetisi:**
- **Railway** - Mudah setup, database included
- **DigitalOcean** - Stable, good performance
- **VPS** - Full control, custom domain

**Untuk Demo/Testing:**
- **Vercel** - Gratis, cepat deploy
- **Heroku** - Mudah setup

## 📝 Konfigurasi Database Cloud

### Railway MySQL
```env
DB_HOST=containers-us-west-x.railway.app
DB_USER=root
DB_PASSWORD=generated-password
DB_NAME=railway
DB_PORT=6543
```

### JawsDB (Heroku)
```env
JAWSDB_URL=mysql://username:password@hostname:port/database_name
```

## 🔐 Security Notes

- Ganti password database default
- Set strong environment variables
- Enable HTTPS di production
- Backup database secara berkala

## 🤝 Support

Jika ada masalah atau pertanyaan:
1. Check dokumentasi API
2. Lihat logs di server: `pm2 logs`
3. Test API endpoints dengan Postman
4. Backup database sebelum perubahan besar

## 📄 License

MIT License - Bebas digunakan untuk kompetisi LKS