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

    # Build optimized prompt for faster processing
    prompt = (
        f"Rewrite these resume bullets to match this job description. Return only the improved bullets, one per line:\n\n"
        f"Job: {jd}\n\n"
        f"Bullets:\n"
    )

    for idx, bullet in enumerate(bullets, 1):
        prompt += f"{idx}. {bullet}\n"

    prompt += "\nImproved bullets:"

    try:
        # Use the faster phi3:mini model with optimized parameters
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "phi3:mini",  # Faster, smaller model
                "prompt": prompt,
                "stream": False,  # Disable streaming for faster response
                "options": {
                    "temperature": 0.7,  # Slightly creative but focused
                    "top_p": 0.9,  # Focus on most likely tokens
                    "num_predict": 200  # Limit response length for speed
                }
            },
            timeout=30  # Reduced timeout for faster feedback
        )
        response.raise_for_status()

        # Get the response directly (no streaming)
        data = response.json()
        full_output = data.get("response", "").strip()

        # Parse response into list
        lines = full_output.split('\n')
        improved_bullets = []
        
        for line in lines:
            line = line.strip()
            if line and not line.startswith('Improved bullets:'):
                # Remove numbering if present
                if line[0].isdigit() and '. ' in line:
                    line = line.split('. ', 1)[1]
                improved_bullets.append(line)

        # If parsing failed, return the raw output
        if not improved_bullets:
            improved_bullets = [full_output]

        return jsonify({"improved_bullets": improved_bullets})

    except requests.exceptions.Timeout:
        return jsonify({"error": "AI model is taking too long. Try using a shorter job description or fewer bullets."}), 408
    except requests.exceptions.ConnectionError:
        return jsonify({"error": "Cannot connect to AI model. Make sure Ollama is running with 'ollama serve'."}), 503
    except Exception as e:
        return jsonify({"error": f"Error processing request: {str(e)}"}), 500
