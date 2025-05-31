# Resume parsing logic will go here
import pdfplumber
import re

def extract_resume_data(pdf_path):
    data = {
        "name": "",
        "email": "",
        "skills": [],
        "experience": ""
    }

    with pdfplumber.open(pdf_path) as pdf:
        full_text = "\n".join(page.extract_text() or "" for page in pdf.pages)

    # Extract email
    email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', full_text)
    if email_match:
        data["email"] = email_match.group(0)

    # First non-empty line as name
    lines = full_text.splitlines()
    data["name"] = lines[0].strip() if lines else "Unknown"

    # Basic keyword match
    keywords = ["Python", "Java", "C++", "SQL", "HTML", "CSS", "JavaScript"]
    data["skills"] = [kw for kw in keywords if kw.lower() in full_text.lower()]

    # Get experience section
    exp_start = full_text.lower().find("experience")
    if exp_start != -1:
        data["experience"] = full_text[exp_start:exp_start+500]

    return data
