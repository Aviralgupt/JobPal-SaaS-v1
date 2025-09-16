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

  // Get the correct API base URL for Vercel deployment
  const getApiBaseUrl = () => {
    // For Vercel deployment, use relative URLs which will use the same domain
    if (process.env.NODE_ENV === 'production') {
      return ''; // Use relative URLs in production (Vercel will handle routing)
    }
    // For local development, still use localhost
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
    
    const startTime = Date.now();
    
    try {
      const bullets = bulletsText.split('\n').filter(bullet => bullet.trim() !== '');
      
      if (bullets.length === 0) {
        throw new Error('Please enter some resume bullets');
      }
      
      if (!jd.trim()) {
        throw new Error('Please enter a job description');
      }

      const apiUrl = getApiBaseUrl();
      const response = await fetch(`${apiUrl}/api/bulk_match_bullets_to_jd`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bullets: bullets,
          jd: jd,
          structure: structureType,
          project_context: focusAreas.join(', ')
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setResults(data.improved_bullets || []);
      setProcessingTime(Date.now() - startTime);
      
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🚀 JobPal AI (Gemini Version)
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            AI-powered resume bullet optimizer using Google Gemini
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 max-w-2xl mx-auto">
            <p className="text-green-800 text-sm">
              ✨ This version uses Google Gemini API and is deployed on Vercel for cloud access!
            </p>
          </div>
        </div>

        {/* Input Mode Toggle */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4">Choose Input Method</h3>
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setInputMode('manual')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  inputMode === 'manual'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Manual Entry
              </button>
              <button
                onClick={() => setInputMode('upload')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  inputMode === 'upload'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Upload Resume
              </button>
            </div>

            {inputMode === 'upload' && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.md,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="resume-upload"
                />
                <label
                  htmlFor="resume-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📄</span>
                  </div>
                  <p className="text-gray-600">
                    Click to upload your resume
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports PDF, DOCX, TXT, MD, JSON
                  </p>
                </label>
                
                {uploadStatus && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">{uploadStatus}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Form */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Resume Bullets Section */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Resume Bullets
                </h2>
                <button
                  type="button"
                  onClick={loadDemoData}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Load Demo
                </button>
              </div>
              
              <textarea
                value={bulletsText}
                onChange={(e) => setBulletsText(e.target.value)}
                placeholder="Enter your resume bullets, one per line..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              
              <p className="text-sm text-gray-500 mt-2">
                {bulletsText.split('\n').filter(line => line.trim()).length} bullets entered
              </p>
            </div>

            {/* Job Description Section */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Job Description
              </h2>
              
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the job description here..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Configuration Section */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-4">Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resume Format
                  </label>
                  <select
                    value={structureType}
                    onChange={(e) => setStructureType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="star">STAR Method (Situation, Task, Action, Result)</option>
                    <option value="xyz">XYZ Format (Accomplished X by Y resulting in Z)</option>
                    <option value="standard">Standard Format</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Focus Areas (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={focusAreas.join(', ')}
                    onChange={(e) => setFocusAreas(e.target.value.split(',').map(area => area.trim()).filter(Boolean))}
                    placeholder="leadership, technical skills, innovation"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  {loading ? 'Processing...' : 'Optimize Bullets with Gemini AI'}
                </button>
                
                {parsedResume && (
                  <button
                    type="button"
                    onClick={handleMatchEntireResume}
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    {loading ? 'Processing...' : 'Match Entire Resume'}
                  </button>
                )}
              </div>
              
              {processingProgress && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">{processingProgress}</p>
                </div>
              )}
            </div>
          </form>

          {/* Error Display */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">❌ {error}</p>
            </div>
          )}

          {/* Results Section */}
          {results.length > 0 && (
            <div className="mt-8 bg-white rounded-lg p-6 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  ✨ Optimized Results ({results.length} bullets)
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={copyAllResults}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Copy All
                  </button>
                  {processingTime > 0 && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm">
                      {(processingTime / 1000).toFixed(1)}s
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-2">
                          Bullet {index + 1}
                        </span>
                        <p className="text-gray-800">{result}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(result)}
                        className="ml-4 text-gray-500 hover:text-gray-700 transition-colors"
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
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>Built with ❤️ using Google Gemini AI • Deployed on Vercel</p>
        </div>
      </div>
    </div>
  );
}

export default App;
