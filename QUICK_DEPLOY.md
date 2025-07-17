# 🚀 Quick Deploy ke Railway - 5 Menit!

## Metode 1: One-Click Deploy (Termudah)

### Option A: Deploy Button
Klik tombol ini untuk deploy otomatis:
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/U8oG8B)

### Option B: Manual Deploy
1. **Buka Railway Dashboard**
   - Pergi ke https://railway.app
   - Login dengan GitHub/Google

2. **Create New Project**
   - Klik "New Project"
   - Pilih "Empty Project"

3. **Add Services**
   - Klik "Add Service" → "GitHub Repo" 
   - Connect repo atau upload folder `mobile-robotics-scoring`
   - Klik "Add Service" → "Database" → "MySQL"

4. **Set Environment Variables**
   Pergi ke Service Settings → Variables, tambahkan:
   ```
   PORT=3000
   NODE_ENV=production
   ```
   (Database variables akan auto-generated oleh Railway)

5. **Deploy!**
   Railway akan otomatis build dan deploy

## Metode 2: CLI Deploy (Jika Login Berhasil)

### Jalankan Script Otomatis:
```bash
# Windows
deploy-railway.bat

# atau manual:
railway login
railway init
railway add --database mysql
railway up
```

## 📁 Files Siap Deploy:
- ✅ `package.json` - Dependencies
- ✅ `railway.json` - Railway config  
- ✅ `Procfile` - Start command
- ✅ `backend/server.js` - Main app
- ✅ `backend/setup-database.js` - Auto DB setup
- ✅ `railway-setup.sh` - Post-deploy script

## 🎯 Setelah Deploy:

1. **Get URL** dari Railway dashboard
2. **Test endpoints:**
   - `[url]/` - Frontend
   - `[url]/api/health` - Health check
   - `[url]/api/peserta` - API test

3. **Setup Admin:**
   - Buka frontend
   - Mulai input data peserta
   - Sistem siap pakai!

## 🔧 Troubleshooting:

**Database Error?**
- Railway MySQL butuh waktu 1-2 menit untuk ready
- Check environment variables di Railway dashboard

**Build Error?**  
- Pastikan semua dependencies di package.json
- Check build logs di Railway

**Connection Error?**
- Tunggu 2-3 menit untuk database initialization
- Check health endpoint: `/api/health`

---
**Sistem siap production dalam 5 menit! 🚀**