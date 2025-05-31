from flask import Blueprint, request, jsonify
import requests
import json

match_routes = Blueprint('match_routes', __name__)

@match_routes.route('/api/match_bullet_to_jd', methods=['POST'])
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

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={"model": "mistral", "prompt": prompt},
        stream=True,
        timeout=60
    )
    response.raise_for_status()

    result = ""
    for line in response.iter_lines():
        if line:
            obj = json.loads(line.decode('utf-8'))
            result += obj.get("response", "")

    return jsonify({"suggestions": result.strip()})
