from flask import Blueprint, request, jsonify
import os
import re
from services.gemini_service import get_gemini_service
import logging

bulk_match_routes_gemini = Blueprint('bulk_match_routes_gemini', __name__)

@bulk_match_routes_gemini.route('/api/bulk_match_bullets_to_jd', methods=['POST'])
def bulk_match_bullets_to_jd():
    data = request.get_json()
    bullets = data.get("bullets", [])
    jd = data.get("jd", "")
    structure_type = data.get("structure", "standard")  # standard, star, xyz
    project_context = data.get("project_context", "")  # For bundling bullets by project

    if not bullets or not jd:
        return jsonify({"error": "Missing bullets or job description"}), 400

    try:
        # Get Gemini service instance
        gemini = get_gemini_service()
        
        # Use Gemini to improve bullets
        improved_bullets = gemini.improve_bullet_points(
            bullets=bullets,
            job_description=jd,
            structure_type=structure_type,
            project_context=project_context
        )

        return jsonify({
            "improved_bullets": improved_bullets,
            "structure_used": structure_type,
            "project_context": project_context,
            "original_count": len(bullets),
            "improved_count": len(improved_bullets)
        })

    except Exception as e:
        logging.error(f"Error in bulk_match_bullets_to_jd: {str(e)}")
        return jsonify({"error": f"Error processing request: {str(e)}"}), 500

@bulk_match_routes_gemini.route('/api/match_entire_resume', methods=['POST'])
def match_entire_resume():
    """Match entire parsed resume to job description - GEMINI VERSION"""
    print("=== match_entire_resume called (GEMINI VERSION) ===")
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

        print("=== Processing all bullets with Gemini ===")
        
        try:
            # Get Gemini service instance
            gemini = get_gemini_service()
            
            # Process all bullets with Gemini
            improved_bullets = gemini.improve_entire_resume(
                all_bullets=all_bullets,
                job_description=jd,
                structure_type=structure_type
            )
            
            print(f"Successfully processed: {len(improved_bullets)} bullets")
            
        except Exception as ai_error:
            print(f"Gemini processing failed: {ai_error}, using original bullets")
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

@bulk_match_routes_gemini.route('/api/match_structured_resume', methods=['POST'])
def match_structured_resume():
    """Match structured resume data to job description with enhanced formatting - GEMINI VERSION"""
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
        
        # Get Gemini service instance
        gemini = get_gemini_service()
        
        # Match each category to the job description
        matched_results = {}
        
        for category, bullets in organized_bullets.items():
            if bullets:
                try:
                    # Use Gemini to improve bullets for this category
                    matched_bullets = gemini.improve_bullet_points(
                        bullets=bullets,
                        job_description=jd,
                        structure_type=structure_type,
                        project_context=f"Category: {category}"
                    )
                    
                    matched_results[category] = {
                        "original_bullets": bullets,
                        "improved_bullets": matched_bullets,
                        "count": len(matched_bullets)
                    }
                except Exception as category_error:
                    logging.error(f"Error processing category {category}: {str(category_error)}")
                    matched_results[category] = {
                        "original_bullets": bullets,
                        "improved_bullets": bullets,  # Use original if error
                        "count": len(bullets)
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
        logging.error(f"Error in match_structured_resume: {str(e)}")
        return jsonify({"error": f"Error processing structured resume: {str(e)}"}), 500

@bulk_match_routes_gemini.route('/api/bundle_bullets_by_project', methods=['POST'])
def bundle_bullets_by_project():
    """Bundle and organize bullets by project/experience for better storytelling - GEMINI VERSION"""
    data = request.get_json()
    resume_data = data.get("resume_data", {})
    jd = data.get("jd", "")
    bundling_strategy = data.get("strategy", "project")  # project, experience, skill

    if not resume_data or not jd:
        return jsonify({"error": "Missing resume data or job description"}), 400

    try:
        # Bundle bullets based on strategy
        bundled_bullets = _bundle_bullets_by_strategy(resume_data, bundling_strategy)
        
        # Get Gemini service instance
        gemini = get_gemini_service()
        
        # Create project narratives
        project_narratives = []
        
        for bundle in bundled_bullets:
            try:
                narrative = gemini.create_project_narrative(
                    project_name=bundle.get("name", "Unknown Project"),
                    bullets=bundle.get("bullets", []),
                    job_description=jd,
                    skills=bundle.get("skills", [])
                )
                
                project_narratives.append({
                    "project_name": bundle.get("name", "Unknown Project"),
                    "original_bullets": bundle.get("bullets", []),
                    "narrative": narrative,
                    "skills_used": bundle.get("skills", []),
                    "impact": bundle.get("impact", "")
                })
            except Exception as narrative_error:
                logging.error(f"Error creating narrative for {bundle.get('name')}: {str(narrative_error)}")
                project_narratives.append({
                    "project_name": bundle.get("name", "Unknown Project"),
                    "original_bullets": bundle.get("bullets", []),
                    "narrative": f"Worked on {bundle.get('name', 'project')} involving various technologies and methodologies.",
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
        logging.error(f"Error in bundle_bullets_by_project: {str(e)}")
        return jsonify({"error": f"Error bundling bullets: {str(e)}"}), 500

# Utility functions (copied from original bulk_match_routes.py and adapted)

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
