import { useState, useEffect } from 'react';
import './App.css';

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
    setUploadStatus('📤 Uploading and parsing resume...');
    setError('');
    setParsedResume(null);

    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock resume parsing based on file type
      const mockResumeData = {
        name: "John Doe",
        email: "john.doe@email.com",
        phone: "+1 (555) 123-4567",
        summary: "Experienced software engineer with 5+ years in full-stack development",
        experience: [
          {
            company: "Tech Corp",
            title: "Senior Software Engineer",
            dates: "2021-2024",
            bullets: [
              "Led development of microservices architecture serving 1M+ users",
              "Implemented CI/CD pipelines reducing deployment time by 60%",
              "Mentored junior developers and conducted code reviews",
              "Optimized database queries improving performance by 40%",
              "Built responsive web applications using React and Node.js"
            ]
          },
          {
            company: "StartupXYZ",
            title: "Full Stack Developer", 
            dates: "2019-2021",
            bullets: [
              "Developed real-time inventory management system",
              "Integrated payment processing with Stripe API",
              "Collaborated with design team to implement pixel-perfect UIs",
              "Implemented automated email marketing campaigns"
            ]
          }
        ]
      };

      setParsedResume(mockResumeData);
      
      // Auto-populate bullets from parsed resume
      const allBullets = mockResumeData.experience.flatMap(exp => exp.bullets);
      setBulletsText(allBullets.map(bullet => `• ${bullet}`).join('\n'));
      
      setUploadStatus('✅ Resume parsed successfully! Found ' + allBullets.length + ' bullets across ' + mockResumeData.experience.length + ' sections.');
      
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

    try {
      const bullets = bulletsText.split('\n').filter(bullet => bullet.trim() !== '');
      
      if (bullets.length === 0) {
        throw new Error('Please enter some resume bullets');
      }

      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate optimized results
      const optimizedResults = [
        "✨ Led a cross-functional team of 5 developers, implementing agile methodologies that increased team productivity by 40% and reduced project delivery time by 3 weeks",
        "✨ Drove 20% increase in website traffic through comprehensive SEO optimization and performance enhancements, resulting in 15% higher conversion rates",
        "✨ Spearheaded CRM system implementation, reducing customer response time by 50% and improving data accuracy by 85% through strategic migration planning",
        "✨ Architected and implemented microservices solution that improved system scalability by 300% and reduced deployment time from hours to minutes",
        "✨ Enhanced database performance through strategic query optimization and indexing, achieving 75% faster response times and 200% increased capacity"
      ];

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
              📤 Upload Your Resume
            </h2>
            
            {/* Upload Area */}
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
                Drop your PDF, DOCX, or text file
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>
                We'll extract and analyze your bullets automatically
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

            {/* AI Processing Steps */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📤</div>
                <h4 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1rem' }}>Upload Resume</h4>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', margin: 0 }}>
                  Drop your PDF, DOCX, or text file
                </p>
              </div>
              
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🤖</div>
                <h4 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1rem' }}>AI Processing</h4>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', margin: 0 }}>
                  We extract and analyze your bullets
                </p>
              </div>
              
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✨</div>
                <h4 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1rem' }}>Get Results</h4>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', margin: 0 }}>
                  Receive optimized, job-matched bullets
                </p>
              </div>
            </div>

            {/* Continue Button */}
            {parsedResume && (
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => setActiveTab('optimize')}
                  style={{
                    background: '#667eea',
                    color: 'white',
                    padding: '1rem 2rem',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#5a6fd8'}
                  onMouseLeave={(e) => e.target.style.background = '#667eea'}
                >
                  Continue to Optimize →
                </button>
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