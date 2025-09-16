import { useState } from 'react';
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
    setParsedResume(null);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    setUploadStatus('Uploading and parsing resume...');
    setError('');
    setParsedResume(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const apiUrl = getApiBaseUrl();
      const response = await fetch(`${apiUrl}/api/upload_resume`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Upload response:', data); // Debug log
      
      if (data.error) {
        setError(data.error);
        setUploadStatus('');
      } else {
        setParsedResume(data.data);
        console.log('Parsed resume set:', data.data); // Debug log
        setUploadStatus(`✅ Resume parsed successfully! Found ${data.data.experience?.length || 0} experience entries, ${data.data.projects?.length || 0} projects, and ${data.data.skills?.length || 0} skill categories.`);
      }
    } catch (error) {
      setError(`Upload error: ${error.message}`);
      setUploadStatus('');
    }
  };

      const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      setResults([]);
      setProcessingTime(0);
      setProcessingProgress('');

          const startTime = Date.now();
      const timer = setInterval(() => {
        setProcessingTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      
      // Add progress simulation for resume processing
      let progressInterval;
      if (inputMode === 'upload' && parsedResume) {
        progressInterval = setInterval(() => {
          setProcessingProgress(prev => {
            if (prev.includes('Chunk 7')) return 'Finalizing results...';
            if (prev.includes('Chunk 6')) return 'Processing Chunk 7/7...';
            if (prev.includes('Chunk 5')) return 'Processing Chunk 6/7...';
            if (prev.includes('Chunk 4')) return 'Processing Chunk 5/7...';
            if (prev.includes('Chunk 3')) return 'Processing Chunk 4/7...';
            if (prev.includes('Chunk 2')) return 'Processing Chunk 3/7...';
            if (prev.includes('Chunk 1')) return 'Processing Chunk 2/7...';
            return 'Processing Chunk 1/7...';
          });
        }, 2000); // Update every 2 seconds
      }

    try {
      const apiUrl = getApiBaseUrl();
      console.log('Connecting to API at:', apiUrl);
      
      let response;
      
      if (inputMode === 'upload' && parsedResume) {
        // Use the new entire resume matching endpoint
        response = await fetch(`${apiUrl}/api/match_entire_resume`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            resume_data: parsedResume, 
            jd: jd.trim(),
            structure: structureType,
            focus_areas: focusAreas
          })
        });
      } else {
        // Use the existing manual bullet matching endpoint
        const bullets = bulletsText.split('\n').map(b => b.trim()).filter(b => b);

        if (bullets.length === 0) {
          setError('Please enter at least one resume bullet point');
          setLoading(false);
          clearInterval(timer);
          return;
        }

        response = await fetch(`${apiUrl}/api/bulk_match_bullets_to_jd`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            bullets, 
            jd: jd.trim(),
            structure: structureType
          })
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else if (inputMode === 'upload' && data.improved_results) {
        // Handle comprehensive resume results
        setResults(data.improved_results);
      } else {
        // Handle manual bullet results
        setResults(data.improved_bullets || []);
      }
    } catch (error) {
      const apiUrl = getApiBaseUrl();
      setError(`Error: ${error.message}. Make sure the server is running on ${apiUrl}`);
    }

    clearInterval(timer);
    if (progressInterval) clearInterval(progressInterval);
    setLoading(false);
  };

  const renderResults = () => {
    if (!results || results.length === 0) return null;

    if (inputMode === 'upload' && typeof results === 'object') {
      // Render comprehensive resume results
      return (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          border: '1px solid #f3f4f6',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
            🎯 Optimized Resume Results ({structureType.toUpperCase()} Format)
          </h2>
          
          {results.experience && results.experience.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#4b5563', marginBottom: '1rem' }}>
                💼 Work Experience
              </h3>
              {results.experience.map((exp, idx) => (
                <div key={idx} style={{ 
                  background: '#f9fafb', 
                  borderRadius: '8px', 
                  padding: '1rem', 
                  marginBottom: '1rem',
                  border: '1px solid #e5e7eb'
                }}>
                  <h4 style={{ fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                    {exp.title} at {exp.company}
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                    {exp.dates}
                  </p>
                  <div style={{ marginBottom: '1rem' }}>
                    <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#4b5563', marginBottom: '0.5rem' }}>Original:</h5>
                    {exp.original_bullets?.map((bullet, bIdx) => (
                      <p key={bIdx} style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                        • {bullet}
                      </p>
                    ))}
                  </div>
                  <div>
                    <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#059669', marginBottom: '0.5rem' }}>Improved ({structureType.toUpperCase()}):</h5>
                    {exp.improved_bullets?.map((bullet, bIdx) => (
                      <p key={bIdx} style={{ fontSize: '0.875rem', color: '#059669', marginBottom: '0.25rem' }}>
                        • {bullet}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {results.projects && results.projects.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#4b5563', marginBottom: '1rem' }}>
                🚀 Projects
              </h3>
              {results.projects.map((project, idx) => (
                <div key={idx} style={{ 
                  background: '#f9fafb', 
                  borderRadius: '8px', 
                  padding: '1rem', 
                  marginBottom: '1rem',
                  border: '1px solid #e5e7eb'
                }}>
                  <h4 style={{ fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                    {project.name}
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                    {project.description}
                  </p>
                  <div style={{ marginBottom: '1rem' }}>
                    <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#4b5563', marginBottom: '0.5rem' }}>Original:</h5>
                    {project.original_bullets?.map((bullet, bIdx) => (
                      <p key={bIdx} style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                        • {bullet}
                      </p>
                    ))}
                  </div>
                  <div>
                    <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#059669', marginBottom: '0.5rem' }}>Improved ({structureType.toUpperCase()}):</h5>
                    {project.improved_bullets?.map((bullet, bIdx) => (
                      <p key={bIdx} style={{ fontSize: '0.875rem', color: '#059669', marginBottom: '0.25rem' }}>
                        • {bullet}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {results.skills && results.skills.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#4b5563', marginBottom: '1rem' }}>
                🛠️ Skills & Expertise
              </h3>
              {results.skills.map((skillCategory, idx) => (
                <div key={idx} style={{ 
                  background: '#f9fafb', 
                  borderRadius: '8px', 
                  padding: '1rem', 
                  marginBottom: '1rem',
                  border: '1px solid #e5e7eb'
                }}>
                  <h4 style={{ fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
                    {skillCategory.category}
                  </h4>
                  {skillCategory.skills.map((skill, sIdx) => (
                    <div key={sIdx} style={{ marginBottom: '1rem' }}>
                      <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#4b5563', marginBottom: '0.5rem' }}>
                        {skill.skill} (Confidence: {Math.round(skill.confidence * 100)}%)
                      </h5>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                          <strong>Original:</strong> {skill.original_context}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.875rem', color: '#059669', marginBottom: '0.25rem' }}>
                          <strong>Improved ({structureType.toUpperCase()}):</strong> {skill.improved_context}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } else {
      // Render manual bullet results
      return (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          border: '1px solid #f3f4f6',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
            🎯 Optimized Bullets ({structureType.toUpperCase()} Format)
          </h2>
          {results.map((bullet, index) => (
            <div key={index} style={{
              background: '#f0f9ff',
              border: '1px solid #0ea5e9',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <span style={{
                  background: '#0ea5e9',
                  color: 'white',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  marginRight: '0.75rem',
                  flexShrink: 0
                }}>
                  {index + 1}
                </span>
                <p style={{ margin: 0, fontSize: '1rem', lineHeight: '1.5', color: '#0c4a6e' }}>
                  {bullet}
                </p>
              </div>
            </div>
          ))}
        </div>
      );
    }
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
              AI-Powered Resume Optimization with Enhanced Skills Detection
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
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#8b5cf6', borderRadius: '50%', marginRight: '0.5rem' }}></div>
                200+ Skills Detected
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

        {/* Input Mode Toggle */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          border: '1px solid #f3f4f6',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
            📋 Choose Input Method
          </h3>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={() => setInputMode('manual')}
              style={{
                padding: '0.75rem 1.5rem',
                background: inputMode === 'manual' ? 'linear-gradient(135deg, #2563eb, #4f46e5)' : '#f3f4f6',
                color: inputMode === 'manual' ? 'white' : '#374151',
                fontWeight: '600',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              ✏️ Manual Input
            </button>
            <button
              type="button"
              onClick={() => setInputMode('upload')}
              style={{
                padding: '0.75rem 1.5rem',
                background: inputMode === 'upload' ? 'linear-gradient(135deg, #2563eb, #4f46e5)' : '#f3f4f6',
                color: inputMode === 'upload' ? 'white' : '#374151',
                fontWeight: '600',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              📄 Resume Upload
            </button>
          </div>
          
          {/* Format Selection */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              🎯 Output Format
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {['star', 'xyz', 'standard'].map((format) => (
                <button
                  key={format}
                  type="button"
                  onClick={() => setStructureType(format)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: structureType === format ? 'linear-gradient(135deg, #10b981, #059669)' : '#f3f4f6',
                    color: structureType === format ? 'white' : '#374151',
                    fontWeight: '500',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
              <strong>STAR:</strong> Situation, Task, Action, Result | <strong>XYZ:</strong> Accomplished X by implementing Y, which resulted in Z
            </p>
          </div>
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
            
            {inputMode === 'manual' ? (
              /* Manual Input Mode */
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
            ) : (
              /* Resume Upload Mode */
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
                  📄 Upload Resume
                </label>
                <div style={{
                  border: '2px dashed #d1d5db',
                  borderRadius: '12px',
                  padding: '2rem',
                  textAlign: 'center',
                  background: '#f9fafb',
                  transition: 'all 0.2s ease'
                }}>
                  <input
                    type="file"
                    accept=".pdf,.json,.md,.markdown,.txt"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload" style={{ cursor: 'pointer' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                      Click to upload resume
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                      Supports PDF, JSON, Markdown, and Text files
                    </div>
                    <div style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                      color: 'white',
                      borderRadius: '8px',
                      display: 'inline-block'
                    }}>
                      Choose File
                    </div>
                  </label>
                </div>
                
                {uploadedFile && (
                  <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #0ea5e9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>📎</span>
                      <strong>{uploadedFile.name}</strong>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#0c4a6e', margin: 0 }}>
                      {uploadStatus || 'File uploaded successfully'}
                    </p>
                  </div>
                )}

                {parsedResume && (
                  <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #22c55e' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>✅</span>
                      <strong>Resume Parsed Successfully!</strong>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#166534' }}>
                      <p style={{ margin: '0.25rem 0' }}>📝 Name: {parsedResume.name}</p>
                      <p style={{ margin: '0.25rem 0' }}>💼 Experience: {parsedResume.experience?.length || 0} entries</p>
                      <p style={{ margin: '0.25rem 0' }}>🚀 Projects: {parsedResume.projects?.length || 0} entries</p>
                      <p style={{ margin: '0.25rem 0' }}>🛠️ Skills: {parsedResume.skills?.length || 0} categories</p>
                    </div>
                  </div>
                )}
              </div>
            )}

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
                The AI will analyze this and optimize your {inputMode === 'upload' ? 'resume' : 'bullets'} to match
              </p>
            </div>

            {/* Submit Button */}
            {console.log('Button state:', { inputMode, parsedResume, loading })} {/* Debug log */}
            <button
              type="submit"
              disabled={loading || (inputMode === 'upload' && !parsedResume)}
              style={{
                width: '100%',
                padding: '1rem',
                background: loading || (inputMode === 'upload' && !parsedResume) ? '#9ca3af' : 'linear-gradient(135deg, #2563eb, #4f46e5)',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '12px',
                border: 'none',
                fontSize: '1rem',
                cursor: loading || (inputMode === 'upload' && !parsedResume) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                minHeight: '48px'
              }}
              onMouseEnter={(e) => {
                if (!loading && !(inputMode === 'upload' && !parsedResume)) {
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
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
                  {processingProgress && (
                    <div style={{ fontSize: '0.875rem', color: '#e0e7ff', textAlign: 'center' }}>
                      {processingProgress}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  🚀 {inputMode === 'upload' ? 'Optimize Entire Resume' : 'Match Resume to Job'}
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
        {renderResults()}
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
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
