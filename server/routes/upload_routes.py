from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
import json
from services.resume_parser import extract_resume_data

upload_routes = Blueprint('upload_routes', __name__)
UPLOAD_FOLDER = './uploads'
ALLOWED_EXTENSIONS = {'pdf', 'json', 'md', 'markdown', 'txt'}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_file_content(file_path, file_ext):
    """Validate file content based on extension"""
    try:
        if file_ext == 'json':
            with open(file_path, 'r', encoding='utf-8') as f:
                json.load(f)  # Validate JSON format
            return True, "JSON file is valid"
        elif file_ext in ['md', 'markdown', 'txt']:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                if len(content.strip()) < 50:  # Minimum content length
                    return False, "File content is too short for a resume"
                return True, "Text file is valid"
        elif file_ext == 'pdf':
            # PDF validation is handled by pdfplumber
            return True, "PDF file is valid"
        return True, "File format is supported"
    except Exception as e:
        return False, f"File validation failed: {str(e)}"

@upload_routes.route('/api/upload_resume', methods=['POST'])
def upload_resume():
    """Upload and parse resume from various formats"""
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    if not allowed_file(file.filename):
        return jsonify({
            "error": "Unsupported file format",
            "supported_formats": list(ALLOWED_EXTENSIONS),
            "received_format": file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else "unknown"
        }), 400
    
    try:
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # Validate file content
        file_ext = filename.rsplit('.', 1)[1].lower()
        is_valid, validation_message = validate_file_content(filepath, file_ext)
        
        if not is_valid:
            # Clean up invalid file
            os.remove(filepath)
            return jsonify({"error": validation_message}), 400
        
        # Parse resume data
        try:
            data = extract_resume_data(filepath)
            
            # Add file metadata
            data["file_info"] = {
                "filename": filename,
                "format": file_ext,
                "size_bytes": os.path.getsize(filepath),
                "validation": validation_message
            }
            
            return jsonify({
                "success": True,
                "message": f"Resume parsed successfully from {file_ext.upper()} format",
                "data": data
            })
            
        except Exception as parse_error:
            # Clean up file if parsing fails
            os.remove(filepath)
            return jsonify({
                "error": f"Failed to parse resume: {str(parse_error)}",
                "file_format": file_ext,
                "suggestion": "Try uploading a different format or check file content"
            }), 500
            
    except Exception as e:
        return jsonify({"error": f"File upload failed: {str(e)}"}), 500

@upload_routes.route('/api/supported_formats', methods=['GET'])
def get_supported_formats():
    """Get list of supported file formats with descriptions"""
    formats_info = {
        "pdf": {
            "description": "Portable Document Format - Most common resume format",
            "advantages": ["Widely supported", "Maintains formatting", "Professional appearance"],
            "limitations": ["Text extraction can be imperfect", "Larger file size"]
        },
        "json": {
            "description": "JavaScript Object Notation - Structured data format",
            "advantages": ["Perfect parsing", "Structured data", "Easy to process"],
            "limitations": ["Not human-readable", "Requires specific format"]
        },
        "md": {
            "description": "Markdown format - Human-readable with formatting",
            "advantages": ["Human-readable", "Lightweight", "Version control friendly"],
            "limitations": ["Limited formatting", "Less common for resumes"]
        },
        "txt": {
            "description": "Plain text format - Simple and universal",
            "advantages": ["Universal compatibility", "Smallest file size", "Perfect text extraction"],
            "limitations": ["No formatting", "Less professional appearance"]
        }
    }
    
    return jsonify({
        "supported_formats": formats_info,
        "recommendations": {
            "best_for_parsing": ["json", "txt"],
            "best_for_appearance": ["pdf", "md"],
            "most_common": ["pdf"],
            "easiest_to_edit": ["md", "txt"]
        }
    })

@upload_routes.route('/api/resume_template', methods=['GET'])
def get_resume_template():
    """Get a sample resume template in different formats"""
    template = {
        "name": "John Doe",
        "email": "john.doe@email.com",
        "phone": "+1 (555) 123-4567",
        "summary": "Experienced software engineer with 5+ years in full-stack development, specializing in React, Node.js, and cloud technologies.",
        "skills": [
            {
                "category": "Programming Languages",
                "skills": [
                    {"skill": "JavaScript", "confidence": 0.9, "context": "5+ years of experience building web applications"},
                    {"skill": "Python", "confidence": 0.8, "context": "Used for backend development and data processing"}
                ]
            },
            {
                "category": "Web Technologies",
                "skills": [
                    {"skill": "React", "confidence": 0.9, "context": "Primary frontend framework for 3+ years"},
                    {"skill": "Node.js", "confidence": 0.8, "context": "Backend development and API creation"}
                ]
            }
        ],
        "experience": [
            {
                "company": "Tech Corp",
                "title": "Senior Software Engineer",
                "dates": "2021 - Present",
                "bullets": [
                    "Led development of customer portal using React and Node.js",
                    "Improved system performance by 40% through optimization",
                    "Mentored 3 junior developers and conducted code reviews"
                ]
            }
        ],
        "projects": [
            {
                "name": "E-commerce Platform",
                "description": "Full-stack e-commerce solution with payment integration",
                "tech_stack": ["React", "Node.js", "MongoDB", "Stripe"],
                "bullets": [
                    "Built responsive UI with React and Material-UI",
                    "Implemented secure payment processing with Stripe",
                    "Deployed on AWS with CI/CD pipeline"
                ]
            }
        ],
        "education": [
            {
                "degree": "Bachelor of Science",
                "institution": "University of Technology",
                "dates": "2015 - 2019",
                "gpa": "3.8"
            }
        ]
    }
    
    return jsonify({
        "template": template,
        "formats": {
            "json": "Use this exact structure for JSON uploads",
            "md": "Convert to Markdown format for better readability",
            "txt": "Convert to plain text, maintaining structure with clear section headers"
        }
    })
