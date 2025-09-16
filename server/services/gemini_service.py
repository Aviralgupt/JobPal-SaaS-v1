import google.generativeai as genai
import os
from typing import List, Optional
import logging

class GeminiService:
    def __init__(self):
        """Initialize the Gemini service with API key"""
        self.api_key = os.getenv('GOOGLE_API_KEY')
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY environment variable is required")
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Configure generation parameters for optimal performance
        self.generation_config = genai.types.GenerationConfig(
            temperature=0.7,
            top_p=0.9,
            top_k=40,
            max_output_tokens=1024,
        )
    
    def generate_response(self, prompt: str, temperature: float = 0.7, max_tokens: int = 1024) -> str:
        """
        Generate a response using Gemini API
        
        Args:
            prompt (str): The input prompt
            temperature (float): Controls randomness (0.0 to 1.0)
            max_tokens (int): Maximum number of tokens to generate
            
        Returns:
            str: Generated response
        """
        try:
            # Create custom generation config
            config = genai.types.GenerationConfig(
                temperature=temperature,
                top_p=0.9,
                top_k=40,
                max_output_tokens=max_tokens,
            )
            
            # Generate response
            response = self.model.generate_content(
                prompt,
                generation_config=config
            )
            
            if response.text:
                return response.text.strip()
            else:
                return "No response generated"
                
        except Exception as e:
            logging.error(f"Gemini API error: {str(e)}")
            raise Exception(f"Error generating response: {str(e)}")
    
    def improve_bullet_points(self, bullets: List[str], job_description: str, 
                            structure_type: str = "star", project_context: str = "") -> List[str]:
        """
        Improve resume bullet points to match job description
        
        Args:
            bullets (List[str]): List of bullet points to improve
            job_description (str): Target job description
            structure_type (str): Format type ('star', 'xyz', 'standard')
            project_context (str): Additional context for the bullets
            
        Returns:
            List[str]: Improved bullet points
        """
        structure_guidance = {
            "standard": "Rewrite these resume bullets to match the job description. Focus on relevance and impact.",
            "star": "Rewrite these resume bullets using the STAR method (Situation, Task, Action, Result). Each bullet should clearly show the context, what you did, and the outcome.",
            "xyz": "Rewrite these resume bullets using the XYZ format: 'Accomplished X by implementing Y, which resulted in Z.' Focus on achievements and quantifiable results."
        }
        
        project_context_text = f"\nProject Context: {project_context}" if project_context else ""
        
        prompt = (
            f"{structure_guidance.get(structure_type, structure_guidance['standard'])}\n\n"
            f"Job Description: {job_description}\n"
            f"{project_context_text}\n\n"
            f"Resume Bullets:\n"
        )

        for idx, bullet in enumerate(bullets, 1):
            prompt += f"{idx}. {bullet}\n"

        prompt += f"\nImproved bullets using {structure_type.upper()} format (return exactly {len(bullets)} bullets):"
        
        try:
            response = self.generate_response(prompt, temperature=0.7, max_tokens=800)
            return self._parse_bullet_response(response, len(bullets))
        except Exception as e:
            logging.error(f"Error improving bullets: {str(e)}")
            return bullets  # Return original bullets if error occurs
    
    def improve_entire_resume(self, all_bullets: List[str], job_description: str, 
                            structure_type: str = "star") -> List[str]:
        """
        Improve all resume bullets in one request
        
        Args:
            all_bullets (List[str]): All bullets from the resume
            job_description (str): Target job description
            structure_type (str): Format type ('star', 'xyz', 'standard')
            
        Returns:
            List[str]: Improved bullet points
        """
        structure_guidance = {
            "standard": "Rewrite these resume bullets to match the job description. Focus on relevance and impact.",
            "star": "Rewrite using STAR method (Situation, Task, Action, Result). Show context, action, outcome.",
            "xyz": "Rewrite using XYZ format: 'Accomplished X by implementing Y, which resulted in Z.'"
        }
        
        # Truncate JD if too long to save tokens
        jd_short = job_description[:300] + "..." if len(job_description) > 300 else job_description
        
        # Limit bullets if too many to avoid hitting token limits
        bullets_to_process = all_bullets[:25] if len(all_bullets) > 25 else all_bullets
        
        prompt = (
            f"Rewrite these resume bullets to match the job description using {structure_type.upper()} format.\n\n"
            f"Job Description: {jd_short}\n\n"
            f"{structure_guidance.get(structure_type, structure_guidance['standard'])}\n\n"
            f"Resume Bullets:\n"
        )
        
        for idx, bullet in enumerate(bullets_to_process, 1):
            prompt += f"{idx}. {bullet}\n"
        
        prompt += f"\nImproved bullets using {structure_type.upper()} format (return exactly {len(bullets_to_process)} bullets):\n"
        
        try:
            response = self.generate_response(prompt, temperature=0.5, max_tokens=1200)
            improved = self._parse_bullet_response(response, len(bullets_to_process))
            
            # If we processed fewer bullets than original, add the remaining ones
            if len(all_bullets) > len(bullets_to_process):
                improved.extend(all_bullets[len(bullets_to_process):])
            
            return improved
        except Exception as e:
            logging.error(f"Error improving entire resume: {str(e)}")
            return all_bullets  # Return original bullets if error occurs
    
    def create_project_narrative(self, project_name: str, bullets: List[str], 
                               job_description: str, skills: List[str] = None) -> str:
        """
        Create a compelling narrative for a project
        
        Args:
            project_name (str): Name of the project
            bullets (List[str]): Project bullet points
            job_description (str): Target job description
            skills (List[str]): Skills used in the project
            
        Returns:
            str: Project narrative
        """
        skills_text = f"Skills Used: {', '.join(skills)}\n" if skills else ""
        
        prompt = (
            f"Create a compelling narrative for this project that would impress HR managers.\n"
            f"Job Description: {job_description}\n\n"
            f"Project: {project_name}\n"
            f"{skills_text}"
            f"Original Bullets:\n"
        )
        
        for bullet in bullets:
            prompt += f"• {bullet}\n"
        
        prompt += "\nCreate a 2-3 sentence narrative that tells the story of this project:"
        
        try:
            return self.generate_response(prompt, temperature=0.7, max_tokens=400)
        except Exception as e:
            logging.error(f"Error creating narrative: {str(e)}")
            return f"Worked on {project_name} project involving {', '.join(skills) if skills else 'various technologies'}."
    
    def _parse_bullet_response(self, response_text: str, expected_count: int) -> List[str]:
        """
        Parse the AI response and extract bullet points
        
        Args:
            response_text (str): Raw response from AI
            expected_count (int): Expected number of bullets
            
        Returns:
            List[str]: Parsed bullet points
        """
        lines = response_text.split('\n')
        improved_bullets = []
        
        for line in lines:
            line = line.strip()
            if not line or line.startswith('Improved') or line.startswith('Rewrite'):
                continue
                
            # Remove numbering if present
            if line and line[0].isdigit() and '. ' in line:
                line = line.split('. ', 1)[1]
            
            # Remove bullet markers
            if line.startswith('• ') or line.startswith('- '):
                line = line[2:]
            
            if line:
                improved_bullets.append(line)
        
        # If we don't get the expected number of bullets, pad with the last ones or truncate
        if len(improved_bullets) < expected_count:
            # Pad with original message if needed
            while len(improved_bullets) < expected_count:
                improved_bullets.append("Bullet point improvement in progress...")
        elif len(improved_bullets) > expected_count:
            # Truncate to expected count
            improved_bullets = improved_bullets[:expected_count]
        
        return improved_bullets

# Global instance for reuse
gemini_service = None

def get_gemini_service() -> GeminiService:
    """Get or create a Gemini service instance"""
    global gemini_service
    if gemini_service is None:
        gemini_service = GeminiService()
    return gemini_service
