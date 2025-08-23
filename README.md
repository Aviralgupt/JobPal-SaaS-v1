# 🚀 JobPal - AI Resume Bullet Optimizer

> Built by Aviral Gupta  
> Connect with me: [LinkedIn](https://www.linkedin.com/in/aviral-gupt/)

---

## 🎯 What is this?

JobPal uses AI-powered large language models (LLMs) running fully locally via Ollama to help rewrite your resume bullet points for specific job descriptions — no data leaves your machine.

**Perfect for demos!** Show how AI can transform generic resume bullets into targeted, job-specific achievements using industry-standard formats like STAR and XYZ.

---

## ✨ New Enhanced Features

### 🎯 **Multi-Format Resume Support**
- **PDF**: Traditional resume format with OCR text extraction
- **JSON**: Structured data for perfect parsing and processing
- **Markdown**: Human-readable with formatting support
- **Plain Text**: Universal compatibility with perfect text extraction

### 🚀 **Enhanced Skills Detection**
- **200+ Specialized Skills** across 10+ categories
- **Programming Languages**: Python, Java, JavaScript, C++, Rust, Go, and more
- **Web Technologies**: React, Vue, Angular, Node.js, Django, Flask
- **Cloud Platforms**: AWS, Azure, Google Cloud, DigitalOcean
- **DevOps Tools**: Docker, Kubernetes, Jenkins, Terraform
- **Data Science**: Pandas, TensorFlow, PyTorch, Jupyter
- **AI/ML Tools**: OpenAI API, Hugging Face, LangChain, Ollama
- **Confidence Scoring** based on context and usage

### 📊 **Dynamic Experience Parsing**
- **Smart Section Detection** instead of hardcoded character limits
- **Project-Based Organization** for better storytelling
- **Experience Bundling** by role, company, or project
- **Impact Statement Extraction** for quantifiable achievements

### 🏆 **Professional Resume Formats**
- **STAR Method**: Situation, Task, Action, Result
- **XYZ Format**: Accomplished X by implementing Y, which resulted in Z
- **Project Narratives**: Compelling stories that impress HR managers
- **Bullet Bundling**: Group related achievements for better impact

---

## 🔧 Tech Stack

- **Frontend**: React 18 + Tailwind CSS
- **Backend**: Flask + Python
- **AI**: Ollama + Phi-3 Mini (local LLM model)
- **Resume Parsing**: PDFPlumber + Custom NLP
- **100% Free & Private** - zero cloud cost

---

## 🚀 Quick Demo Setup

### Prerequisites
1. **Python 3.8+** installed
2. **Node.js 16+** installed  
3. **Ollama** installed and running locally

### 1️⃣ Install Ollama & Phi-3 Mini Model
```bash
# Install Ollama from https://ollama.ai/
# Then pull the faster Phi-3 Mini model:
ollama pull phi3:mini
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

### **Enhanced Demo Flow:**
1. **Open the app** - Show the clean, professional interface
2. **Click "🎯 Load Demo Data"** - Instantly populate with sample data
3. **Explain the concept** - "This AI tool rewrites resume bullets to match any job description using professional formats like STAR and XYZ"
4. **Show format options** - Demonstrate STAR vs XYZ vs Standard formatting
5. **Click "🚀 Match Resume to Job"** - Show the AI processing with structure selection
6. **Display results** - Show how bullets were transformed with proper formatting
7. **Highlight project bundling** - Show how related achievements are grouped together

### **New Demo Talking Points:**
- **Multi-Format Support**: "Upload PDF, JSON, Markdown, or plain text resumes"
- **Enhanced Skills**: "Detects 200+ specialized skills with confidence scoring"
- **Professional Formats**: "Uses STAR and XYZ methods preferred by HR managers"
- **Project Bundling**: "Groups related achievements into compelling narratives"
- **Privacy**: "Everything runs locally on your machine - no data sent to the cloud"
- **AI Power**: "Uses advanced language models to understand job requirements"
- **Efficiency**: "Transform generic bullets into targeted achievements in seconds"
- **Cost**: "100% free - no API costs or subscriptions"

### **Sample Demo Data Included:**
- **Resume Bullets**: Team management, traffic increase, system implementation
- **Job Description**: Software Engineer role requiring leadership and technical skills
- **Format Options**: STAR, XYZ, and Standard formatting
- **Project Context**: E-commerce platform development

---

## 🛠️ Development

### Project Structure
```
JobPal/
├── client/          # React frontend
├── server/          # Flask backend
│   ├── routes/      # API endpoints
│   │   ├── bulk_match_routes.py    # Enhanced matching with STAR/XYZ
│   │   ├── upload_routes.py        # Multi-format resume upload
│   │   └── user_routes.py          # User management
│   ├── models/      # Data models
│   ├── services/    # Business logic
│   │   └── resume_parser.py        # Enhanced parsing engine
│   └── uploads/     # File storage
└── README.md
```

### Key Features
- ✅ **Multi-Format Support**: PDF, JSON, MD, TXT
- ✅ **Enhanced Skills Detection**: 200+ skills with confidence scoring
- ✅ **Dynamic Experience Parsing**: Smart section detection
- ✅ **Professional Formats**: STAR, XYZ, and Standard methods
- ✅ **Project Bundling**: Group achievements by project/experience
- ✅ **Local AI**: Ollama integration for privacy
- ✅ **Error Handling**: Graceful error messages
- ✅ **Demo Mode**: One-click sample data loading
- ✅ **Responsive UI**: Works on all devices

---

## 📁 Supported File Formats

### **JSON (Recommended for Best Results)**
```json
{
  "name": "John Doe",
  "skills": [
    {
      "category": "Programming Languages",
      "skills": [
        {"skill": "Python", "confidence": 0.9, "context": "5+ years experience"}
      ]
    }
  ],
  "experience": [
    {
      "company": "Tech Corp",
      "title": "Senior Engineer",
      "bullets": ["Led team of 5 developers", "Improved performance by 40%"]
    }
  ]
}
```

### **Markdown**
```markdown
# John Doe
## Skills
- **Python**: 5+ years experience
- **React**: Frontend development

## Experience
### Senior Engineer at Tech Corp
- Led team of 5 developers
- Improved performance by 40%
```

### **Plain Text**
```
John Doe
Skills: Python (5+ years), React (frontend)
Experience: Senior Engineer at Tech Corp
- Led team of 5 developers
- Improved performance by 40%
```

### **PDF**
Traditional resume format with automatic text extraction

---

## 🔍 Troubleshooting

### Common Issues:
1. **"Connection refused"** → Make sure Ollama is running (`ollama serve`)
2. **"Model not found"** → Run `ollama pull phi3:mini`
3. **Frontend won't start** → Check Node.js version and run `npm install`
4. **File upload errors** → Check file format and size (max 10MB)

### Port Conflicts:
- Backend: Change port in `server/app.py` (line 18)
- Frontend: Change port in `client/package.json` scripts

### Model Performance:
- **phi3:mini**: Fastest, good for demos (default)
- **mistral**: Slower but higher quality
- **llama3.2**: Balanced speed/quality

---

## 🎉 Ready for Enhanced Demo!

Your JobPal app now includes:
- ✨ **Multi-format resume support** for maximum compatibility
- 🎯 **Enhanced skills detection** with 200+ specialized skills
- 📊 **Dynamic experience parsing** with smart section detection
- 🏆 **Professional STAR/XYZ formatting** preferred by HR managers
- 📦 **Project bundling** for compelling achievement narratives
- 💡 **Confidence scoring** for skill relevance
- 📱 **Responsive design** for any device

**Perfect for showcasing advanced AI capabilities in interviews, presentations, or client meetings!**

---

## 🔮 Future Enhancements

- **Resume Templates**: Pre-built templates for different industries
- **ATS Optimization**: Ensure resumes pass Applicant Tracking Systems
- **Interview Prep**: Generate potential interview questions from resume
- **Career Path Analysis**: Suggest skill development based on job requirements
- **Multi-language Support**: Parse resumes in different languages
