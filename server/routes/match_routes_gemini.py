from flask import Blueprint, request, jsonify
from services.gemini_service import get_gemini_service
import logging

match_routes_gemini = Blueprint('match_routes_gemini', __name__)

@match_routes_gemini.route('/api/match_bullet_to_jd', methods=['POST'])
def match_bullet_to_jd():
    data = request.get_json()
    bullet = data.get("bullet", "")
    jd = data.get("jd", "")

    if not bullet or not jd:
        return jsonify({"error": "Missing bullet or job description"}), 400

    prompt = (
        f"Compare this resume bullet to the following job description, and rewrite it in 3 different ways to better match the job posting. "
        f"Keep each rewrite professional, resume-appropriate, and concise. Output exactly as a numbered list:\n\n"
        f"Resume Bullet:\n{bullet}\n\n"
        f"Job Description:\n{jd}\n\n"
        f"Output format:\n"
        f"1. ...\n2. ...\n3. ..."
    )

    try:
        # Get Gemini service instance
        gemini = get_gemini_service()
        
        # Generate response using Gemini
        suggestions = gemini.generate_response(prompt, temperature=0.7, max_tokens=500)
        
        return jsonify({"suggestions": suggestions.strip()})
        
    except Exception as e:
        logging.error(f"Error in match_bullet_to_jd: {str(e)}")
        return jsonify({"error": f"Error processing request: {str(e)}"}), 500
