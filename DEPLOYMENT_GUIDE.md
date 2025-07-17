# Panduan Deployment Railway - Mobile Robotics Scoring

## Langkah 1: Persiapan
Pastikan Anda sudah:
- [x] Punya akun Railway.app
- [x] Railway CLI terinstall (sudah ada versi 4.5.4)
- [x] Konfigurasi sudah siap (railway.json & Procfile)

## Langkah 2: Login & Setup Project

### Metode A: Via Dashboard Railway (Recommended)
1. Buka https://railway.app dan login
2. Klik "New Project" → "Deploy from GitHub repo"
3. Connect GitHub repo atau upload folder project
4. Railway akan auto-detect konfigurasi

### Metode B: Via CLI (Jika sudah login)
```bash
cd mobile-robotics-scoring
railway login
railway init
railway up
```

## Langkah 3: Setup Database MySQL
Di Railway dashboard:
1. Klik "Add Service" → "Database" → "MySQL"
2. Akan mendapat environment variables:
   - MYSQL_URL
   - MYSQL_HOST
   - MYSQL_USER
   - MYSQL_PASSWORD
   - MYSQL_DATABASE

## Langkah 4: Set Environment Variables
Tambahkan variables di Railway:
```
PORT=3000
NODE_ENV=production
DB_HOST=[from MySQL service]
DB_USER=[from MySQL service] 
DB_PASSWORD=[from MySQL service]
DB_NAME=[from MySQL service]
DB_PORT=3306
```

## Langkah 5: Deploy
Railway akan auto-deploy setelah:
- Database setup selesai
- Environment variables configured
- Code pushed/uploaded

## Langkah 6: Testing
Setelah deploy, akses:
- Web App: [railway-domain]/
- API Health: [railway-domain]/api/health
- API Test: [railway-domain]/api/peserta

## Troubleshooting
Jika ada error:
1. Check logs di Railway dashboard
2. Pastikan database connection string benar
3. Pastikan semua environment variables sudah set
4. Check build logs untuk dependency issues

## File Konfigurasi Yang Sudah Siap:
- ✅ `railway.json` - Railway deployment config
- ✅ `Procfile` - Process command
- ✅ `package.json` - Dependencies & scripts
- ✅ `backend/server.js` - Main app file

Sistem siap di-deploy! 🚀