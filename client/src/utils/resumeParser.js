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
  
  const fileName = file.name.toLowerCase();
  
  // Create realistic resume content based on filename and common patterns
  let mockContent = `
John Smith
Software Engineer
Email: john.smith@email.com
Phone: (555) 123-4567
LinkedIn: linkedin.com/in/johnsmith

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years of expertise in full-stack development, 
system architecture, and team leadership. Proven track record of delivering scalable 
solutions and driving technical excellence.

EXPERIENCE

Senior Software Engineer
TechCorp Inc. | 2022 - Present
• Led development of microservices architecture serving 2M+ daily active users
• Implemented CI/CD pipelines reducing deployment time from 2 hours to 15 minutes
• Mentored 3 junior developers and conducted weekly code review sessions
• Optimized database queries resulting in 40% improvement in API response times
• Collaborated with product team to deliver 15+ customer-facing features

Full Stack Developer  
StartupXYZ | 2020 - 2022
• Built responsive web applications using React, Node.js, and PostgreSQL
• Developed RESTful APIs handling 100K+ requests per day
• Integrated payment processing with Stripe and PayPal APIs
• Implemented real-time chat functionality using WebSocket technology
• Reduced application load time by 60% through performance optimization

Software Developer
InnovateLabs | 2019 - 2020
• Developed mobile applications using React Native for iOS and Android
• Created automated testing suites increasing code coverage to 90%
• Participated in agile development process with 2-week sprint cycles
• Collaborated with UI/UX designers to implement pixel-perfect interfaces
• Fixed critical bugs and improved application stability

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2015 - 2019

SKILLS
Programming Languages: JavaScript, Python, Java, TypeScript
Frameworks: React, Node.js, Express, Django, Spring Boot
Databases: PostgreSQL, MongoDB, Redis, MySQL
Tools: Git, Docker, Kubernetes, AWS, Jenkins
`;

  // Customize based on filename hints
  if (fileName.includes('senior') || fileName.includes('lead')) {
    mockContent = mockContent.replace('3 junior developers', '5 junior developers');
    mockContent = mockContent.replace('15+ customer-facing features', '25+ customer-facing features');
  }
  
  if (fileName.includes('frontend') || fileName.includes('react')) {
    mockContent += `
ADDITIONAL EXPERIENCE

Frontend Developer
WebSolutions Co. | 2018 - 2019
• Developed modern web interfaces using React and Vue.js
• Implemented responsive designs for mobile and desktop platforms
• Optimized frontend performance achieving 95+ Lighthouse scores
• Integrated with RESTful APIs and GraphQL endpoints
• Collaborated with design team using Figma and Adobe XD
`;
  }
  
  if (fileName.includes('backend') || fileName.includes('api')) {
    mockContent += `
ADDITIONAL EXPERIENCE

Backend Developer
DataFlow Systems | 2018 - 2019
• Designed and implemented scalable REST and GraphQL APIs
• Built microservices architecture using Docker and Kubernetes
• Implemented OAuth 2.0 authentication and JWT token management
• Optimized database schemas and queries for high-performance applications
• Maintained 99.9% uptime for production systems serving 500K+ users
`;
  }
  
  return mockContent;
};

const extractResumeData = (content, fileName) => {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
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
  
  // If no experiences found, create sample ones
  if (experiences.length === 0) {
    experiences.push(
      {
        title: "Software Engineer",
        company: "Tech Company",
        dates: "2022 - Present",
        bullets: [
          "Developed web applications using modern frameworks",
          "Collaborated with cross-functional teams on feature delivery",
          "Implemented automated testing and deployment processes",
          "Optimized application performance and resolved technical issues"
        ]
      },
      {
        title: "Full Stack Developer",
        company: "Previous Company",
        dates: "2020 - 2022",
        bullets: [
          "Built responsive user interfaces using React and TypeScript",
          "Designed and implemented RESTful APIs",
          "Integrated third-party services and payment systems",
          "Participated in code reviews and technical design discussions"
        ]
      }
    );
  }
  
  return {
    personalInfo: {
      name: nameMatch || "Resume Holder",
      email: emailMatch || "",
      phone: phoneMatch || "",
      fileName: fileName
    },
    experiences: experiences.filter(exp => exp.bullets.length > 0)
  };
};

export default parseResumeFile;
