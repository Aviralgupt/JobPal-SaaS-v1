from flask import Blueprint, request, jsonify
import requests
import json

ollama_routes = Blueprint('ollama_routes', __name__)

@ollama_routes.route('/api/improve_bullet', methods=['POST'])
def improve_bullet():
    data = request.get_json()
    bullet = data.get("bullet", "")

    if not bullet:
        return jsonify({"error": "Missing bullet"}), 400

    prompt = f"Improve this resume bullet point to sound more professional:\n\n'{bullet}'"

    try:
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
                data = json.loads(line.decode('utf-8'))
                result += data.get("response", "")

        return jsonify({"improved": result.strip()})

    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500
