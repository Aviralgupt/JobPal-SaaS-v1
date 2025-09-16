from flask import Blueprint, request, jsonify
from services.gemini_service import get_gemini_service
import logging

ollama_routes_gemini = Blueprint('ollama_routes_gemini', __name__)

@ollama_routes_gemini.route('/api/improve_bullet', methods=['POST'])
def improve_bullet():
    data = request.get_json()
    bullet = data.get("bullet", "")

    if not bullet:
        return jsonify({"error": "Missing bullet"}), 400

    prompt = f"Improve this resume bullet point to sound more professional and impactful. Focus on action verbs, quantifiable results, and clear achievements:\n\n'{bullet}'"

    try:
        # Get Gemini service instance
        gemini = get_gemini_service()
        
        # Generate improved bullet using Gemini
        improved = gemini.generate_response(prompt, temperature=0.6, max_tokens=200)
        
        return jsonify({"improved": improved.strip()})
        
    except Exception as e:
        logging.error(f"Error in improve_bullet: {str(e)}")
        return jsonify({"error": f"Error processing request: {str(e)}"}), 500
