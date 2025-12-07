# OpenAI API Integration Guide

## 🔐 Security Best Practices

### ✅ DO:
- Store API key in `backend/.env` file (never commit to git)
- Keep `.env` in `.gitignore`
- Call OpenAI API from **backend only** (never from frontend)
- Use environment variables for API keys
- Validate and sanitize all inputs before sending to OpenAI

### ❌ DON'T:
- Never put API key in frontend code
- Never commit `.env` file to git
- Never expose API key in URLs or logs
- Never share API key in screenshots or documentation

---

## 📋 Setup Instructions

### Step 1: Get OpenAI API Key

1. Go to: https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-` or `sk-proj-`)

### Step 2: Add to Backend .env File

Edit `backend/.env`:
```env
OPENAI_API_KEY=sk-proj-your-actual-key-here
OPENAI_MODEL=gpt-4-turbo-preview
```

### Step 3: Verify Integration

The service automatically:
- Checks if API key exists
- Falls back to basic analysis if key is missing
- Never exposes key to frontend

---

## 🔄 How It Works

```
Frontend (React)
    ↓ (HTTP Request - NO API KEY)
Backend API (Node.js/Express)
    ↓ (Uses API Key from .env)
OpenAI Service
    ↓ (Secure API Call)
OpenAI API
    ↓ (Returns Analysis)
Backend Processes Result
    ↓ (Removes sensitive data)
Frontend Receives Safe Data
```

---

## 🛡️ Security Flow

1. **Frontend** uploads resume → Backend API (no API key in request)
2. **Backend** reads API key from `.env` file
3. **Backend** calls OpenAI API securely
4. **Backend** processes response and removes sensitive data
5. **Backend** sends safe analysis to frontend

**API key is NEVER exposed to frontend!**

---

## 📝 Usage Example

```javascript
// In backend/src/services/aiVerification.js
const aiVerification = require('./aiVerification');

// API key is automatically loaded from process.env.OPENAI_API_KEY
const result = await aiVerification.analyzeResume(resumeText, entities);
```

---

## 🔍 Verification

Check if OpenAI is configured:
```javascript
if (aiVerification.isAIConfigured()) {
  console.log("✅ OpenAI is configured");
} else {
  console.log("⚠️ Using fallback analysis");
}
```

---

**Your API key is safe and secure! 🔒**


