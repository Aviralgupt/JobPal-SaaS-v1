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
      
      if (data.success) {
        setParsedResume(data.resume_data);
        setUploadStatus(`✅ Resume parsed successfully! Found ${data.summary.total_bullets} bullets across ${data.summary.sections_found} sections.`);
        
        // Auto-populate bullets from parsed resume
        const allBullets = [];
        
        // Extract bullets from experience
        data.resume_data.experience?.forEach(exp => {
          allBullets.push(...exp.bullets);
        });
        
        // Extract bullets from projects
        data.resume_data.projects?.forEach(project => {
          allBullets.push(...project.bullets);
        });
        
        setBulletsText(allBullets.join('\n'));
      } else {
        throw new Error(data.error || 'Upload failed');
      }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6">
            <span className="text-3xl">🚀</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
            JobPal AI
          </h1>
          <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
            Transform your resume bullets with AI-powered optimization. Stand out with STAR, XYZ formats, and intelligent matching.
          </p>
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 rounded-full px-6 py-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
            <span className="text-green-400 font-medium">Powered by Google Gemini AI</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-1 border border-white/20">
            <div className="flex space-x-1">
              {[
                { id: 'optimize', label: 'Optimize', icon: '⚡' },
                { id: 'upload', label: 'Upload Resume', icon: '📄' },
                { id: 'results', label: 'Results', icon: '✨' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-white text-purple-900 shadow-lg transform scale-105'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl mx-auto">
          {/* Optimize Tab */}
          {activeTab === 'optimize' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Resume Bullets Section */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <span className="mr-3">📝</span>
                    Resume Bullets
                  </h2>
                  <button
                    type="button"
                    onClick={loadDemoData}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    ✨ Load Demo
                  </button>
                </div>
                
                <textarea
                  value={bulletsText}
                  onChange={(e) => setBulletsText(e.target.value)}
                  placeholder="Enter your resume bullets, one per line... 

• Managed a team of 5 developers
• Increased website traffic by 20%
• Implemented new CRM system"
                  className="w-full h-40 p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none backdrop-blur-sm transition-all duration-300"
                />
                
                <div className="flex justify-between items-center mt-4">
                  <p className="text-gray-300 text-sm">
                    <span className="font-medium text-purple-400">
                      {bulletsText.split('\n').filter(line => line.trim()).length}
                    </span> bullets entered
                  </p>
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
              <div className="text-center">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-12 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-2xl text-lg"
                >
                  {loading ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing with AI...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <span>🚀</span>
                      <span>Optimize with Gemini AI</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="mr-3">📁</span>
                  Upload Your Resume
                </h2>
                
                <div className="border-2 border-dashed border-white/30 rounded-2xl p-12 text-center hover:border-purple-400 transition-all duration-300">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt,.md,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="cursor-pointer flex flex-col items-center space-y-4"
                  >
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-3xl">📄</span>
                    </div>
                    <div>
                      <p className="text-xl text-white font-medium mb-2">
                        Click to upload your resume
                      </p>
                      <p className="text-gray-300">
                        Supports PDF, DOCX, TXT, MD, JSON
                      </p>
                    </div>
                  </label>
                  
                  {uploadStatus && (
                    <div className="mt-6 p-4 bg-blue-500/20 rounded-xl border border-blue-400/30">
                      <p className="text-blue-300">{uploadStatus}</p>
                    </div>
                  )}
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
