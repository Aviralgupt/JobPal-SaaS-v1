from flask import Blueprint, request, jsonify
import requests
import json
import re

bulk_match_routes = Blueprint('bulk_match_routes', __name__)

@bulk_match_routes.route('/api/bulk_match_bullets_to_jd', methods=['POST'])
def bulk_match_bullets_to_jd():
    data = request.get_json()
    bullets = data.get("bullets", [])
    jd = data.get("jd", "")
    structure_type = data.get("structure", "standard")  # standard, star, xyz
    project_context = data.get("project_context", "")  # For bundling bullets by project

    if not bullets or not jd:
        return jsonify({"error": "Missing bullets or job description"}), 400

    # Build optimized prompt for faster processing with structure guidance
    prompt = _build_structured_prompt(bullets, jd, structure_type, project_context)

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
                    "num_predict": 300  # Increased for structured responses
                }
            },
            timeout=30  # Reduced timeout for faster feedback
        )
        response.raise_for_status()

        # Get the response directly (no streaming)
        response_data = response.json()
        full_output = response_data.get("response", "").strip()

        # Parse response based on structure type
        improved_bullets = _parse_structured_response(full_output, structure_type)

        # If parsing failed, return the raw output
        if not improved_bullets:
            improved_bullets = [full_output]

        return jsonify({
            "improved_bullets": improved_bullets,
            "structure_used": structure_type,
            "project_context": project_context,
            "original_count": len(bullets),
            "improved_count": len(improved_bullets)
        })

    except requests.exceptions.Timeout:
        return jsonify({"error": "AI model is taking too long. Try using a shorter job description or fewer bullets."}), 408
    except requests.exceptions.ConnectionError:
        return jsonify({"error": "Cannot connect to AI model. Make sure Ollama is running with 'ollama serve'."}), 503
    except Exception as e:
        return jsonify({"error": f"Error processing request: {str(e)}"}), 500

@bulk_match_routes.route('/api/match_structured_resume', methods=['POST'])
def match_structured_resume():
    """Match structured resume data to job description with enhanced formatting"""
    data = request.get_json()
    resume_data = data.get("resume_data", {})
    jd = data.get("jd", "")
    structure_type = data.get("structure", "star")  # star, xyz, hybrid
    focus_areas = data.get("focus_areas", [])  # Specific areas to focus on

    if not resume_data or not jd:
        return jsonify({"error": "Missing resume data or job description"}), 400

    try:
        # Extract and organize bullets by category
        organized_bullets = _organize_resume_bullets(resume_data)
        
        # Match each category to the job description
        matched_results = {}
        
        for category, bullets in organized_bullets.items():
            if bullets:
                category_prompt = _build_category_prompt(category, bullets, jd, structure_type, focus_areas)
                
                response = requests.post(
                    "http://localhost:11434/api/generate",
                    json={
                        "model": "phi3:mini",
                        "prompt": category_prompt,
                        "stream": False,
                        "options": {
                            "temperature": 0.6,
                            "top_p": 0.9,
                            "num_predict": 250
                        }
                    },
                    timeout=25
                )
                response.raise_for_status()
                
                response_data = response.json()
                category_output = response_data.get("response", "").strip()
                
                # Parse the structured response
                matched_bullets = _parse_structured_response(category_output, structure_type)
                matched_results[category] = {
                    "original_bullets": bullets,
                    "improved_bullets": matched_bullets,
                    "count": len(matched_bullets)
                }
        
        return jsonify({
            "success": True,
            "structure_used": structure_type,
            "focus_areas": focus_areas,
            "results": matched_results,
            "summary": {
                "total_categories": len(matched_results),
                "total_improved_bullets": sum(len(result["improved_bullets"]) for result in matched_results.values())
            }
        })

    except Exception as e:
        return jsonify({"error": f"Error processing structured resume: {str(e)}"}), 500

@bulk_match_routes.route('/api/bundle_bullets_by_project', methods=['POST'])
def bundle_bullets_by_project():
    """Bundle and organize bullets by project/experience for better storytelling"""
    data = request.get_json()
    resume_data = data.get("resume_data", {})
    jd = data.get("jd", "")
    bundling_strategy = data.get("strategy", "project")  # project, experience, skill

    if not resume_data or not jd:
        return jsonify({"error": "Missing resume data or job description"}), 400

    try:
        # Bundle bullets based on strategy
        bundled_bullets = _bundle_bullets_by_strategy(resume_data, bundling_strategy)
        
        # Create project narratives
        project_narratives = []
        
        for bundle in bundled_bullets:
            narrative_prompt = _build_narrative_prompt(bundle, jd)
            
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "phi3:mini",
                    "prompt": narrative_prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "top_p": 0.9,
                        "num_predict": 200
                    }
                },
                timeout=20
            )
            response.raise_for_status()
            
            response_data = response.json()
            narrative = response_data.get("response", "").strip()
            
            project_narratives.append({
                "project_name": bundle.get("name", "Unknown Project"),
                "original_bullets": bundle.get("bullets", []),
                "narrative": narrative,
                "skills_used": bundle.get("skills", []),
                "impact": bundle.get("impact", "")
            })
        
        return jsonify({
            "success": True,
            "bundling_strategy": bundling_strategy,
            "project_narratives": project_narratives,
            "total_projects": len(project_narratives)
        })

    except Exception as e:
        return jsonify({"error": f"Error bundling bullets: {str(e)}"}), 500

def _build_structured_prompt(bullets, jd, structure_type, project_context):
    """Build prompt based on desired structure type"""
    
    structure_guidance = {
        "standard": "Rewrite these resume bullets to match the job description. Focus on relevance and impact.",
        "star": "Rewrite these resume bullets using the STAR method (Situation, Task, Action, Result). Each bullet should clearly show the context, what you did, and the outcome.",
        "xyz": "Rewrite these resume bullets using the XYZ format: 'Accomplished X by implementing Y, which resulted in Z.' Focus on achievements and quantifiable results."
    }
    
    project_context_text = f"\nProject Context: {project_context}" if project_context else ""
    
    prompt = (
        f"{structure_guidance.get(structure_type, structure_guidance['standard'])}\n\n"
        f"Job Description: {jd}\n"
        f"{project_context_text}\n\n"
        f"Resume Bullets:\n"
    )

    for idx, bullet in enumerate(bullets, 1):
        prompt += f"{idx}. {bullet}\n"

    prompt += f"\nImproved bullets using {structure_type.upper()} format:"
    
    return prompt

def _build_category_prompt(category, bullets, jd, structure_type, focus_areas):
    """Build prompt for specific category matching"""
    
    focus_text = f"\nFocus Areas: {', '.join(focus_areas)}" if focus_areas else ""
    
    prompt = (
        f"Rewrite these {category} resume bullets to match the job description using {structure_type.upper()} format.\n"
        f"Job Description: {jd}\n"
        f"{focus_text}\n\n"
        f"{category} Bullets:\n"
    )
    
    for idx, bullet in enumerate(bullets, 1):
        prompt += f"{idx}. {bullet}\n"
    
    prompt += f"\nImproved {category} bullets:"
    
    return prompt

def _build_narrative_prompt(bundle, jd):
    """Build prompt for creating project narratives"""
    
    prompt = (
        f"Create a compelling narrative for this project that would impress HR managers.\n"
        f"Job Description: {jd}\n\n"
        f"Project: {bundle.get('name', 'Unknown')}\n"
        f"Skills Used: {', '.join(bundle.get('skills', []))}\n"
        f"Original Bullets:\n"
    )
    
    for bullet in bundle.get("bullets", []):
        prompt += f"• {bullet}\n"
    
    prompt += "\nCreate a 2-3 sentence narrative that tells the story of this project:"
    
    return prompt

def _parse_structured_response(response_text, structure_type):
    """Parse AI response based on structure type"""
    
    lines = response_text.split('\n')
    improved_bullets = []
    
    for line in lines:
        line = line.strip()
        if not line or line.startswith('Improved bullets:') or line.startswith('Improved'):
            continue
            
        # Remove numbering if present
        if line[0].isdigit() and '. ' in line:
            line = line.split('. ', 1)[1]
        
        # Clean up structure markers if present
        if structure_type == "star":
            line = re.sub(r'^(Situation|Task|Action|Result):\s*', '', line, flags=re.IGNORECASE)
        elif structure_type == "xyz":
            line = re.sub(r'^(Accomplished|Delivered|Improved|Achieved|Developed|Implemented|Managed|Led|Created|Built):\s*', '', line, flags=re.IGNORECASE)
        
        if line:
            improved_bullets.append(line)
    
    return improved_bullets

def _organize_resume_bullets(resume_data):
    """Organize resume bullets by category"""
    
    organized = {
        "experience": [],
        "projects": [],
        "skills": [],
        "achievements": []
    }
    
    # Extract experience bullets
    for exp in resume_data.get("experience", []):
        organized["experience"].extend(exp.get("bullets", []))
    
    # Extract project bullets
    for project in resume_data.get("projects", []):
        organized["projects"].extend(project.get("bullets", []))
    
    # Extract skill-related achievements
    for skill_category in resume_data.get("skills", []):
        for skill in skill_category.get("skills", []):
            if skill.get("context"):
                organized["skills"].append(skill["context"])
    
    # Extract other achievements
    # This could include awards, certifications, etc.
    
    return organized

def _bundle_bullets_by_strategy(resume_data, strategy):
    """Bundle bullets based on specified strategy"""
    
    if strategy == "project":
        return _bundle_by_project(resume_data)
    elif strategy == "experience":
        return _bundle_by_experience(resume_data)
    elif strategy == "skill":
        return _bundle_by_skill(resume_data)
    else:
        return _bundle_by_project(resume_data)  # Default

def _bundle_by_project(resume_data):
    """Bundle bullets by project"""
    
    bundles = []
    
    for project in resume_data.get("projects", []):
        bundle = {
            "name": project.get("name", "Unknown Project"),
            "bullets": project.get("bullets", []),
            "skills": project.get("tech_stack", []),
            "description": project.get("description", ""),
            "impact": _extract_impact_from_bullets(project.get("bullets", []))
        }
        bundles.append(bundle)
    
    return bundles

def _bundle_by_experience(resume_data):
    """Bundle bullets by work experience"""
    
    bundles = []
    
    for exp in resume_data.get("experience", []):
        bundle = {
            "name": f"{exp.get('title', 'Unknown Role')} at {exp.get('company', 'Unknown Company')}",
            "bullets": exp.get("bullets", []),
            "skills": _extract_skills_from_bullets(exp.get("bullets", [])),
            "description": f"{exp.get('title', 'Role')} from {exp.get('dates', 'Unknown Period')}",
            "impact": _extract_impact_from_bullets(exp.get("bullets", []))
        }
        bundles.append(bundle)
    
    return bundles

def _bundle_by_skill(resume_data):
    """Bundle bullets by skill category"""
    
    bundles = []
    
    for skill_category in resume_data.get("skills", []):
        category_name = skill_category.get("category", "Unknown Skills")
        skills = skill_category.get("skills", [])
        
        if skills:
            bundle = {
                "name": f"{category_name} Skills",
                "bullets": [skill.get("context", "") for skill in skills if skill.get("context")],
                "skills": [skill.get("skill", "") for skill in skills],
                "description": f"Skills in {category_name.lower()}",
                "impact": "Technical expertise and proficiency"
            }
            bundles.append(bundle)
    
    return bundles

def _extract_impact_from_bullets(bullets):
    """Extract impact statements from bullets"""
    
    impact_keywords = ["increased", "improved", "reduced", "achieved", "delivered", "resulted in", "led to"]
    impact_bullets = []
    
    for bullet in bullets:
        bullet_lower = bullet.lower()
        if any(keyword in bullet_lower for keyword in impact_keywords):
            impact_bullets.append(bullet)
    
    return impact_bullets

def _extract_skills_from_bullets(bullets):
    """Extract mentioned skills from bullets"""
    
    # This would use the skills database from the parser
    # For now, return empty list
    return []
