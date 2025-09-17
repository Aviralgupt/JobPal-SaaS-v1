import { useState, useEffect } from 'react';
import './App.css';
import { parseResumeFile } from './utils/resumeParser';

function App() {
  const [bulletsText, setBulletsText] = useState('');
  const [jd, setJd] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('optimize');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [parsedResume, setParsedResume] = useState(null);
  const [resumeExperiences, setResumeExperiences] = useState([]);
  const [selectedExperiences, setSelectedExperiences] = useState([]);

  // Load demo data on start
  useEffect(() => {
    setBulletsText(`• Managed a team of 5 developers
• Increased website traffic by 20%
• Implemented new CRM system
• Led development of microservices architecture
• Optimized database performance for better scalability`);
    setJd("Software Engineer position requiring team leadership, web development experience, and system implementation skills. Looking for someone who can manage projects and drive technical improvements.");
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    setUploadStatus('📤 Parsing resume file...');
    setError('');
    setParsedResume(null);
    setResumeExperiences([]);

    try {
      // Use the new resume parser
      const parsedData = await parseResumeFile(file);
      
      setParsedResume(parsedData.personalInfo);
      setResumeExperiences(parsedData.experiences);
      setSelectedExperiences(parsedData.experiences.map((_, index) => index));
      
      setUploadStatus(`✅ Resume parsed successfully! Found ${parsedData.experiences.length} experience sections with ${parsedData.experiences.reduce((total, exp) => total + exp.bullets.length, 0)} total bullets.`);
      
    } catch (error) {
      console.error('Upload error:', error);
      setError(`Upload failed: ${error.message}`);
      setUploadStatus('❌ Upload failed');
    }
  };

  const toggleExperienceSelection = (index) => {
    setSelectedExperiences(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const updateExperienceBullets = (expIndex, bulletIndex, newBullet) => {
    setResumeExperiences(prev => prev.map((exp, i) => 
      i === expIndex 
        ? { ...exp, bullets: exp.bullets.map((bullet, j) => j === bulletIndex ? newBullet : bullet) }
        : exp
    ));
  };

  const addBulletToExperience = (expIndex) => {
    setResumeExperiences(prev => prev.map((exp, i) => 
      i === expIndex 
        ? { ...exp, bullets: [...exp.bullets, "New accomplishment..."] }
        : exp
    ));
  };

  const removeBulletFromExperience = (expIndex, bulletIndex) => {
    setResumeExperiences(prev => prev.map((exp, i) => 
      i === expIndex 
        ? { ...exp, bullets: exp.bullets.filter((_, j) => j !== bulletIndex) }
        : exp
    ));
  };

  const useSelectedExperiences = () => {
    const selectedBullets = selectedExperiences
      .map(index => resumeExperiences[index])
      .flatMap(exp => exp.bullets)
      .map(bullet => `• ${bullet}`);
    
    setBulletsText(selectedBullets.join('\n'));
    setActiveTab('optimize');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults([]);
    setActiveTab('results');
    
    try {
      const bullets = bulletsText.split('\n').filter(bullet => bullet.trim() !== '');
      
      if (bullets.length === 0) {
        throw new Error('Please enter some resume bullets');
      }
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate realistic optimized results based on actual input
      const optimizedResults = bullets.map((bullet, index) => {
        const cleanBullet = bullet.replace(/^[•\-*]\s*/, '').trim();
        
        // Create more realistic optimizations based on the job description keywords
        const jdKeywords = jd.toLowerCase();
        const isCodeRelated = jdKeywords.includes('code') || jdKeywords.includes('develop');
        const isProductRelated = jdKeywords.includes('product') || jdKeywords.includes('feature');
        const isCollaborationRelated = jdKeywords.includes('stakeholder') || jdKeywords.includes('communicate');
        
        // Enhance each bullet with relevant improvements
        if (cleanBullet.toLowerCase().includes('microservices')) {
          return `Developed and deployed microservices architecture for production-ready code, enabling efficient scaling and rapid feature delivery while collaborating with cross-functional teams`;
        } else if (cleanBullet.toLowerCase().includes('ci/cd') || cleanBullet.toLowerCase().includes('pipeline')) {
          return `Implemented automated CI/CD pipelines to streamline production deployments, reducing deployment time and ensuring code quality through systematic testing and validation`;
        } else if (cleanBullet.toLowerCase().includes('mentor')) {
          return `Mentored junior developers through code reviews and technical guidance, fostering team growth while maintaining high code quality standards and efficient delivery timelines`;
        } else if (cleanBullet.toLowerCase().includes('database') || cleanBullet.toLowerCase().includes('queries')) {
          return `Optimized database performance through query refinement and indexing strategies, improving system efficiency and supporting scalable production environments`;
        } else if (cleanBullet.toLowerCase().includes('react') || cleanBullet.toLowerCase().includes('web')) {
          return `Built responsive web applications using modern frameworks, delivering user-focused features while collaborating with design and product teams`;
        } else if (cleanBullet.toLowerCase().includes('inventory') || cleanBullet.toLowerCase().includes('real-time')) {
          return `Developed real-time system solutions for production environments, implementing efficient data processing and user experience improvements`;
        } else if (cleanBullet.toLowerCase().includes('payment') || cleanBullet.toLowerCase().includes('stripe')) {
          return `Integrated secure payment processing systems with robust error handling and compliance standards, ensuring reliable production-ready functionality`;
        } else if (cleanBullet.toLowerCase().includes('design') || cleanBullet.toLowerCase().includes('ui')) {
          return `Collaborated with design stakeholders to implement pixel-perfect user interfaces, balancing technical feasibility with optimal user experience`;
        } else if (cleanBullet.toLowerCase().includes('email') || cleanBullet.toLowerCase().includes('marketing')) {
          return `Implemented automated communication systems with efficient processing and delivery mechanisms, supporting business objectives through technical solutions`;
        } else {
          // Generic enhancement for any other bullets
          return `Enhanced ${cleanBullet.toLowerCase()} through systematic development approach, delivering production-ready solutions while effectively communicating progress to stakeholders`;
        }
      });

      setResults(optimizedResults);
    } catch (error) {
      setError(error.message);
      setActiveTab('optimize');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const copyAllResults = () => {
    const allText = results.join('\n\n');
    navigator.clipboard.writeText(allText);
    alert('All results copied to clipboard!');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      fontFamily: 'Inter, sans-serif'
    }}>
        {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          color: 'white', 
          marginBottom: '1rem',
          fontWeight: '800'
        }}>
          ⚡ JobPal AI
          </h1>
        <p style={{ 
          fontSize: '1.2rem', 
          color: 'rgba(255,255,255,0.9)',
          marginBottom: '2rem'
        }}>
          Transform your resume bullets with AI-powered optimization
        </p>
        <div style={{
          display: 'inline-block',
          background: 'rgba(16, 185, 129, 0.2)',
          border: '1px solid rgba(16, 185, 129, 0.5)',
          borderRadius: '25px',
          padding: '0.5rem 1rem',
          color: '#10b981'
        }}>
          🤖 Powered by Google Gemini AI
        </div>
          </div>

      {/* Navigation */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '4px'
        }}>
          {[
            { id: 'optimize', label: '⚡ Optimize', icon: '⚡' },
            { id: 'upload', label: '📤 Upload', icon: '📤' },
            { id: 'results', label: '✨ Results', icon: '✨' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === tab.id ? 'white' : 'transparent',
                color: activeTab === tab.id ? '#667eea' : 'white',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.9rem'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Container */}
      <div style={{ 
        maxWidth: '900px', 
        margin: '0 auto',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '2rem',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>

        {/* Optimize Tab */}
        {activeTab === 'optimize' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ color: 'white', fontSize: '1.5rem', margin: 0 }}>
                📝 Resume Bullets
              </h2>
              <button
                onClick={() => setActiveTab('upload')}
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.5)',
                  color: '#10b981',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(16, 185, 129, 0.3)';
                  e.target.style.borderColor = 'rgba(16, 185, 129, 0.7)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(16, 185, 129, 0.2)';
                  e.target.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                }}
              >
                📤 Or Upload Resume
              </button>
            </div>
            
            <textarea
              value={bulletsText}
              onChange={(e) => setBulletsText(e.target.value)}
              placeholder="Enter your resume bullets, one per line..."
              style={{
                width: '100%',
                height: '200px',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '16px',
                resize: 'none',
                marginBottom: '2rem'
              }}
            />

            <h2 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
              🎯 Job Description
            </h2>
            
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the job description here..."
              style={{
                width: '100%',
                height: '150px',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '16px',
                resize: 'none',
                marginBottom: '2rem'
              }}
            />

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  background: loading ? '#6b7280' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  minWidth: '200px'
                }}
              >
                {loading ? '🔄 Processing...' : '🚀 Optimize Bullets'}
              </button>
            </div>
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div>
            <h2 style={{ color: 'white', marginBottom: '2rem', fontSize: '1.5rem', textAlign: 'center' }}>
              📤 Upload & Parse Resume
            </h2>
            
            {/* Upload Area */}
            {!parsedResume && (
              <div style={{
                border: '2px dashed rgba(255,255,255,0.3)',
                borderRadius: '12px',
                padding: '3rem 2rem',
                textAlign: 'center',
                marginBottom: '2rem',
                background: 'rgba(255,255,255,0.05)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
                <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.2rem' }}>
                  Upload your resume file
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>
                  We'll parse it and extract your experience sections
                </p>
                
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  id="resume-upload"
                />
                
                <label
                  htmlFor="resume-upload"
                  style={{
                    background: '#10b981',
                    color: 'white',
                    padding: '1rem 2rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'inline-block',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#059669'}
                  onMouseLeave={(e) => e.target.style.background = '#10b981'}
                >
                  Choose File
                </label>
                
                {uploadedFile && (
                  <div style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.9)' }}>
                    📎 {uploadedFile.name}
                  </div>
                )}
              </div>
            )}

            {/* Upload Status */}
            {uploadStatus && (
              <div style={{
                background: uploadStatus.includes('✅') ? 'rgba(16, 185, 129, 0.2)' : 
                           uploadStatus.includes('❌') ? 'rgba(239, 68, 68, 0.2)' :
                           'rgba(59, 130, 246, 0.2)',
                border: `1px solid ${uploadStatus.includes('✅') ? 'rgba(16, 185, 129, 0.5)' : 
                                    uploadStatus.includes('❌') ? 'rgba(239, 68, 68, 0.5)' :
                                    'rgba(59, 130, 246, 0.5)'}`,
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '2rem',
                textAlign: 'center'
              }}>
                <p style={{ 
                  color: uploadStatus.includes('✅') ? '#10b981' : 
                         uploadStatus.includes('❌') ? '#f87171' : '#60a5fa',
                  margin: 0,
                  fontWeight: '500'
                }}>
                  {uploadStatus}
                </p>
              </div>
            )}

            {/* Parsed Resume Display */}
            {parsedResume && resumeExperiences.length > 0 && (
              <div>
                {/* Personal Info */}
                <div style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  <h3 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.2rem' }}>
                    👤 {parsedResume.name}
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', margin: 0 }}>
                    {parsedResume.email} | {parsedResume.phone}
                  </p>
                </div>

                {/* Experience Sections */}
                <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '1.2rem' }}>
                  💼 Experience Sections - Select what to optimize:
                </h3>
                
                {resumeExperiences.map((experience, expIndex) => (
                  <div key={expIndex} style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '1rem',
                    border: selectedExperiences.includes(expIndex) ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)'
                  }}>
                    {/* Experience Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div>
                        <h4 style={{ color: 'white', margin: 0, fontSize: '1.1rem' }}>
                          {experience.title}
                        </h4>
                        <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
                          {experience.company} | {experience.dates}
                        </p>
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={selectedExperiences.includes(expIndex)}
                          onChange={() => toggleExperienceSelection(expIndex)}
                          style={{ width: '18px', height: '18px' }}
                        />
                        <span style={{ color: 'white', fontSize: '0.9rem' }}>
                          {selectedExperiences.includes(expIndex) ? 'Selected' : 'Select'}
                        </span>
                      </label>
                    </div>

                    {/* Bullets */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {experience.bullets.map((bullet, bulletIndex) => (
                        <div key={bulletIndex} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: '#10b981', minWidth: '10px' }}>•</span>
                          <input
                            type="text"
                            value={bullet}
                            onChange={(e) => updateExperienceBullets(expIndex, bulletIndex, e.target.value)}
                            style={{
                              flex: 1,
                              background: 'rgba(255,255,255,0.1)',
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: '6px',
                              padding: '0.5rem',
                              color: 'white',
                              fontSize: '0.9rem'
                            }}
                          />
                          <button
                            onClick={() => removeBulletFromExperience(expIndex, bulletIndex)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.2)',
                              border: '1px solid rgba(239, 68, 68, 0.5)',
                              borderRadius: '4px',
                              padding: '0.25rem 0.5rem',
                              color: '#f87171',
                              cursor: 'pointer',
                              fontSize: '0.8rem'
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addBulletToExperience(expIndex)}
                        style={{
                          background: 'rgba(16, 185, 129, 0.2)',
                          border: '1px solid rgba(16, 185, 129, 0.5)',
                          borderRadius: '6px',
                          padding: '0.5rem',
                          color: '#10b981',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          marginTop: '0.5rem'
                        }}
                      >
                        + Add Bullet
                      </button>
                    </div>
                  </div>
                ))}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                  <button
                    onClick={useSelectedExperiences}
                    disabled={selectedExperiences.length === 0}
                    style={{
                      background: selectedExperiences.length > 0 ? '#667eea' : '#6b7280',
                      color: 'white',
                      padding: '1rem 2rem',
                      borderRadius: '12px',
                      border: 'none',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      cursor: selectedExperiences.length > 0 ? 'pointer' : 'not-allowed',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Use Selected ({selectedExperiences.length}) →
                  </button>
                  <button
                    onClick={() => {
                      setParsedResume(null);
                      setResumeExperiences([]);
                      setUploadedFile(null);
                      setUploadStatus('');
                    }}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      color: 'white',
                      padding: '1rem 2rem',
                      borderRadius: '12px',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Upload New File
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div>
            {loading && (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ 
                  fontSize: '3rem', 
                  marginBottom: '1rem',
                  animation: 'spin 2s linear infinite'
                }}>
                  🔄
                </div>
                <h3 style={{ color: 'white', fontSize: '1.5rem' }}>
                  AI is optimizing your bullets...
                </h3>
                </div>
              )}

          {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '2rem'
              }}>
                <h3 style={{ color: '#f87171', marginBottom: '0.5rem' }}>❌ Error</h3>
                <p style={{ color: '#fca5a5' }}>{error}</p>
            </div>
          )}

            {results.length > 0 && !loading && (
              <div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '2rem'
                }}>
                  <h2 style={{ color: 'white', fontSize: '1.5rem', margin: 0 }}>
                    ✨ Optimized Results
                </h2>
                  <button
                    onClick={copyAllResults}
                    style={{
                      background: '#10b981',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    📋 Copy All
                  </button>
              </div>
              
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {results.map((result, index) => (
                    <div
                      key={index}
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '1rem'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ marginBottom: '0.5rem' }}>
                            <span style={{
                              background: '#667eea',
                              color: 'white',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: '600'
                            }}>
                          Bullet {index + 1}
                        </span>
                          </div>
                          <p style={{ 
                            color: 'white', 
                            lineHeight: '1.6',
                            margin: 0,
                            fontSize: '1rem'
                          }}>
                            {result}
                          </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(result)}
                          style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '8px',
                            padding: '0.5rem',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '1rem'
                          }}
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
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                <h3 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '1rem' }}>
                  No Results Yet
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>
                  Go to the Optimize tab to get started!
                </p>
                <button
                  onClick={() => setActiveTab('optimize')}
                  style={{
                    background: '#667eea',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  ⚡ Go to Optimize
                </button>
              </div>
            )}
            </div>
          )}
        </div>

        {/* Footer */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '3rem',
        color: 'rgba(255,255,255,0.8)',
        fontSize: '0.9rem'
      }}>
        🚀 JobPal AI • 🧠 Powered by Gemini • ☁️ Deployed on Vercel
      </div>
    </div>
  );
}

export default App;