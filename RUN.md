# 🚀 Run Your Codebase - Simple Steps

## ✅ Everything is Ready!

- ✅ Dependencies installed
- ✅ .env file created
- ✅ Setup complete

---

## 🎯 Run in 3 Steps

### Step 1: Start MongoDB

Open PowerShell and run:
```powershell
mongod
```

**OR if MongoDB is a Windows service:**
```powershell
net start MongoDB
```

### Step 2: Start Backend

Open a NEW PowerShell window and run:
```powershell
cd "C:\Users\LENOVO\OneDrive\Desktop\AI Resume\backend"
npm run dev
```

Wait for: `✓ Server running on port 3000`

### Step 3: Start Frontend

Open ANOTHER PowerShell window and run:
```powershell
cd "C:\Users\LENOVO\OneDrive\Desktop\AI Resume\frontend"
npm run dev
```

Wait for: `Local: http://localhost:3001/`

---

## 🌐 Open Browser

Go to: **http://localhost:3001**

---

## ⚡ OR Use Batch File (Easiest!)

**Double-click:** `START.bat`

This will open both servers automatically in separate windows!

---

## ✅ Verify It's Running

- Backend: http://localhost:3000/health → Should show `{"status":"ok"}`
- Frontend: http://localhost:3001 → Should show homepage

---

**Your codebase is ready to run! 🎉**


