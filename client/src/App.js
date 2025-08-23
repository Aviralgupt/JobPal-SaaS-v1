import { useState } from 'react';
import './App.css';

function App() {
  const [bulletsText, setBulletsText] = useState('');
  const [jd, setJd] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processingTime, setProcessingTime] = useState(0);

  // Get the correct API base URL for mobile/desktop
  const getApiBaseUrl = () => {
    // If we're on mobile (different IP), use the computer's IP
    if (window.location.hostname !== 'localhost') {
      return 'http://192.168.0.114:5000';
    }
    // If we're on desktop (localhost), use localhost
    return 'http://localhost:5000';
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults([]);
    setProcessingTime(0);

    const startTime = Date.now();
    const timer = setInterval(() => {
      setProcessingTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    const bullets = bulletsText.split('\n').map(b => b.trim()).filter(b => b);

    if (bullets.length === 0) {
      setError('Please enter at least one resume bullet point');
      setLoading(false);
      clearInterval(timer);
      return;
    }

    if (!jd.trim()) {
      setError('Please enter a job description');
      setLoading(false);
      clearInterval(timer);
      return;
    }

    try {
      const apiUrl = getApiBaseUrl();
      console.log('Connecting to API at:', apiUrl);
      
      const response = await fetch(`${apiUrl}/api/bulk_match_bullets_to_jd`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bullets, jd })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setResults(data.improved_bullets || []);
      }
    } catch (error) {
      const apiUrl = getApiBaseUrl();
      setError(`Error: ${error.message}. Make sure the server is running on ${apiUrl}`);
    }

    clearInterval(timer);
    setLoading(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #e0e7ff 100%)',
      padding: '1rem'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        borderBottom: '1px solid #e5e7eb',
        marginBottom: '2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.5rem'
            }}>
              JobPal AI
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1.125rem', marginBottom: '1rem' }}>
              AI-Powered Resume Optimization
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', marginRight: '0.5rem' }}></div>
                Local AI Processing
              </div>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%', marginRight: '0.5rem' }}></div>
                100% Private
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Demo Button */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button
            onClick={loadDemoData}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              fontWeight: '600',
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 8px 15px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
          >
            🎯 Load Demo Data
          </button>
          <p style={{ color: '#6b7280', marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Try with sample data first to see the AI in action!
          </p>
        </div>

        {/* Form */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          border: '1px solid #f3f4f6',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Resume Bullets */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
                📝 Resume Bullets (one per line)
              </label>
              <textarea
                rows="4"
                value={bulletsText}
                onChange={(e) => setBulletsText(e.target.value)}
                placeholder="Enter your resume bullet points here, one per line..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  fontSize: '16px',
                  resize: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                Example: "Managed a team of 5 developers" or "Increased sales by 25%"
              </p>
            </div>

            {/* Job Description */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
                💼 Job Description
              </label>
              <textarea
                rows="4"
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the job description here..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  fontSize: '16px',
                  resize: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                The AI will analyze this and optimize your bullets to match
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #2563eb, #4f46e5)',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '12px',
                border: 'none',
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                minHeight: '48px'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'scale(1.02)';
                  e.target.style.boxShadow = '0 8px 15px rgba(0,0,0,0.15)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginRight: '0.75rem'
                  }}></div>
                  🚀 AI is Processing... ({processingTime}s)
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  🚀 Match Resume to Job
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ color: '#dc2626', marginRight: '0.75rem', fontSize: '1.25rem' }}>⚠️</div>
              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#991b1b', margin: '0 0 0.25rem 0' }}>Error</h3>
                <p style={{ fontSize: '0.875rem', color: '#7f1d1d', margin: 0 }}>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {results.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            border: '1px solid #f3f4f6',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '1rem'
              }}>
                <span style={{ color: 'white', fontSize: '1.25rem' }}>✨</span>
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: '0 0 0.25rem 0' }}>
                  ✨ AI-Optimized Bullets
                </h2>
                <p style={{ color: '#6b7280', margin: 0 }}>Your resume bullets have been enhanced to match the job description</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {results.map((bullet, idx) => (
                <div key={idx} style={{
                  background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                  border: '1px solid #bfdbfe',
                  borderRadius: '12px',
                  padding: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '0.75rem',
                      marginTop: '2px'
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#1f2937', lineHeight: '1.6', margin: 0 }}>{bullet}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: '#eff6ff',
              borderRadius: '12px',
              border: '1px solid #bfdbfe'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', color: '#1e40af' }}>
                <span style={{ marginRight: '0.5rem' }}>💡</span>
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                  These bullets are now optimized for your target job and will help you stand out to recruiters!
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        background: '#f9fafb',
        borderTop: '1px solid #e5e7eb',
        marginTop: '4rem',
        padding: '1.5rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
            Built with ❤️ using React, Flask, and Ollama • 100% Local AI Processing
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .min-h-screen { padding: 0.5rem; }
          button { min-height: 44px; }
          textarea { font-size: 16px; }
        }
      `}</style>
    </div>
  );
}

export default App;
