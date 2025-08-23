# 🚀 JobPal - AI Resume Bullet Optimizer

> Built by Aviral Gupta  

---

## 🎯 What is this?

JobPal uses AI-powered large language models (LLMs) running fully locally via Ollama to help rewrite your resume bullet points for specific job descriptions — no data leaves your machine.

**Perfect for demos!** Show how AI can transform generic resume bullets into targeted, job-specific achievements.

---

## 🔧 Tech Stack

- **Frontend**: React 18 + Tailwind CSS
- **Backend**: Flask + Python
- **AI**: Ollama + Mistral (local LLM model)
- **100% Free & Private** - zero cloud cost

---

## 🚀 Quick Demo Setup

### Prerequisites
1. **Python 3.8+** installed
2. **Node.js 16+** installed  
3. **Ollama** installed and running locally

### 1️⃣ Install Ollama & Mistral Model
```bash
# Install Ollama from https://ollama.ai/
# Then pull the Mistral model:
ollama pull mistral
```

### 2️⃣ Start the Backend
```bash
cd server
pip install -r requirements.txt
python app.py
```
✅ Server will run on `http://localhost:5000`

### 3️⃣ Start the Frontend
```bash
cd client
npm install
npm start
```
✅ App will open on `http://localhost:3000`

---

## 🎭 Demo Instructions

### **Demo Flow:**
1. **Open the app** - Show the clean, professional interface
2. **Click "🎯 Load Demo Data"** - Instantly populate with sample data
3. **Explain the concept** - "This AI tool rewrites resume bullets to match any job description"
4. **Click "🚀 Match Resume to Job"** - Show the AI processing
5. **Display results** - Show how bullets were transformed to be more relevant

### **Demo Talking Points:**
- **Privacy**: "Everything runs locally on your machine - no data sent to the cloud"
- **AI Power**: "Uses advanced language models to understand job requirements"
- **Efficiency**: "Transform generic bullets into targeted achievements in seconds"
- **Cost**: "100% free - no API costs or subscriptions"

### **Sample Demo Data Included:**
- **Resume Bullets**: Team management, traffic increase, system implementation
- **Job Description**: Software Engineer role requiring leadership and technical skills

---

## 🛠️ Development

### Project Structure
```
JobPal/
├── client/          # React frontend
├── server/          # Flask backend
│   ├── routes/      # API endpoints
│   ├── models/      # Data models
│   └── services/    # Business logic
└── README.md
```

### Key Features
- ✅ **Bulk Processing**: Handle multiple resume bullets at once
- ✅ **Local AI**: Ollama integration for privacy
- ✅ **Error Handling**: Graceful error messages
- ✅ **Demo Mode**: One-click sample data loading
- ✅ **Responsive UI**: Works on all devices

---

## 🔍 Troubleshooting

### Common Issues:
1. **"Connection refused"** → Make sure Ollama is running (`ollama serve`)
2. **"Model not found"** → Run `ollama pull mistral`
3. **Frontend won't start** → Check Node.js version and run `npm install`

### Port Conflicts:
- Backend: Change port in `server/app.py` (line 18)
- Frontend: Change port in `client/package.json` scripts

---

## 🎉 Ready for Demo!

Your JobPal app is now optimized for demos with:
- ✨ Professional UI with clear instructions
- 🎯 One-click demo data loading
- 🚀 Smooth AI processing experience
- 💡 Clear error messages and guidance
- 📱 Responsive design for any device

**Perfect for showcasing AI capabilities in interviews, presentations, or client meetings!**
