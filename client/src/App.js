import { useState } from 'react';
import './App.css';

function App() {
  const [bulletsText, setBulletsText] = useState('');
  const [jd, setJd] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResults([]);

    const bullets = bulletsText.split('\n').map(b => b.trim()).filter(b => b);

    try {
      const response = await fetch('http://localhost:5000/api/bulk_match_bullets_to_jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bullets, jd })
      });

      const data = await response.json();
      setResults(data.improved_bullets);
    } catch (error) {
      setResults([`Error: ${error.message}`]);
    }

    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem' }}>
      <div style={{
        maxWidth: '700px', margin: '0 auto', backgroundColor: 'white',
        padding: '2rem', borderRadius: '1rem', boxShadow: '0 0 20px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', textAlign: 'center' }}>
          JobPal – AI Resume Bullet Improver 🚀
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label><b>Resume Bullets (one per line)</b></label>
            <textarea
              rows="5"
              value={bulletsText}
              onChange={(e) => setBulletsText(e.target.value)}
              placeholder="Enter multiple resume bullets, one per line"
              style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label><b>Job Description</b></label>
            <textarea
              rows="5"
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the job description here"
              style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #ccc' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '1rem', fontWeight: 'bold',
              backgroundColor: '#2563eb', color: 'white',
              borderRadius: '8px', border: 'none', fontSize: '1rem'
            }}
          >
            {loading ? 'Processing...' : 'Match Resume to Job'}
          </button>
        </form>

        {results.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Improved Bullets:</h2>
            {results.map((bullet, idx) => (
              <div key={idx} style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
                <b>Bullet {idx + 1}:</b> {bullet}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
