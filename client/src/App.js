import { useState, useEffect } from 'react';
import './App.css';
import geminiService from './services/geminiService';

function App() {
  const [bulletsText, setBulletsText] = useState('');
  const [jd, setJd] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processingTime, setProcessingTime] = useState(0);
  
  // New state for resume upload functionality
  const [inputMode, setInputMode] = useState('manual'); // 'manual' or 'upload'
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsedResume, setParsedResume] = useState(null);
  const [structureType, setStructureType] = useState('star'); // 'star', 'xyz', 'standard'
  const [focusAreas, setFocusAreas] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [processingProgress, setProcessingProgress] = useState('');
  const [activeTab, setActiveTab] = useState('optimize'); // 'optimize', 'upload', 'results'

  // Mock Gemini API for demo purposes (since backend isn't working yet)
  const mockGeminiResponse = async (bullets, jobDescription, structureType) => {
    // Simulate realistic API delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Enhanced mock improvements with realistic, professional bullet points
    const bulletImprovements = {
      "Managed a team of 5 developers": {
        star: "Situation: In a fast-paced software development environment, Task: Led a cross-functional team of 5 developers, Action: Implemented agile methodologies and mentorship programs, Result: Increased team velocity by 40% and reduced project delivery time by 3 weeks.",
        xyz: "Accomplished a 40% increase in development team productivity by leading 5 developers through agile implementation and strategic mentorship, resulting in 3-week faster project deliveries and improved code quality metrics.",
        standard: "Led and mentored a team of 5 software developers, implementing agile practices and code review processes that improved team productivity by 40% and accelerated project delivery timelines."
      },
      "Increased website traffic by 20%": {
        star: "Situation: Company website experiencing declining user engagement, Task: Optimize website performance and user experience, Action: Implemented SEO strategies, page speed optimization, and A/B testing, Result: Achieved 20% increase in organic traffic and 15% improvement in conversion rates.",
        xyz: "Accomplished a 20% increase in website traffic by implementing comprehensive SEO optimization and performance enhancements, resulting in improved user engagement and higher conversion rates.",
        standard: "Optimized website performance through SEO implementation, page speed improvements, and user experience enhancements, resulting in 20% traffic increase and improved search rankings."
      },
      "Implemented new CRM system": {
        star: "Situation: Legacy CRM system causing data inefficiencies, Task: Research and implement modern CRM solution, Action: Led system migration, data integration, and team training initiatives, Result: Reduced customer response time by 50% and improved data accuracy by 85%.",
        xyz: "Accomplished seamless CRM system implementation by leading migration strategy and team training, resulting in 50% faster customer response times and 85% improvement in data accuracy.",
        standard: "Spearheaded implementation of new CRM system, managing data migration and team onboarding that resulted in 50% reduction in customer response time and enhanced data management capabilities."
      },
      "Led development of microservices architecture": {
        star: "Situation: Monolithic application limiting scalability and deployment flexibility, Task: Design and implement microservices architecture, Action: Architected service decomposition strategy and containerization approach, Result: Improved system scalability by 300% and reduced deployment time from hours to minutes.",
        xyz: "Accomplished transformation from monolithic to microservices architecture by designing scalable service decomposition strategy, resulting in 300% improved scalability and minute-level deployment capabilities.",
        standard: "Architected and led implementation of microservices architecture, transforming monolithic application to improve system scalability by 300% and enable rapid deployment cycles."
      },
      "Optimized database performance for better scalability": {
        star: "Situation: Database bottlenecks affecting application performance under high load, Task: Optimize database architecture and queries, Action: Implemented indexing strategies, query optimization, and caching solutions, Result: Reduced query response time by 75% and increased concurrent user capacity by 200%.",
        xyz: "Accomplished 75% reduction in database query response time by implementing advanced indexing and caching strategies, resulting in 200% increase in concurrent user handling capacity.",
        standard: "Enhanced database performance through strategic optimization of queries, indexing, and caching implementations, achieving 75% faster response times and improved scalability for high-traffic scenarios."
      }
    };
    
    // Generate improved bullets
    const improved = bullets.map(bullet => {
      const cleanBullet = bullet.trim();
      if (bulletImprovements[cleanBullet]) {
        return bulletImprovements[cleanBullet][structureType];
      }
      
      // Fallback for custom bullets
      const fallbacks = {
        star: `Situation: In a professional work environment, Task: ${cleanBullet.toLowerCase()}, Action: Implemented strategic solutions using industry best practices, Result: Achieved significant improvements in efficiency and organizational outcomes.`,
        xyz: `Accomplished enhanced operational performance by ${cleanBullet.toLowerCase()}, resulting in measurable improvements and positive impact on business objectives.`,
        standard: `Successfully ${cleanBullet.toLowerCase()} through strategic planning and execution, delivering improved results and contributing to organizational growth.`
      };
      
      return fallbacks[structureType] || cleanBullet;
    });
    
    return improved;
  };

  // Get the correct API base URL for Vercel deployment
  const getApiBaseUrl = () => {
    // For now, we'll use mock data since the backend isn't deployed
    return 'mock';
  };

  // Demo data for easy testing
  const demoBullets = [
    "Managed a team of 5 developers",
    "Increased website traffic by 20%",
    "Implemented new CRM system",
    "Led development of microservices architecture",
    "Optimized database performance for better scalability"
  ];

  const demoJD = "Software Engineer position requiring team leadership, web development experience, and system implementation skills. Looking for someone who can manage projects and drive technical improvements.";

  // Load demo data on component mount for better UX
  useEffect(() => {
    setBulletsText(demoBullets.join('\n'));
    setJd(demoJD);
  }, []);

  const loadDemoData = () => {
    setBulletsText(demoBullets.join('\n'));
    setJd(demoJD);
    setError('');
    setResults([]);
    setParsedResume(null);
    // Show a brief feedback
    setUploadStatus('✅ Demo data loaded successfully!');
    setTimeout(() => setUploadStatus(''), 3000);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    setUploadStatus('📤 Uploading and parsing resume...');
    setError('');
    setParsedResume(null);

    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock resume parsing based on file type
      const mockResumeData = {
        name: "John Doe",
        summary: "Experienced software engineer with 5+ years in full-stack development",
        experience: [
          {
            company: "Tech Corp",
            title: "Senior Software Engineer",
            dates: "2021-2024",
            bullets: [
              "Led development of microservices architecture serving 1M+ users",
              "Implemented CI/CD pipelines reducing deployment time by 60%",
              "Mentored junior developers and conducted code reviews"
            ]
          },
          {
            company: "StartupXYZ",
            title: "Full Stack Developer",
            dates: "2019-2021",
            bullets: [
              "Built responsive web applications using React and Node.js",
              "Optimized database queries improving performance by 40%",
              "Collaborated with design team to implement pixel-perfect UIs"
            ]
          }
        ],
        projects: [
          {
            name: "E-commerce Platform",
            description: "Full-stack e-commerce solution",
            tech_stack: ["React", "Node.js", "MongoDB"],
            bullets: [
              "Developed real-time inventory management system",
              "Integrated payment processing with Stripe API",
              "Implemented automated email marketing campaigns"
            ]
          }
        ],
        skills: [
          {
            category: "Programming Languages",
            skills: [
              { skill: "JavaScript", confidence: 90, context: "5+ years of experience" },
              { skill: "Python", confidence: 85, context: "Backend development and automation" },
              { skill: "TypeScript", confidence: 80, context: "Large-scale applications" }
            ]
          }
        ]
      };

      setParsedResume(mockResumeData);
      setUploadStatus(`✅ Resume parsed successfully! Found 9 bullets across 3 sections.`);
        
        // Auto-populate bullets from parsed resume
        const allBullets = [];
        
        // Extract bullets from experience
      mockResumeData.experience?.forEach(exp => {
          allBullets.push(...exp.bullets);
        });
        
        // Extract bullets from projects
      mockResumeData.projects?.forEach(project => {
          allBullets.push(...project.bullets);
        });
        
        setBulletsText(allBullets.join('\n'));
      
      // Auto switch to optimize tab with populated data
      setActiveTab('optimize');
      
    } catch (error) {
      console.error('Upload error:', error);
      setError(`Upload failed: ${error.message}`);
      setUploadStatus('❌ Upload failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 Submit button clicked!');
    setLoading(true);
    setError('');
    setResults([]);
    setActiveTab('results');
    setProcessingProgress('🚀 Starting optimization...');
    
    const startTime = Date.now();
    
    try {
      const bullets = bulletsText.split('\n').filter(bullet => bullet.trim() !== '');
      
      if (bullets.length === 0) {
        throw new Error('Please enter some resume bullets');
      }
      
      if (!jd.trim()) {
        throw new Error('Please enter a job description');
      }

      // For now, let's use a quick test to ensure functionality works
      setProcessingProgress('🧠 AI analyzing your bullets...');
      
      console.log('Input bullets:', bullets);
      console.log('Job description:', jd);
      console.log('Structure type:', structureType);
      
      // Use quick mock for immediate testing
      await new Promise(resolve => setTimeout(resolve, 1500)); // Shorter delay for testing
      
      const quickTestBullets = bullets.map((bullet, index) => {
        return `✨ [${structureType.toUpperCase()}] Enhanced: ${bullet} - Optimized with specific metrics and quantifiable achievements that align with the job requirements.`;
      });
      
      const improvedBullets = quickTestBullets;
      
      setProcessingProgress('✨ Finalizing optimizations...');
      
      setResults(improvedBullets);
      setProcessingTime(Date.now() - startTime);
      setProcessingProgress('✅ Optimization complete!');
      
      console.log('Successfully generated results:', improvedBullets);
      console.log('Switching to results tab');
      
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      setActiveTab('optimize'); // Go back to optimize tab on error
    } finally {
      setLoading(false);
      setTimeout(() => setProcessingProgress(''), 2000); // Clear progress message after 2 seconds
    }
  };

  const handleMatchEntireResume = async () => {
    if (!parsedResume) {
      setError('Please upload a resume first');
      return;
    }
    
    if (!jd.trim()) {
      setError('Please enter a job description');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);
    setProcessingProgress('Processing entire resume with AI...');
    
    const startTime = Date.now();
    
    try {
      const apiUrl = getApiBaseUrl();
      const response = await fetch(`${apiUrl}/api/match_entire_resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resume_data: parsedResume,
          jd: jd,
          structure: structureType,
          focus_areas: focusAreas
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Process the improved results
      const allImprovedBullets = [];
      
      // Extract improved bullets from experience
      data.improved_results.experience?.forEach(exp => {
        allImprovedBullets.push(...exp.improved_bullets);
      });
      
      // Extract improved bullets from projects
      data.improved_results.projects?.forEach(project => {
        allImprovedBullets.push(...project.improved_bullets);
      });
      
      setResults(allImprovedBullets);
      setProcessingTime(Date.now() - startTime);
      setProcessingProgress(`✅ Successfully processed ${data.summary.total_improved_bullets} bullets!`);
      
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      setProcessingProgress('❌ Processing failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const copyAllResults = () => {
    const allText = results.join('\n');
    navigator.clipboard.writeText(allText);
  };

  return (
    <div 
      style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        position: 'relative',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: '#ffffff'
      }}
    >
      {/* Ultra-premium animated mesh background */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(240, 147, 251, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(78, 205, 196, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 60% 40%, rgba(255, 154, 158, 0.3) 0%, transparent 50%),
            linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 30%, #16213e 70%, #0f1419 100%)
          `,
          backgroundSize: '400% 400%',
          animation: 'gradientShift 8s ease infinite',
          zIndex: 1
        }}
      />

      {/* Animated grid overlay */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(102, 126, 234, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(102, 126, 234, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'float 6s ease-in-out infinite',
          zIndex: 2
        }}
      />

      {/* Enhanced floating particles */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 3 }}>
        {[...Array(80)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: Math.random() * 6 + 2 + 'px',
              height: Math.random() * 6 + 2 + 'px',
              background: `radial-gradient(circle, hsl(${Math.random() * 60 + 200}, 80%, 70%) 0%, transparent 70%)`,
              borderRadius: '50%',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animation: `float ${Math.random() * 4 + 3}s ease-in-out infinite`,
              animationDelay: Math.random() * 3 + 's',
              opacity: Math.random() * 0.8 + 0.2,
              filter: 'blur(1px)'
            }}
          />
        ))}
          </div>

      {/* Spotlight effects */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 2 }}>
        <div 
          style={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'float 8s ease-in-out infinite',
            filter: 'blur(40px)'
          }}
        />
        <div 
          style={{
            position: 'absolute',
            top: '60%',
            right: '15%',
            width: '250px',
            height: '250px',
            background: 'radial-gradient(circle, rgba(240, 147, 251, 0.08) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'float 6s ease-in-out infinite reverse',
            filter: 'blur(30px)'
          }}
        />
        </div>

      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Modern Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          {/* Ultra-premium logo */}
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              borderRadius: '32px',
              marginBottom: '2rem',
              boxShadow: `
                0 30px 60px rgba(102, 126, 234, 0.4),
                0 0 0 1px rgba(255, 255, 255, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.2)
              `,
              animation: 'float 4s ease-in-out infinite',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Glossy overlay */}
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '50%',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                borderRadius: '32px 32px 0 0'
              }}
            />
            
            {/* Animated glow */}
            <div 
              style={{
                position: 'absolute',
                inset: '-2px',
                background: 'linear-gradient(45deg, #667eea, #764ba2, #f093fb, #667eea)',
                borderRadius: '34px',
                opacity: 0.3,
                animation: 'gradientShift 3s linear infinite',
                zIndex: -1
              }}
            />
            
            <span style={{ fontSize: '3rem', position: 'relative', zIndex: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>⚡</span>
          </div>

          {/* Ultra-premium title */}
          <h1 
            style={{
              fontSize: 'clamp(3rem, 8vw, 5rem)',
              fontWeight: '900',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 30%, #f093fb 60%, #4ecdc4 100%)',
              backgroundSize: '300% 300%',
              animation: 'gradientShift 6s ease infinite',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '1.5rem',
              lineHeight: '1.05',
              letterSpacing: '-0.03em',
              filter: 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3))',
              position: 'relative'
            }}
          >
            JobPal AI
            {/* Text glow effect */}
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 30%, #f093fb 60%, #4ecdc4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'blur(20px)',
                opacity: 0.5,
                zIndex: -1
              }}
            >
              JobPal AI
                  </div>
          </h1>

          {/* Subtitle with better typography */}
          <p 
            style={{
              fontSize: '1.25rem',
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '2rem',
              maxWidth: '600px',
              margin: '0 auto 2rem auto',
              lineHeight: '1.6',
              fontWeight: '400'
            }}
          >
            Transform your resume with AI-powered optimization. Create compelling bullets that get you hired.
          </p>

          {/* Status badge with modern design */}
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: 'rgba(16, 185, 129, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '50px',
              padding: '0.75rem 1.5rem',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}
          >
            <div 
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
              }}
            />
            <span style={{ color: '#10b981' }}>Powered by Google Gemini AI</span>
                  </div>
              </div>

        {/* Modern Navigation */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
          <div 
            style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '6px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              gap: '4px'
            }}
          >
            {[
              { id: 'optimize', label: 'Optimize', icon: '⚡', color: '#667eea' },
              { id: 'upload', label: 'Upload', icon: '📤', color: '#f093fb' },
              { id: 'results', label: 'Results', icon: '✨', color: '#4ecdc4' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  position: 'relative',
                  padding: '12px 24px',
                  borderRadius: '16px',
                  border: 'none',
                  background: activeTab === tab.id 
                    ? `linear-gradient(135deg, ${tab.color}22, ${tab.color}44)` 
                    : 'transparent',
                  color: activeTab === tab.id ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                  fontWeight: activeTab === tab.id ? '600' : '500',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: activeTab === tab.id ? 'translateY(-1px)' : 'translateY(0)',
                  boxShadow: activeTab === tab.id 
                    ? `0 8px 25px ${tab.color}33, inset 0 1px 0 rgba(255, 255, 255, 0.1)` 
                    : 'none',
                  minWidth: '90px'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.background = 'transparent';
                    e.target.style.color = 'rgba(255, 255, 255, 0.6)';
                  }
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '16px' }}>{tab.icon}</span>
                  <span>{tab.label}</span>
                </div>
                {activeTab === tab.id && (
                  <div 
                    style={{
                      position: 'absolute',
                      bottom: '-6px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '6px',
                      height: '6px',
                      background: tab.color,
                      borderRadius: '50%',
                      boxShadow: `0 0 12px ${tab.color}`
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Optimize Tab */}
          {activeTab === 'optimize' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.6s ease-out' }}>
              {/* Ultra-premium Resume Bullets Section */}
              <div 
                style={{
                  background: `
                    linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%),
                    radial-gradient(circle at 20% 20%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, rgba(240, 147, 251, 0.08) 0%, transparent 50%)
                  `,
                  backdropFilter: 'blur(25px) saturate(180%)',
                  borderRadius: '28px',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  padding: '2.5rem',
                  boxShadow: `
                    0 25px 50px rgba(0, 0, 0, 0.15),
                    0 0 0 1px rgba(255, 255, 255, 0.05),
                    inset 0 1px 0 rgba(255, 255, 255, 0.15),
                    inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                  `,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Enhanced card glow effects */}
                <div 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.6), rgba(240, 147, 251, 0.6), transparent)',
                    borderRadius: '28px 28px 0 0'
                  }}
                />
                
                {/* Floating light orbs */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '10%',
                    right: '10%',
                    width: '100px',
                    height: '100px',
                    background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
                    borderRadius: '50%',
                    animation: 'float 4s ease-in-out infinite',
                    filter: 'blur(20px)'
                  }}
                />
                
                <div 
                  style={{
                    position: 'absolute',
                    bottom: '20%',
                    left: '15%',
                    width: '80px',
                    height: '80px',
                    background: 'radial-gradient(circle, rgba(240, 147, 251, 0.08) 0%, transparent 70%)',
                    borderRadius: '50%',
                    animation: 'float 6s ease-in-out infinite reverse',
                    filter: 'blur(15px)'
                  }}
                />
              
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
                    <span style={{ fontSize: '1.25rem' }}>📝</span>
                  Resume Bullets
                </h2>
                <button
                  onClick={loadDemoData}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '0.75rem 1.5rem',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      ✨ Load Demo
                    </span>
                </button>
              </div>
              
              <textarea
                value={bulletsText}
                onChange={(e) => setBulletsText(e.target.value)}
                  placeholder="Enter your resume bullets, one per line...

• Managed a team of 5 developers and increased productivity by 30%
• Increased website traffic by 20% through SEO optimization
• Implemented new CRM system reducing customer response time"
                  style={{
                    width: '100%',
                    height: '160px',
                    padding: '1.5rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    color: '#ffffff',
                    fontSize: '16px',
                    lineHeight: '1.6',
                    resize: 'none',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.06)';
                    e.target.style.borderColor = 'rgba(102, 126, 234, 0.5)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                  <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                    <span style={{ fontWeight: '600', color: '#667eea' }}>
                      {bulletsText.split('\n').filter(line => line.trim()).length}
                    </span> bullets entered
                  </p>
                  {bulletsText.trim() && (
                    <span style={{ fontSize: '0.75rem', color: 'rgba(16, 185, 129, 0.8)' }}>
                      ✓ Ready to optimize
                    </span>
                  )}
                </div>
            </div>

            {/* Job Description Section */}
              <div 
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '2rem',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Card glow effect */}
                <div 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(240, 147, 251, 0.5), transparent)'
                  }}
                />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
                    <span style={{ fontSize: '1.25rem' }}>🎯</span>
                Job Description
              </h2>
                  {jd.trim() && (
                    <span style={{ fontSize: '0.75rem', color: 'rgba(240, 147, 251, 0.8)' }}>
                      ✓ Job details loaded
                    </span>
                  )}
                </div>
              
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                  placeholder="Paste the job description here for AI-powered matching...

Software Engineer position requiring team leadership, web development experience, and system implementation skills. Looking for someone who can manage projects and drive technical improvements."
                  style={{
                    width: '100%',
                    height: '140px',
                    padding: '1.5rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    color: '#ffffff',
                    fontSize: '16px',
                    lineHeight: '1.6',
                    resize: 'none',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.06)';
                    e.target.style.borderColor = 'rgba(240, 147, 251, 0.5)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(240, 147, 251, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                  <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                    <span style={{ fontWeight: '600', color: '#f093fb' }}>
                      {jd.split(' ').filter(word => word.trim()).length}
                    </span> words
                  </p>
                </div>
            </div>

            {/* Configuration Section */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <span className="mr-3">⚙️</span>
                  Configuration
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-white font-medium mb-3">
                    Resume Format
                  </label>
                  <select
                    value={structureType}
                    onChange={(e) => setStructureType(e.target.value)}
                      className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
                    >
                      <option value="star" className="bg-gray-800">⭐ STAR Method (Situation, Task, Action, Result)</option>
                      <option value="xyz" className="bg-gray-800">🚀 XYZ Format (Accomplished X by Y resulting in Z)</option>
                      <option value="standard" className="bg-gray-800">📋 Standard Format</option>
                  </select>
                </div>
                
                <div>
                    <label className="block text-white font-medium mb-3">
                      Focus Areas
                  </label>
                  <input
                    type="text"
                    value={focusAreas.join(', ')}
                    onChange={(e) => setFocusAreas(e.target.value.split(',').map(area => area.trim()).filter(Boolean))}
                    placeholder="leadership, technical skills, innovation"
                      className="w-full p-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>

              {/* Action Button */}
              <div className="text-center" style={{ textAlign: 'center' }}>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !bulletsText.trim() || !jd.trim()}
                  style={{
                    background: loading || !bulletsText.trim() || !jd.trim() 
                      ? 'linear-gradient(135deg, #6b7280, #4b5563)' 
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                    backgroundSize: '300% 300%',
                    animation: !loading && bulletsText.trim() && jd.trim() ? 'gradientShift 4s ease infinite' : 'none',
                    color: 'white',
                    fontWeight: '700',
                    padding: '1.25rem 3rem',
                    borderRadius: '16px',
                    border: 'none',
                    fontSize: '1.125rem',
                    cursor: loading || !bulletsText.trim() || !jd.trim() ? 'not-allowed' : 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: 'translateY(0)',
                    boxShadow: loading || !bulletsText.trim() || !jd.trim() 
                      ? '0 8px 25px rgba(107, 114, 128, 0.2)' 
                      : '0 20px 40px rgba(102, 126, 234, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    minWidth: '320px',
                    minHeight: '64px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && bulletsText.trim() && jd.trim()) {
                      e.target.style.transform = 'translateY(-3px) scale(1.02)';
                      e.target.style.boxShadow = '0 25px 50px rgba(102, 126, 234, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading && bulletsText.trim() && jd.trim()) {
                      e.target.style.transform = 'translateY(0) scale(1)';
                      e.target.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
                    }
                  }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-12 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-2xl text-lg"
                >
                  {loading ? (
                    <div className="flex items-center space-x-3" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div 
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                        style={{
                          width: '1.25rem',
                          height: '1.25rem',
                          border: '2px solid white',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }}
                      ></div>
                      <span>Processing with AI...</span>
                    </div>
                  ) : !bulletsText.trim() || !jd.trim() ? (
                    <div className="flex items-center space-x-3" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span>⚠️</span>
                      <span>Add bullets & job description</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative', zIndex: 1 }}>
                      <span style={{ fontSize: '1.1rem' }}>🚀</span>
                      <span>Optimize with Gemini AI</span>
                      {/* Shimmer effect */}
                      <div 
                        style={{
                          position: 'absolute',
                          top: '-50%',
                          left: '-100%',
                          width: '200%',
                          height: '200%',
                          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)',
                          animation: 'shimmer 3s infinite',
                          transform: 'skewX(-15deg)',
                          pointerEvents: 'none'
                        }}
                      />
                    </div>
                  )}
                </button>
                
                {/* Helpful hint */}
                {(!bulletsText.trim() || !jd.trim()) && (
                  <p 
                    className="text-gray-400 text-sm mt-4"
                    style={{
                      color: '#9ca3af',
                      fontSize: '0.875rem',
                      marginTop: '1rem'
                    }}
                  >
                    {!bulletsText.trim() && !jd.trim() 
                      ? "Add resume bullets and job description to get started"
                      : !bulletsText.trim() 
                      ? "Add some resume bullets first"
                      : "Add a job description to optimize your bullets"}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-8 animate-fadeIn px-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center justify-center">
                  <span className="mr-3">📁</span>
                  Upload Your Resume
                </h2>
                
                <div className={`border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all duration-300 ${
                  uploadStatus?.includes('📤') ? 'border-blue-400/50 bg-blue-500/10' : 
                  uploadStatus?.includes('✅') ? 'border-green-400/50 bg-green-500/10' :
                  uploadStatus?.includes('❌') ? 'border-red-400/50 bg-red-500/10' :
                  'border-white/30 hover:border-purple-400 hover:bg-white/5'
                }`}>
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt,.md,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="resume-upload"
                    disabled={uploadStatus?.includes('📤')}
                  />
                  <label
                    htmlFor="resume-upload"
                    className={`cursor-pointer flex flex-col items-center space-y-4 ${
                      uploadStatus?.includes('📤') ? 'pointer-events-none' : ''
                    }`}
                  >
                    <div className={`w-16 md:w-20 h-16 md:h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                      uploadStatus?.includes('📤') ? 'bg-blue-500/30 animate-pulse' :
                      uploadStatus?.includes('✅') ? 'bg-green-500/30' :
                      uploadStatus?.includes('❌') ? 'bg-red-500/30' :
                      'bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-110'
                    }`}>
                      <span className="text-2xl md:text-3xl">
                        {uploadStatus?.includes('📤') ? '⏳' :
                         uploadStatus?.includes('✅') ? '✅' :
                         uploadStatus?.includes('❌') ? '❌' : '📄'}
                      </span>
                    </div>
                    <div>
                      <p className="text-lg md:text-xl text-white font-medium mb-2">
                        {uploadStatus?.includes('📤') ? 'Processing...' :
                         uploadStatus?.includes('✅') ? 'Upload Successful!' :
                         uploadStatus?.includes('❌') ? 'Upload Failed' :
                         'Click to upload your resume'}
                      </p>
                      <p className="text-sm md:text-base text-gray-300">
                        {uploadStatus?.includes('✅') ? 'Resume parsed and bullets extracted!' :
                         'Supports PDF, DOCX, TXT, MD, JSON'}
                      </p>
                    </div>
                  </label>
                  
                  {uploadStatus && (
                    <div className={`mt-6 p-4 rounded-xl border transition-all duration-300 ${
                      uploadStatus.includes('📤') ? 'bg-blue-500/20 border-blue-400/30' :
                      uploadStatus.includes('✅') ? 'bg-green-500/20 border-green-400/30' :
                      'bg-red-500/20 border-red-400/30'
                    }`}>
                      <p className={`text-sm md:text-base ${
                        uploadStatus.includes('📤') ? 'text-blue-300' :
                        uploadStatus.includes('✅') ? 'text-green-300' :
                        'text-red-300'
                      }`}>
                        {uploadStatus}
                      </p>
                      {uploadStatus.includes('✅') && (
                  <button
                          onClick={() => setActiveTab('optimize')}
                          className="mt-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
                        >
                          Go to Optimize →
                  </button>
                )}
                    </div>
                )}
              </div>
              
                {/* Upload Instructions */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { icon: '📄', title: 'Upload Resume', desc: 'Drop your PDF, DOCX, or text file' },
                    { icon: '🤖', title: 'AI Processing', desc: 'We extract and analyze your bullets' },
                    { icon: '✨', title: 'Get Results', desc: 'Receive optimized, job-matched bullets' }
                  ].map((step, index) => (
                    <div key={index} className="bg-white/5 rounded-xl p-4 text-center">
                      <div className="text-2xl mb-2">{step.icon}</div>
                      <h3 className="text-white font-medium mb-1">{step.title}</h3>
                      <p className="text-gray-400 text-sm">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
                </div>
              )}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div className="space-y-8 animate-fadeIn">
              {loading && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 text-center">
                  <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                  <h3 className="text-2xl font-bold text-white mb-2">AI is Working Its Magic</h3>
                  <p className="text-gray-300">Optimizing your resume bullets with Gemini AI...</p>
            </div>
              )}

          {error && (
                <div className="bg-red-500/20 backdrop-blur-md rounded-2xl p-8 border border-red-400/30">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">❌</span>
                    <div>
                      <h3 className="text-xl font-bold text-red-300 mb-1">Error</h3>
                      <p className="text-red-200">{error}</p>
                    </div>
                  </div>
            </div>
          )}

              {results.length > 0 && !loading && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-white flex items-center">
                        <span className="mr-3">✨</span>
                        Optimized Results
                </h2>
                      <p className="text-gray-300 mt-1">
                        {results.length} bullets optimized
                  {processingTime > 0 && (
                          <span className="ml-2 px-3 py-1 bg-green-500/20 rounded-full text-green-400 text-sm">
                      {(processingTime / 1000).toFixed(1)}s
                    </span>
                  )}
                      </p>
                </div>
                    <button
                      onClick={copyAllResults}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      📋 Copy All
                    </button>
              </div>
              
                  <div className="space-y-4">
                {results.map((result, index) => (
                      <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                          Bullet {index + 1}
                        </span>
                              <span className="text-gray-400 text-sm">
                                {structureType.toUpperCase()} Format
                              </span>
                            </div>
                            <p className="text-white leading-relaxed">{result}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(result)}
                            className="ml-4 text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                        title="Copy to clipboard"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                ))}
              </div>
                </div>
              )}

              {results.length === 0 && !loading && !error && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 text-center">
                  <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl">📝</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">No Results Yet</h3>
                  <p className="text-gray-300 mb-6">Go to the Optimize tab to get started with AI resume optimization.</p>
                  <button
                    onClick={() => setActiveTab('optimize')}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
                  >
                    Start Optimizing
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
            <div className="flex justify-center items-center space-x-6 mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🚀</span>
                <span className="text-white font-medium">JobPal AI</span>
        </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🧠</span>
                <span className="text-white font-medium">Powered by Gemini</span>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">⚡</span>
                <span className="text-white font-medium">Deployed on Vercel</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Built with ❤️ for job seekers worldwide. Transform your resume, land your dream job.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
