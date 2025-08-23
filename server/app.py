from flask import Flask
from flask_cors import CORS
from routes.upload_routes import upload_routes
from routes.ollama_routes import ollama_routes
from routes.match_routes import match_routes
from routes.bulk_match_routes import bulk_match_routes  # ✅ new import

app = Flask(__name__)    # ✅ moved up here
CORS(app, origins=["http://localhost:3000", "http://192.168.0.114:3000"], methods=["GET", "POST", "OPTIONS"])

app.register_blueprint(upload_routes)
app.register_blueprint(ollama_routes)
app.register_blueprint(match_routes)
app.register_blueprint(bulk_match_routes)  # ✅ register new blueprint

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')
