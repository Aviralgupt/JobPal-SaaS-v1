from flask import Blueprint, request, jsonify
import requests
import json

bulk_match_routes = Blueprint('bulk_match_routes', __name__)

@bulk_match_routes.route('/api/bulk_match_bullets_to_jd', methods=['POST'])
def bulk_match_bullets_to_jd():
    data = request.get_json()
    bullets = data.get("bullets", [])
    jd = data.get("jd", "")

    if not bullets or not jd:
        return jsonify({"error": "Missing bullets or job description"}), 400

    # Build single batch prompt
    prompt = (
        f"You are an expert resume writer. Below is a job description and multiple resume bullets.\n"
        f"Rewrite each bullet to better match the job description. Return only one improved bullet for each input bullet.\n\n"
        f"Job Description:\n{jd}\n\n"
        f"Resume Bullets:\n"
    )

    for idx, bullet in enumerate(bullets, 1):
        prompt += f"{idx}. {bullet}\n"

    prompt += "\nReturn the results as:\n1. Improved bullet 1\n2. Improved bullet 2\n..."

    # Send request to Ollama
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={"model": "mistral", "prompt": prompt},
        timeout=60,
        stream=True  # ✅ important: handle streaming
    )

    response.raise_for_status()

    # Handle streamed response correctly:
    full_output = ""
    for line in response.iter_lines():
        if line:
            obj = json.loads(line.decode('utf-8'))
            full_output += obj.get("response", "")

    full_output = full_output.strip()

    # Parse response into list
    lines = full_output.split('\n')
    improved_bullets = [line.partition('. ')[2].strip() for line in lines if line.strip()]

    return jsonify({"improved_bullets": improved_bullets})
