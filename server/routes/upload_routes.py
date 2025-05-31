from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
from services.resume_parser import extract_resume_data

upload_routes = Blueprint('upload_routes', __name__)
UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@upload_routes.route('/api/upload_resume', methods=['POST'])
def upload_resume():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files['file']
    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)
    data = extract_resume_data(filepath)
    return jsonify(data)
