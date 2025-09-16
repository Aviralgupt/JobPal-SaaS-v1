from flask import Flask
from flask_cors import CORS
import os
import sys

# Add the server directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'server'))

# Import Gemini-powered routes
from routes.upload_routes import upload_routes
from routes.ollama_routes_gemini import ollama_routes_gemini
from routes.match_routes_gemini import match_routes_gemini
from routes.bulk_match_routes_gemini import bulk_match_routes_gemini

app = Flask(__name__)

# Configure CORS for Vercel deployment
CORS(app, origins=["*"], methods=["GET", "POST", "OPTIONS"])

# Register blueprints with Gemini-powered routes
app.register_blueprint(upload_routes)
app.register_blueprint(ollama_routes_gemini)
app.register_blueprint(match_routes_gemini)
app.register_blueprint(bulk_match_routes_gemini)

@app.route('/')
def health_check():
    return {"status": "healthy", "message": "JobPal Gemini API is running!"}

@app.route('/api/health')
def api_health():
    """Health check endpoint for monitoring"""
    try:
        # Test if Gemini API key is available
        api_key = os.getenv('GOOGLE_API_KEY')
        if not api_key:
            return {"status": "error", "message": "GOOGLE_API_KEY not configured"}, 500
        
        return {
            "status": "healthy", 
            "message": "JobPal Gemini API is running!",
            "version": "gemini-1.0",
            "api_configured": bool(api_key)
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}, 500

# This is required for Vercel
if __name__ == "__main__":
    app.run()

# Export the app for Vercel
app = app
