// Resume Parser Utility
// This would normally use libraries like pdf-parse or mammoth for real PDF/DOCX parsing
// For now, we'll create a sophisticated text extraction simulation

export const parseResumeFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        let content = '';
        
        if (file.type === 'text/plain') {
          content = e.target.result;
        } else {
          // For PDF/DOCX, simulate text extraction
          // In a real app, you'd use pdf-parse, mammoth, or a backend service
          content = await simulateFileExtraction(file);
        }
        
        const parsedData = extractResumeData(content, file.name);
        resolve(parsedData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    if (file.type === 'text/plain') {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
};

const simulateFileExtraction = async (file) => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // For now, return a generic message asking for text file
  // In a real implementation, you'd use libraries like pdf-parse or mammoth
  return `
RESUME PARSING NOTICE

This is a demo version. For full PDF/DOCX parsing, please:

1. Copy your resume content to a .txt file, or
2. Paste your resume text directly in the Optimize tab

Your actual resume content will be parsed and displayed here.

To get started:
- Save your resume as a .txt file with your real information
- Upload the .txt file for proper parsing
- Or manually enter your bullets in the Optimize tab

This ensures we work with YOUR actual resume data, not sample data.
`;
};

const extractResumeData = (content, fileName) => {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Check if this is the notice message
  if (content.includes('RESUME PARSING NOTICE')) {
    return {
      personalInfo: {
        name: "Your Resume",
        email: "",
        phone: "",
        fileName: fileName
      },
      experiences: [
        {
          title: "Please Upload Your Real Resume",
          company: "As a .txt file for proper parsing",
          dates: "Or enter manually below",
          bullets: [
            "Copy your resume content to a .txt file",
            "Upload the .txt file for automatic parsing",
            "Or manually enter your bullets in the Optimize tab",
            "This ensures we work with YOUR actual data"
          ]
        }
      ]
    };
  }
  
  // Extract basic info
  const nameMatch = lines.find(line => 
    line.match(/^[A-Z][a-z]+ [A-Z][a-z]+/) && 
    !line.includes('@') && 
    !line.includes('(') &&
    line.length < 50
  );
  
  const emailMatch = lines.find(line => line.includes('@'));
  const phoneMatch = lines.find(line => line.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/));
  
  // Extract experience sections
  const experiences = [];
  let currentExperience = null;
  let inExperienceSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if we're entering experience section
    if (line.match(/^(EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE)$/i)) {
      inExperienceSection = true;
      continue;
    }
    
    // Check if we're leaving experience section
    if (inExperienceSection && line.match(/^(EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS)$/i)) {
      if (currentExperience) {
        experiences.push(currentExperience);
      }
      break;
    }
    
    if (inExperienceSection) {
      // Check for job title patterns
      if (line.match(/^[A-Z][a-z].*?(Engineer|Developer|Manager|Analyst|Specialist|Lead)/i) && 
          !line.includes('•') && !line.includes('-')) {
        
        // Save previous experience
        if (currentExperience) {
          experiences.push(currentExperience);
        }
        
        // Start new experience
        currentExperience = {
          title: line,
          company: '',
          dates: '',
          bullets: []
        };
      }
      
      // Check for company and dates pattern
      else if (currentExperience && line.match(/.*\|.*\d{4}/)) {
        const parts = line.split('|');
        currentExperience.company = parts[0].trim();
        currentExperience.dates = parts[1].trim();
      }
      
      // Check for bullet points
      else if (currentExperience && line.startsWith('•')) {
        currentExperience.bullets.push(line.substring(1).trim());
      }
      
      // Check for dash bullets
      else if (currentExperience && line.startsWith('-')) {
        currentExperience.bullets.push(line.substring(1).trim());
      }
      
      // Check for lines that look like accomplishments
      else if (currentExperience && 
               (line.includes('develop') || line.includes('implement') || 
                line.includes('manage') || line.includes('create') ||
                line.includes('build') || line.includes('lead') ||
                line.includes('optimize') || line.includes('design')) &&
               line.length > 20) {
        currentExperience.bullets.push(line);
      }
    }
  }
  
  // Add the last experience
  if (currentExperience) {
    experiences.push(currentExperience);
  }
  
  // If no experiences found, show instructions
  if (experiences.length === 0) {
    experiences.push(
      {
        title: "No Experience Found",
        company: "Please check your resume format",
        dates: "Or try uploading as .txt file",
        bullets: [
          "Make sure your resume has clear experience sections",
          "Use bullet points (• or -) for accomplishments",
          "Include job titles, companies, and dates",
          "Try saving as a .txt file for better parsing"
        ]
      }
    );
  }
  
  return {
    personalInfo: {
      name: nameMatch || "Your Resume",
      email: emailMatch || "",
      phone: phoneMatch || "",
      fileName: fileName
    },
    experiences: experiences.filter(exp => exp.bullets.length > 0)
  };
};

export default parseResumeFile;
