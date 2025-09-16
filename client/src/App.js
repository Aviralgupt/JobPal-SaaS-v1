import { useState, useEffect } from 'react';
import './App.css';

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
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock improved bullets based on structure type
    const improvements = {
      star: bullets.map(bullet => `Situation: In a dynamic work environment, Task: ${bullet.toLowerCase()}, Action: Implemented strategic solutions and methodologies, Result: Achieved measurable improvements in team productivity and project outcomes.`),
      xyz: bullets.map(bullet => `Accomplished enhanced team performance by implementing ${bullet.toLowerCase()}, which resulted in 25% improvement in operational efficiency and stakeholder satisfaction.`),
      standard: bullets.map(bullet => `Enhanced ${bullet.toLowerCase()} through strategic implementation of industry best practices and innovative solutions, leading to improved organizational outcomes.`)
    };
    
    return improvements[structureType] || bullets;
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
    "Implemented new CRM system"
  ];

  const demoJD = "Software Engineer position requiring team leadership, web development experience, and system implementation skills. Looking for someone who can manage projects and drive technical improvements.";

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
    setLoading(true);
    setError('');
    setResults([]);
    setActiveTab('results');
    
    const startTime = Date.now();
    
    try {
      const bullets = bulletsText.split('\n').filter(bullet => bullet.trim() !== '');
      
      if (bullets.length === 0) {
        throw new Error('Please enter some resume bullets');
      }
      
      if (!jd.trim()) {
        throw new Error('Please enter a job description');
      }

      // Use mock API for demo
      const improvedBullets = await mockGeminiResponse(bullets, jd, structureType);
      
      setResults(improvedBullets);
      setProcessingTime(Date.now() - startTime);
      
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      setActiveTab('optimize'); // Go back to optimize tab on error
    } finally {
      setLoading(false);
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
      {/* Modern mesh gradient background */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.3) 0%, transparent 50%),
            linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)
          `,
          zIndex: 1
        }}
      />

      {/* Floating particles */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 2 }}>
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: Math.random() * 4 + 1 + 'px',
              height: Math.random() * 4 + 1 + 'px',
              backgroundColor: `hsl(${Math.random() * 60 + 200}, 70%, 70%)`,
              borderRadius: '50%',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animation: `float ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: Math.random() * 2 + 's',
              opacity: Math.random() * 0.7 + 0.3
            }}
          />
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Modern Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          {/* Logo with modern design */}
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '24px',
              marginBottom: '2rem',
              boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
              animation: 'float 4s ease-in-out infinite',
              position: 'relative'
            }}
          >
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
                borderRadius: '24px'
              }}
            />
            <span style={{ fontSize: '2.5rem', position: 'relative', zIndex: 1 }}>⚡</span>
          </div>

          {/* Main title with enhanced styling */}
          <h1 
            style={{
              fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '1.5rem',
              lineHeight: '1.1',
              letterSpacing: '-0.02em'
            }}
          >
            JobPal AI
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
              {/* Resume Bullets Section */}
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
                    background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.5), transparent)'
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
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="mr-3">🎯</span>
                Job Description
              </h2>
              
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                  placeholder="Paste the job description here...

Software Engineer position requiring team leadership, web development experience, and system implementation skills. Looking for someone who can manage projects and drive technical improvements."
                  className="w-full h-40 p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none backdrop-blur-sm transition-all duration-300"
              />
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
                      ? 'linear-gradient(to right, #6b7280, #6b7280)' 
                      : 'linear-gradient(to right, #8b5cf6, #ec4899)',
                    color: 'white',
                    fontWeight: 'bold',
                    padding: '1rem 3rem',
                    borderRadius: '1rem',
                    border: 'none',
                    fontSize: '1.125rem',
                    cursor: loading || !bulletsText.trim() || !jd.trim() ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    transform: loading || !bulletsText.trim() || !jd.trim() ? 'scale(1)' : 'scale(1)',
                    boxShadow: '0 25px 50px -12px rgba(139, 92, 246, 0.3)',
                    minWidth: '250px',
                    minHeight: '60px'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading && bulletsText.trim() && jd.trim()) {
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.boxShadow = '0 35px 60px -12px rgba(139, 92, 246, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 25px 50px -12px rgba(139, 92, 246, 0.3)';
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
                    <div className="flex items-center space-x-3" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span>🚀</span>
                      <span>Optimize with Gemini AI</span>
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
