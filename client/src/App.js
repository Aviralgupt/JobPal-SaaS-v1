import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [bulletsText, setBulletsText] = useState('');
  const [jd, setJd] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('optimize');

  // Load demo data on start
  useEffect(() => {
    setBulletsText(`• Managed a team of 5 developers
• Increased website traffic by 20%
• Implemented new CRM system
• Led development of microservices architecture
• Optimized database performance for better scalability`);
    setJd("Software Engineer position requiring team leadership, web development experience, and system implementation skills. Looking for someone who can manage projects and drive technical improvements.");
  }, []);

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
          {['optimize', 'results'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === tab ? 'white' : 'transparent',
                color: activeTab === tab ? '#667eea' : 'white',
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.3s ease'
              }}
            >
              {tab === 'optimize' ? '⚡ Optimize' : '✨ Results'}
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
            <h2 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
              📝 Resume Bullets
            </h2>
            
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