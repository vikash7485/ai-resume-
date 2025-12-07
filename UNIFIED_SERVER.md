# ✅ Same Port Setup - Unified Server

## 🎯 Current Configuration

Your app now uses **one URL** (localhost:3000):

- **Frontend**: http://localhost:3000 (main app)
- **Backend API**: http://localhost:3001 (internal - automatically proxied)
- **You access**: http://localhost:3000 only

---

## 🔄 How Requests Work

```
Browser Request
    ↓
localhost:3000 (Frontend)
    ↓
/api/* requests → Proxied to localhost:3001 (Backend)
    ↓
Backend processes and responds
    ↓
Frontend receives and displays
```

**You only use: http://localhost:3000**

---

## 🚀 Running Your App

### Option 1: Use Batch File (Easiest!)

**Double-click:** `START.bat`

This starts both servers automatically!

### Option 2: Manual Start

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```
✅ Backend starts on port 3001

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```
✅ Frontend starts on port 3000

**Then open:** http://localhost:3000

---

## ✅ What's Configured

1. ✅ Frontend runs on **port 3000**
2. ✅ Backend runs on **port 3001** (internal)
3. ✅ Frontend automatically proxies `/api/*` to backend
4. ✅ CORS configured correctly
5. ✅ One URL for everything: **localhost:3000**

---

## 📝 Files Changed

1. `frontend/vite.config.js` - Port 3000, proxy to 3001
2. `backend/server.js` - Port 3001, CORS for 3000
3. `START.bat` - Updated to show correct ports

---

**Everything works from one URL: http://localhost:3000 🎉**


