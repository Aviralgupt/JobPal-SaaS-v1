# Resume parsing logic will go here
import pdfplumber
import json
import re
import os
from typing import Dict, List, Any, Optional

class ResumeParser:
    def __init__(self):
        # Comprehensive skills database with categories
        self.skills_database = {
            "programming_languages": [
                "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "Go", "Rust", "Swift", "Kotlin",
                "PHP", "Ruby", "Scala", "R", "MATLAB", "Julia", "Dart", "Elixir", "Clojure", "Haskell"
            ],
            "web_technologies": [
                "HTML", "CSS", "Sass", "Less", "React", "Vue.js", "Angular", "Node.js", "Express.js",
                "Django", "Flask", "FastAPI", "Spring Boot", "ASP.NET", "Laravel", "Ruby on Rails",
                "GraphQL", "REST API", "WebSocket", "JWT", "OAuth", "Redux", "MobX", "Next.js", "Nuxt.js"
            ],
            "databases": [
                "MySQL", "PostgreSQL", "MongoDB", "Redis", "Elasticsearch", "Cassandra", "DynamoDB",
                "SQLite", "Oracle", "SQL Server", "MariaDB", "Neo4j", "InfluxDB", "CouchDB"
            ],
            "cloud_platforms": [
                "AWS", "Azure", "Google Cloud", "DigitalOcean", "Heroku", "Vercel", "Netlify",
                "Firebase", "Supabase", "Cloudflare", "Linode", "Vultr"
            ],
            "devops_tools": [
                "Docker", "Kubernetes", "Jenkins", "GitLab CI", "GitHub Actions", "CircleCI",
                "Terraform", "Ansible", "Chef", "Puppet", "Prometheus", "Grafana", "ELK Stack",
                "Istio", "Helm", "ArgoCD", "Spinnaker"
            ],
            "data_science": [
                "Pandas", "NumPy", "Scikit-learn", "TensorFlow", "PyTorch", "Keras", "Jupyter",
                "Matplotlib", "Seaborn", "Plotly", "Tableau", "Power BI", "Apache Spark", "Hadoop",
                "Dask", "Vaex", "Streamlit", "Gradio"
            ],
            "mobile_development": [
                "React Native", "Flutter", "Xamarin", "Ionic", "Cordova", "PhoneGap",
                "Android Studio", "Xcode", "Kotlin Multiplatform", "SwiftUI", "Jetpack Compose"
            ],
            "ai_ml_tools": [
                "OpenAI API", "Hugging Face", "LangChain", "LlamaIndex", "Ollama", "Claude API",
                "Anthropic", "Cohere", "Replicate", "Gradio", "Streamlit", "MLflow", "Weights & Biases"
            ],
            "testing_frameworks": [
                "Jest", "Mocha", "Chai", "Cypress", "Selenium", "Playwright", "Puppeteer",
                "JUnit", "TestNG", "PyTest", "Robot Framework", "Cucumber", "SpecFlow"
            ],
            "version_control": [
                "Git", "GitHub", "GitLab", "Bitbucket", "SVN", "Mercurial", "GitHub Desktop",
                "SourceTree", "GitKraken", "VS Code Git"
            ]
        }
        
        # Experience structure patterns
        self.experience_patterns = {
            "star": r"(?i)(situation|situation|context|challenge|task|action|action|result|outcome|impact)",
            "xyz": r"(?i)(accomplished|delivered|improved|achieved|developed|implemented|managed|led|created|built)",
            "project": r"(?i)(project|initiative|campaign|system|application|platform|tool|feature|module|component)"
        }

    def parse_resume(self, file_path: str) -> Dict[str, Any]:
        """Parse resume from various file formats"""
        file_ext = os.path.splitext(file_path)[1].lower()
        
        if file_ext == '.pdf':
            return self._parse_pdf(file_path)
        elif file_ext == '.json':
            return self._parse_json(file_path)
        elif file_ext in ['.md', '.markdown', '.txt']:
            return self._parse_text(file_path)
        else:
            raise ValueError(f"Unsupported file format: {file_ext}")

    def _parse_pdf(self, file_path: str) -> Dict[str, Any]:
        """Parse PDF resume with enhanced extraction"""
        data = {
            "name": "",
            "email": "",
            "phone": "",
            "skills": [],
            "experience": [],
            "education": [],
            "projects": [],
            "summary": ""
        }
        
        with pdfplumber.open(file_path) as pdf:
            full_text = "\n".join(page.extract_text() or "" for page in pdf.pages)
        
        # Extract basic info
        data["name"] = self._extract_name(full_text)
        data["email"] = self._extract_email(full_text)
        data["phone"] = self._extract_phone(full_text)
        data["summary"] = self._extract_summary(full_text)
        
        # Enhanced skills detection
        data["skills"] = self._extract_enhanced_skills(full_text)
        
        # Dynamic experience parsing
        data["experience"] = self._extract_experience_sections(full_text)
        
        # Extract projects
        data["projects"] = self._extract_projects(full_text)
        
        # Extract education
        data["education"] = self._extract_education(full_text)
        
        return data

    def _parse_json(self, file_path: str) -> Dict[str, Any]:
        """Parse JSON resume"""
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)

    def _parse_text(self, file_path: str) -> Dict[str, Any]:
        """Parse text-based resume (MD, TXT)"""
        with open(file_path, 'r', encoding='utf-8') as f:
            full_text = f.read()
        
        # Use same parsing logic as PDF
        return self._parse_pdf_content(full_text)

    def _parse_pdf_content(self, text: str) -> Dict[str, Any]:
        """Parse resume content from text"""
        data = {
            "name": "",
            "email": "",
            "phone": "",
            "skills": [],
            "experience": [],
            "education": [],
            "projects": [],
            "summary": ""
        }
        
        data["name"] = self._extract_name(text)
        data["email"] = self._extract_email(text)
        data["phone"] = self._extract_phone(text)
        data["summary"] = self._extract_summary(text)
        data["skills"] = self._extract_enhanced_skills(text)
        data["experience"] = self._extract_experience_sections(text)
        data["projects"] = self._extract_projects(text)
        data["education"] = self._extract_education(text)
        
        return data

    def _extract_name(self, text: str) -> str:
        """Extract name from resume"""
        lines = text.splitlines()
        for line in lines[:5]:  # Check first 5 lines
            line = line.strip()
            if line and not any(keyword in line.lower() for keyword in ['email', 'phone', 'linkedin', 'github']):
                # Remove common prefixes/suffixes
                name = re.sub(r'^(Mr\.|Ms\.|Dr\.|Prof\.)\s*', '', line)
                name = re.sub(r'\s*(Resume|CV|Curriculum Vitae).*$', '', name, flags=re.IGNORECASE)
                if len(name.split()) >= 2:  # At least first and last name
                    return name
        return "Unknown"

    def _extract_email(self, text: str) -> str:
        """Extract email from resume"""
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        match = re.search(email_pattern, text)
        return match.group(0) if match else ""

    def _extract_phone(self, text: str) -> str:
        """Extract phone number from resume"""
        phone_patterns = [
            r'\+?1?\s*\(?[0-9]{3}\)?[\s.-]?[0-9]{3}[\s.-]?[0-9]{4}',  # US format
            r'\+?[0-9]{1,4}[\s.-]?[0-9]{1,4}[\s.-]?[0-9]{1,4}[\s.-]?[0-9]{1,4}',  # International
        ]
        
        for pattern in phone_patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(0)
        return ""

    def _extract_summary(self, text: str) -> str:
        """Extract professional summary"""
        summary_keywords = ['summary', 'objective', 'profile', 'about']
        lines = text.splitlines()
        
        for i, line in enumerate(lines):
            if any(keyword in line.lower() for keyword in summary_keywords):
                # Get next few lines as summary
                summary_lines = []
                for j in range(i + 1, min(i + 4, len(lines))):
                    next_line = lines[j].strip()
                    if next_line and not any(section in next_line.lower() for section in ['experience', 'education', 'skills']):
                        summary_lines.append(next_line)
                    else:
                        break
                return ' '.join(summary_lines)
        return ""

    def _extract_enhanced_skills(self, text: str) -> List[Dict[str, Any]]:
        """Extract skills with categorization and confidence scores"""
        skills_found = []
        text_lower = text.lower()
        
        for category, skill_list in self.skills_database.items():
            category_skills = []
            for skill in skill_list:
                # Check for exact matches and variations
                if skill.lower() in text_lower:
                    # Calculate confidence based on context
                    confidence = self._calculate_skill_confidence(text, skill)
                    if confidence > 0.3:  # Minimum confidence threshold
                        category_skills.append({
                            "skill": skill,
                            "confidence": confidence,
                            "context": self._extract_skill_context(text, skill)
                        })
            
            if category_skills:
                skills_found.append({
                    "category": category.replace('_', ' ').title(),
                    "skills": sorted(category_skills, key=lambda x: x['confidence'], reverse=True)
                })
        
        return skills_found

    def _calculate_skill_confidence(self, text: str, skill: str) -> float:
        """Calculate confidence score for a skill based on context"""
        text_lower = text.lower()
        skill_lower = skill.lower()
        
        # Base confidence
        confidence = 0.5
        
        # Boost confidence based on context
        if f"proficient in {skill_lower}" in text_lower:
            confidence += 0.3
        if f"expert in {skill_lower}" in text_lower:
            confidence += 0.4
        if f"experienced with {skill_lower}" in text_lower:
            confidence += 0.2
        if f"{skill_lower} developer" in text_lower:
            confidence += 0.3
        if f"built with {skill_lower}" in text_lower:
            confidence += 0.2
        
        # Reduce confidence if skill appears in education section only
        education_section = self._find_section(text, 'education')
        if education_section and skill_lower in education_section.lower():
            confidence -= 0.1
        
        return min(confidence, 1.0)

    def _extract_skill_context(self, text: str, skill: str) -> str:
        """Extract context around a skill mention"""
        skill_lower = skill.lower()
        text_lower = text.lower()
        
        # Find skill position
        pos = text_lower.find(skill_lower)
        if pos == -1:
            return ""
        
        # Extract surrounding context
        start = max(0, pos - 100)
        end = min(len(text), pos + len(skill) + 100)
        context = text[start:end]
        
        # Clean up context
        context = re.sub(r'\s+', ' ', context).strip()
        return context

    def _extract_experience_sections(self, text: str) -> List[Dict[str, Any]]:
        """Extract experience sections dynamically"""
        experience_sections = []
        
        # Find experience section boundaries
        exp_patterns = [
            r'(?i)(experience|work experience|employment history|professional experience)',
            r'(?i)(internship|co-op|volunteer)',
            r'(?i)(freelance|consulting|contract)'
        ]
        
        for pattern in exp_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                start_pos = match.start()
                
                # Find the end of this section
                end_pos = self._find_section_end(text, start_pos)
                
                # Extract section content
                section_text = text[start_pos:end_pos]
                
                # Parse individual experiences
                experiences = self._parse_individual_experiences(section_text)
                
                experience_sections.extend(experiences)
        
        return experience_sections

    def _find_section_end(self, text: str, start_pos: int) -> int:
        """Find the end of a section"""
        # Look for next major section
        next_sections = ['education', 'skills', 'projects', 'certifications', 'awards']
        text_lower = text.lower()
        
        min_end = len(text)
        for section in next_sections:
            pos = text_lower.find(section, start_pos + 10)
            if pos != -1 and pos < min_end:
                min_end = pos
        
        return min_end

    def _parse_individual_experiences(self, section_text: str) -> List[Dict[str, Any]]:
        """Parse individual job experiences from section text"""
        experiences = []
        
        # Split by common job separators
        job_separators = [
            r'(?m)^[A-Z][a-z]+\s+\d{4}\s*[-–]\s*\d{4}|present',  # Company + Date format
            r'(?m)^[A-Z][a-z]+\s+[A-Z][a-z]+\s+\d{4}',  # Company + Month + Year
            r'(?m)^\d{4}\s*[-–]\s*\d{4}|present',  # Date range
        ]
        
        # Find job boundaries
        job_positions = []
        for pattern in job_separators:
            matches = re.finditer(pattern, section_text, re.IGNORECASE)
            for match in matches:
                job_positions.append(match.start())
        
        # Sort positions
        job_positions.sort()
        
        # Extract jobs
        for i, pos in enumerate(job_positions):
            start = pos
            end = job_positions[i + 1] if i + 1 < len(job_positions) else len(section_text)
            
            job_text = section_text[start:end].strip()
            if job_text:
                job_data = self._parse_job_details(job_text)
                if job_data:
                    experiences.append(job_data)
        
        return experiences

    def _parse_job_details(self, job_text: str) -> Optional[Dict[str, Any]]:
        """Parse details from a job experience"""
        if not job_text or len(job_text) < 20:
            return None
        
        # Extract company and title
        lines = job_text.splitlines()
        first_line = lines[0].strip()
        
        # Try to extract company and title
        company = ""
        title = ""
        dates = ""
        
        # Look for date patterns
        date_pattern = r'(\d{4}\s*[-–]\s*\d{4}|present|current)'
        date_match = re.search(date_pattern, first_line, re.IGNORECASE)
        if date_match:
            dates = date_match.group(1)
            # Remove dates from first line
            first_line = re.sub(date_pattern, '', first_line, flags=re.IGNORECASE).strip()
        
        # Split company and title
        if ' at ' in first_line:
            parts = first_line.split(' at ')
            title = parts[0].strip()
            company = parts[1].strip()
        elif ' - ' in first_line:
            parts = first_line.split(' - ')
            title = parts[0].strip()
            company = parts[1].strip()
        else:
            # Assume first part is title, rest is company
            parts = first_line.split()
            if len(parts) >= 2:
                title = parts[0]
                company = ' '.join(parts[1:])
        
        # Extract bullets
        bullets = []
        for line in lines[1:]:
            line = line.strip()
            if line.startswith('•') or line.startswith('-') or line.startswith('*'):
                bullet = line[1:].strip()
                if bullet:
                    bullets.append(bullet)
            elif line and not any(keyword in line.lower() for keyword in ['company', 'location', 'duration']):
                # Might be a bullet without marker
                bullets.append(line)
        
        return {
            "company": company,
            "title": title,
            "dates": dates,
            "bullets": bullets,
            "text": job_text
        }

    def _extract_projects(self, text: str) -> List[Dict[str, Any]]:
        """Extract project information"""
        projects = []
        
        # Find projects section
        project_patterns = [
            r'(?i)(projects|portfolio|applications|systems built)',
            r'(?i)(personal projects|side projects|academic projects)'
        ]
        
        for pattern in project_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                start_pos = match.start()
                end_pos = self._find_section_end(text, start_pos)
                section_text = text[start_pos:end_pos]
                
                # Parse individual projects
                project_list = self._parse_individual_projects(section_text)
                projects.extend(project_list)
        
        return projects

    def _parse_individual_projects(self, section_text: str) -> List[Dict[str, Any]]:
        """Parse individual projects from section text"""
        projects = []
        
        # Look for project indicators
        project_indicators = [
            r'(?m)^[A-Z][a-z\s]+(?:App|System|Platform|Tool|Dashboard|API|Website|Mobile App)',
            r'(?m)^[A-Z][a-z\s]+(?:Project|Initiative|Campaign)',
        ]
        
        for pattern in project_indicators:
            matches = re.finditer(pattern, section_text, re.IGNORECASE)
            for match in matches:
                start = match.start()
                
                # Find project end
                end = self._find_project_end(section_text, start)
                project_text = section_text[start:end].strip()
                
                if project_text:
                    project_data = self._parse_project_details(project_text)
                    if project_data:
                        projects.append(project_data)
        
        return projects

    def _find_project_end(self, text: str, start_pos: int) -> int:
        """Find the end of a project description"""
        lines = text[start_pos:].splitlines()
        
        for i, line in enumerate(lines[1:], 1):
            line = line.strip()
            # Check if this looks like a new project or section
            if (line and 
                (line[0].isupper() and len(line.split()) <= 3) or
                any(keyword in line.lower() for keyword in ['project', 'system', 'app', 'platform'])):
                return start_pos + sum(len(l) + 1 for l in lines[:i])
        
        return len(text)

    def _parse_project_details(self, project_text: str) -> Optional[Dict[str, Any]]:
        """Parse details from a project description"""
        if not project_text or len(project_text) < 10:
            return None
        
        lines = project_text.splitlines()
        first_line = lines[0].strip()
        
        # Extract project name and tech stack
        project_name = first_line
        tech_stack = []
        
        # Look for tech stack in brackets or after dashes
        tech_match = re.search(r'[\[\(]([^\]\)]+)[\]\)]', first_line)
        if tech_match:
            tech_stack = [tech.strip() for tech in tech_match.group(1).split(',')]
            project_name = re.sub(r'[\[\(][^\]\)]+[\]\)]', '', first_line).strip()
        
        # Extract description and bullets
        description = ""
        bullets = []
        
        for line in lines[1:]:
            line = line.strip()
            if line.startswith('•') or line.startswith('-') or line.startswith('*'):
                bullet = line[1:].strip()
                if bullet:
                    bullets.append(bullet)
            elif line and not description:
                description = line
        
        return {
            "name": project_name,
            "description": description,
            "tech_stack": tech_stack,
            "bullets": bullets,
            "text": project_text
        }

    def _extract_education(self, text: str) -> List[Dict[str, Any]]:
        """Extract education information"""
        education = []
        
        # Find education section
        edu_pattern = r'(?i)(education|academic|degree|university|college|school)'
        matches = re.finditer(edu_pattern, text, re.IGNORECASE)
        
        for match in matches:
            start_pos = match.start()
            end_pos = self._find_section_end(text, start_pos)
            section_text = text[start_pos:end_pos]
            
            # Parse education entries
            edu_entries = self._parse_education_entries(section_text)
            education.extend(edu_entries)
        
        return education

    def _parse_education_entries(self, section_text: str) -> List[Dict[str, Any]]:
        """Parse individual education entries"""
        entries = []
        
        # Look for degree patterns
        degree_patterns = [
            r'(?i)(Bachelor|Master|PhD|BSc|MSc|MBA|BBA|MS|MA|BS|BA)',
            r'(?i)(Associate|Diploma|Certificate)'
        ]
        
        for pattern in degree_patterns:
            matches = re.finditer(pattern, section_text, re.IGNORECASE)
            for match in matches:
                start = match.start()
                
                # Find entry end
                end = self._find_education_entry_end(section_text, start)
                entry_text = section_text[start:end].strip()
                
                if entry_text:
                    entry_data = self._parse_education_details(entry_text)
                    if entry_data:
                        entries.append(entry_data)
        
        return entries

    def _find_education_entry_end(self, text: str, start_pos: int) -> int:
        """Find the end of an education entry"""
        lines = text[start_pos:].splitlines()
        
        for i, line in enumerate(lines[1:], 1):
            line = line.strip()
            # Check if this looks like a new education entry
            if (line and 
                any(degree in line for degree in ['Bachelor', 'Master', 'PhD', 'Associate'])):
                return start_pos + sum(len(l) + 1 for l in lines[:i])
        
        return len(text)

    def _parse_education_details(self, entry_text: str) -> Optional[Dict[str, Any]]:
        """Parse details from an education entry"""
        if not entry_text or len(entry_text) < 10:
            return None
        
        lines = entry_text.splitlines()
        first_line = lines[0].strip()
        
        # Extract degree and institution
        degree = ""
        institution = ""
        
        # Look for degree patterns
        degree_match = re.search(r'(?i)(Bachelor|Master|PhD|BSc|MSc|MBA|BBA|MS|MA|BS|BA|Associate|Diploma|Certificate)', first_line)
        if degree_match:
            degree = degree_match.group(1)
            # Extract institution (rest of the line)
            institution = re.sub(r'(?i)(Bachelor|Master|PhD|BSc|MSc|MBA|BBA|MS|MA|BS|BA|Associate|Diploma|Certificate)', '', first_line).strip()
        
        # Extract dates and GPA
        dates = ""
        gpa = ""
        
        for line in lines[1:]:
            line = line.strip()
            # Look for dates
            date_match = re.search(r'(\d{4}\s*[-–]\s*\d{4}|present|current)', line, re.IGNORECASE)
            if date_match and not dates:
                dates = date_match.group(1)
            
            # Look for GPA
            gpa_match = re.search(r'(?i)(GPA|Grade Point Average)[:\s]*([0-9]+\.[0-9]+)', line)
            if gpa_match and not gpa:
                gpa = gpa_match.group(2)
        
        return {
            "degree": degree,
            "institution": institution,
            "dates": dates,
            "gpa": gpa,
            "text": entry_text
        }

    def _find_section(self, text: str, section_name: str) -> str:
        """Find a specific section in the text"""
        pattern = rf'(?i)({section_name})'
        match = re.search(pattern, text)
        if match:
            start_pos = match.start()
            end_pos = self._find_section_end(text, start_pos)
            return text[start_pos:end_pos]
        return ""

def extract_resume_data(file_path: str) -> Dict[str, Any]:
    """Main function to extract resume data"""
    parser = ResumeParser()
    return parser.parse_resume(file_path)
