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

@bulk_match_routes.route('/api/match_entire_resume', methods=['POST'])
def match_entire_resume():
    """Match entire parsed resume to job description - FAST VERSION"""
    print("=== match_entire_resume called (FAST VERSION) ===")
    data = request.get_json()
    resume_data = data.get("resume_data", {})
    jd = data.get("jd", "")
    structure_type = data.get("structure", "star")  # star, xyz, standard
    focus_areas = data.get("focus_areas", [])  # Specific areas to focus on

    if not resume_data or not jd:
        return jsonify({"error": "Missing resume data or job description"}), 400

    try:
        print("=== Starting bullet extraction ===")
        # Extract ALL bullets from the parsed resume
        all_bullets = _extract_all_bullets_from_resume(resume_data)
        print(f"Extracted {len(all_bullets)} bullets")
        
        if not all_bullets:
            return jsonify({"error": "No bullets found in resume data"}), 400

        # FAST APPROACH: Process all bullets in ONE request instead of chunking
        print("=== Processing all bullets in single request ===")
        
        # Build a comprehensive but concise prompt
        prompt = _build_fast_resume_prompt(all_bullets, jd, structure_type)
        
        try:
            # Single AI request with optimized parameters
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "phi3:mini",
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.5,  # More focused
                        "top_p": 0.8,
                        "num_predict": 150  # Reduced for speed
                    }
                },
                timeout=15  # Much shorter timeout
            )
            
            response_data = response.json()
            output = response_data.get("response", "").strip()
            
            # Parse the response
            improved_bullets = _parse_fast_response(output, structure_type)
            
            # If AI failed, use original bullets
            if not improved_bullets or len(improved_bullets) < len(all_bullets) * 0.5:
                print("AI response insufficient, using original bullets")
                improved_bullets = all_bullets
            
            print(f"Successfully processed: {len(improved_bullets)} bullets")
            
        except Exception as ai_error:
            print(f"AI processing failed: {ai_error}, using original bullets")
            improved_bullets = all_bullets
        
        # Organize results back into resume structure
        improved_results = _organize_bullets_into_resume(improved_bullets, resume_data)
        
        return jsonify({
            "success": True,
            "structure_used": structure_type,
            "focus_areas": focus_areas,
            "original_resume": resume_data,
            "improved_results": improved_results,
            "summary": {
                "total_original_bullets": len(all_bullets),
                "total_improved_bullets": len(improved_bullets),
                "sections_processed": list(improved_results.keys())
            }
        })

    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error in match_entire_resume: {str(e)}")
        print(f"Traceback: {error_details}")
        return jsonify({"error": f"Error processing entire resume: {str(e)}"}), 500

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

def _extract_all_bullets_from_resume(resume_data):
    """Extract ALL bullets from the parsed resume data"""
    all_bullets = []
    
    # Extract experience bullets
    for exp in resume_data.get("experience", []):
        all_bullets.extend(exp.get("bullets", []))
    
    # Extract project bullets
    for project in resume_data.get("projects", []):
        all_bullets.extend(project.get("bullets", []))
    
    # Extract skill-related achievements
    for skill_category in resume_data.get("skills", []):
        for skill in skill_category.get("skills", []):
            if skill.get("context"):
                all_bullets.append(skill["context"])
    
    # Extract education achievements
    for edu in resume_data.get("education", []):
        if edu.get("text"):
            all_bullets.append(edu["text"])
    
    return all_bullets

def _build_comprehensive_resume_prompt(resume_data, all_bullets, jd, structure_type, focus_areas):
    """Build comprehensive prompt for entire resume processing"""
    
    structure_guidance = {
        "standard": "Rewrite these resume bullets to match the job description. Focus on relevance and impact.",
        "star": "Rewrite these resume bullets using the STAR method (Situation, Task, Action, Result). Each bullet should clearly show the context, what you did, and the outcome.",
        "xyz": "Rewrite these resume bullets using the XYZ format: 'Accomplished X by implementing Y, which resulted in Z.' Focus on achievements and quantifiable results."
    }
    
    focus_text = f"\nFocus Areas: {', '.join(focus_areas)}" if focus_areas else ""
    
    # Build comprehensive prompt
    prompt = (
        f"Rewrite this entire resume to match the job description using {structure_type.upper()} format.\n\n"
        f"Job Description: {jd}\n"
        f"{focus_text}\n\n"
        f"Resume Summary:\n"
        f"Name: {resume_data.get('name', 'Unknown')}\n"
        f"Summary: {resume_data.get('summary', 'No summary provided')}\n\n"
        f"Skills Detected: {_format_skills_summary(resume_data.get('skills', []))}\n\n"
        f"All Resume Bullets ({len(all_bullets)} total):\n"
    )
    
    for idx, bullet in enumerate(all_bullets, 1):
        prompt += f"{idx}. {bullet}\n"
    
    prompt += f"\n{structure_guidance.get(structure_type, structure_guidance['standard'])}\n"
    prompt += f"Rewrite ALL bullets using {structure_type.upper()} format, maintaining the same number of bullets:\n"
    
    return prompt

def _format_skills_summary(skills_data):
    """Format skills data for prompt"""
    if not skills_data:
        return "No skills detected"
    
    summary = []
    for category in skills_data:
        category_name = category.get("category", "Unknown")
        skill_count = len(category.get("skills", []))
        summary.append(f"{category_name}: {skill_count} skills")
    
    return "; ".join(summary)

def _parse_comprehensive_response(response_text, structure_type, original_resume):
    """Parse comprehensive AI response and organize by section"""
    
    lines = response_text.split('\n')
    improved_bullets = []
    
    # Parse the improved bullets
    for line in lines:
        line = line.strip()
        if not line or line.startswith('Improved') or line.startswith('Rewrite'):
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
    
    # Organize improved bullets back into resume structure
    organized_results = {
        "experience": [],
        "projects": [],
        "skills": [],
        "summary": original_resume.get("summary", "")
    }
    
    # Distribute improved bullets back to original sections
    bullet_index = 0
    
    # Experience section
    for exp in original_resume.get("experience", []):
        original_bullet_count = len(exp.get("bullets", []))
        exp_improved_bullets = improved_bullets[bullet_index:bullet_index + original_bullet_count]
        bullet_index += original_bullet_count
        
        organized_results["experience"].append({
            "company": exp.get("company", ""),
            "title": exp.get("title", ""),
            "dates": exp.get("dates", ""),
            "original_bullets": exp.get("bullets", []),
            "improved_bullets": exp_improved_bullets
        })
    
    # Projects section
    for project in original_resume.get("projects", []):
        original_bullet_count = len(project.get("bullets", []))
        project_improved_bullets = improved_bullets[bullet_index:bullet_index + original_bullet_count]
        bullet_index += original_bullet_count
        
        organized_results["projects"].append({
            "name": project.get("name", ""),
            "description": project.get("description", ""),
            "tech_stack": project.get("tech_stack", []),
            "original_bullets": project.get("bullets", []),
            "improved_bullets": project_improved_bullets
        })
    
    # Skills section (context-based)
    for skill_category in original_resume.get("skills", []):
        category_improved = {
            "category": skill_category.get("category", ""),
            "skills": []
        }
        
        for skill in skill_category.get("skills", []):
            if skill.get("context"):
                original_bullet_count = 1
                skill_improved_bullets = improved_bullets[bullet_index:bullet_index + original_bullet_count]
                bullet_index += original_bullet_count
                
                category_improved["skills"].append({
                    "skill": skill.get("skill", ""),
                    "confidence": skill.get("confidence", 0),
                    "original_context": skill.get("context", ""),
                    "improved_context": skill_improved_bullets[0] if skill_improved_bullets else skill.get("context", "")
                })
        
        if category_improved["skills"]:
            organized_results["skills"].append(category_improved)
    
    return organized_results

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

def _build_chunk_prompt(bullet_chunk, jd, structure_type, chunk_number, total_chunks):
    """Build prompt for processing a chunk of bullets"""
    
    structure_guidance = {
        "standard": "Rewrite these resume bullets to match the job description. Focus on relevance and impact.",
        "star": "Rewrite these resume bullets using the STAR method (Situation, Task, Action, Result). Each bullet should clearly show the context, what you did, and the outcome.",
        "xyz": "Rewrite these resume bullets using the XYZ format: 'Accomplished X by implementing Y, which resulted in Z.' Focus on achievements and quantifiable results."
    }
    
    prompt = (
        f"This is chunk {chunk_number} of {total_chunks} from a resume optimization task.\n\n"
        f"Job Description: {jd}\n\n"
        f"Resume Bullets (Chunk {chunk_number}):\n"
    )
    
    for idx, bullet in enumerate(bullet_chunk, 1):
        prompt += f"{idx}. {bullet}\n"
    
    prompt += f"\n{structure_guidance.get(structure_type, structure_guidance['standard'])}\n"
    prompt += f"Rewrite these bullets using {structure_type.upper()} format, maintaining the same number of bullets:\n"
    
    return prompt

def _parse_chunk_response(response_text, structure_type):
    """Parse AI response for a single chunk"""
    
    lines = response_text.split('\n')
    improved_bullets = []
    
    for line in lines:
        line = line.strip()
        if not line or line.startswith('Improved') or line.startswith('Rewrite') or line.startswith('Chunk'):
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

def _parse_comprehensive_response_from_chunks(all_improved_bullets, structure_type, original_resume):
    """Parse comprehensive AI response from chunked processing and organize by section"""
    
    # Organize improved bullets back into resume structure
    organized_results = {
        "experience": [],
        "projects": [],
        "skills": [],
        "summary": original_resume.get("summary", "")
    }
    
    # Distribute improved bullets back to original sections
    bullet_index = 0
    
    # Experience section
    for exp in original_resume.get("experience", []):
        original_bullet_count = len(exp.get("bullets", []))
        exp_improved_bullets = all_improved_bullets[bullet_index:bullet_index + original_bullet_count]
        bullet_index += original_bullet_count
        
        organized_results["experience"].append({
            "company": exp.get("company", ""),
            "title": exp.get("title", ""),
            "dates": exp.get("dates", ""),
            "original_bullets": exp.get("bullets", []),
            "improved_bullets": exp_improved_bullets
        })
    
    # Projects section
    for project in original_resume.get("projects", []):
        original_bullet_count = len(project.get("bullets", []))
        project_improved_bullets = all_improved_bullets[bullet_index:bullet_index + original_bullet_count]
        bullet_index += original_bullet_count
        
        organized_results["projects"].append({
            "name": project.get("name", ""),
            "description": project.get("description", ""),
            "tech_stack": project.get("tech_stack", []),
            "original_bullets": project.get("bullets", []),
            "improved_bullets": project_improved_bullets
        })
    
    # Skills section (context-based)
    for skill_category in original_resume.get("skills", []):
        category_improved = {
            "category": skill_category.get("category", ""),
            "skills": []
        }
        
        for skill in skill_category.get("skills", []):
            if skill.get("context"):
                original_bullet_count = 1
                skill_improved_bullets = all_improved_bullets[bullet_index:bullet_index + original_bullet_count]
                bullet_index += original_bullet_count
                
                category_improved["skills"].append({
                    "skill": skill.get("skill", ""),
                    "confidence": skill.get("confidence", 0),
                    "original_context": skill.get("context", ""),
                    "improved_context": skill_improved_bullets[0] if skill_improved_bullets else skill.get("context", "")
                })
        
        if category_improved["skills"]:
            organized_results["skills"].append(category_improved)
    
    return organized_results

def _build_fast_resume_prompt(all_bullets, jd, structure_type):
    """Build a fast, concise prompt for all bullets"""
    
    structure_guidance = {
        "standard": "Rewrite these resume bullets to match the job description. Focus on relevance and impact.",
        "star": "Rewrite using STAR method (Situation, Task, Action, Result). Show context, action, outcome.",
        "xyz": "Rewrite using XYZ format: 'Accomplished X by implementing Y, which resulted in Z.'"
    }
    
    # Truncate JD if too long
    jd_short = jd[:200] + "..." if len(jd) > 200 else jd
    
    # Limit bullets if too many
    bullets_to_process = all_bullets[:20] if len(all_bullets) > 20 else all_bullets
    
    prompt = (
        f"Rewrite these resume bullets to match the job description using {structure_type.upper()} format.\n\n"
        f"Job Description: {jd_short}\n\n"
        f"{structure_guidance.get(structure_type, structure_guidance['standard'])}\n\n"
        f"Resume Bullets:\n"
    )
    
    for idx, bullet in enumerate(bullets_to_process, 1):
        prompt += f"{idx}. {bullet}\n"
    
    prompt += f"\nImproved bullets using {structure_type.upper()} format:\n"
    
    return prompt

def _parse_fast_response(response_text, structure_type):
    """Parse AI response quickly"""
    lines = response_text.split('\n')
    improved_bullets = []
    
    for line in lines:
        line = line.strip()
        if not line or line.startswith('Improved') or line.startswith('Rewrite'):
            continue
            
        # Remove numbering if present
        if line[0].isdigit() and '. ' in line:
            line = line.split('. ', 1)[1]
        
        # Clean up structure markers
        if structure_type == "star":
            line = re.sub(r'^(Situation|Task|Action|Result):\s*', '', line, flags=re.IGNORECASE)
        elif structure_type == "xyz":
            line = re.sub(r'^(Accomplished|Delivered|Improved|Achieved|Developed|Implemented|Managed|Led|Created|Built):\s*', '', line, flags=re.IGNORECASE)
        
        if line:
            improved_bullets.append(line)
    
    return improved_bullets

def _organize_bullets_into_resume(improved_bullets, original_resume):
    """Organize improved bullets back into resume structure"""
    
    organized_results = {
        "experience": [],
        "projects": [],
        "skills": [],
        "summary": original_resume.get("summary", "")
    }
    
    # Distribute improved bullets back to original sections
    bullet_index = 0
    
    # Experience section
    for exp in original_resume.get("experience", []):
        original_bullet_count = len(exp.get("bullets", []))
        exp_improved_bullets = improved_bullets[bullet_index:bullet_index + original_bullet_count]
        bullet_index += original_bullet_count
        
        organized_results["experience"].append({
            "company": exp.get("company", ""),
            "title": exp.get("title", ""),
            "dates": exp.get("dates", ""),
            "original_bullets": exp.get("bullets", []),
            "improved_bullets": exp_improved_bullets
        })
    
    # Projects section
    for project in original_resume.get("projects", []):
        original_bullet_count = len(project.get("bullets", []))
        project_improved_bullets = improved_bullets[bullet_index:bullet_index + original_bullet_count]
        bullet_index += original_bullet_count
        
        organized_results["projects"].append({
            "name": project.get("name", ""),
            "description": project.get("description", ""),
            "tech_stack": project.get("tech_stack", []),
            "original_bullets": project.get("bullets", []),
            "improved_bullets": project_improved_bullets
        })
    
    # Skills section
    for skill_category in original_resume.get("skills", []):
        category_improved = {
            "category": skill_category.get("category", ""),
            "skills": []
        }
        
        for skill in skill_category.get("skills", []):
            if skill.get("context"):
                original_bullet_count = 1
                skill_improved_bullets = improved_bullets[bullet_index:bullet_index + original_bullet_count]
                bullet_index += original_bullet_count
                
                category_improved["skills"].append({
                    "skill": skill.get("skill", ""),
                    "confidence": skill.get("confidence", 0),
                    "original_context": skill.get("context", ""),
                    "improved_context": skill_improved_bullets[0] if skill_improved_bullets else skill.get("context", "")
                })
        
        if category_improved["skills"]:
            organized_results["skills"].append(category_improved)
    
    return organized_results
