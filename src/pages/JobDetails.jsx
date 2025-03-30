import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import pb from '../api/pocketbase';
import './JobDetails.css';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const record = await pb.collection('extension_data').getOne(id);
        setJob(record);
      } catch (err) {
        console.error('Failed to fetch job:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const performAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate analysis - replace with actual API calls
      const fakeAnalysis = {
        skillsMatch: Math.floor(Math.random() * 100),
        companyRating: (Math.random() * 5).toFixed(1),
        responseProbability: Math.floor(Math.random() * 100),
        keywords: ['React', 'Node.js', 'TypeScript'].sort(() => 0.5 - Math.random()).slice(0, 3)
      };
      
      setTimeout(() => {
        setAnalysis(fakeAnalysis);
        setIsAnalyzing(false);
      }, 1500);
    } catch (err) {
      console.error('Analysis failed:', err);
      setIsAnalyzing(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      await pb.collection('extension_data').update(id, { status: newStatus });
      setJob({...job, status: newStatus});
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  if (loading) return <div className="loading">Loading job details...</div>;
  if (!job) return <div className="error">Job not found</div>;

  return (
    <div className="job-details-container">
      <header className="job-header">
        <button onClick={() => navigate(-1)} className="back-button">
          &larr; Back
        </button>
        <h1>{job.title}</h1>
        <div className="job-meta">
          <span className="company">{job.company}</span>
          <span className="status-badge">{job.status}</span>
          <span className="date">Saved: {new Date(job.created).toLocaleDateString()}</span>
        </div>
      </header>

      <div className="job-content">
        <section className="job-actions">
          <a href={job.url} target="_blank" rel="noopener noreferrer" className="action-button">
            View Original Posting
          </a>
          
          <button 
            onClick={performAnalysis} 
            className="action-button primary"
            disabled={isAnalyzing}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Job'}
          </button>

          <div className="status-actions">
            <h3>Update Status:</h3>
            <div className="status-buttons">
              {['pending', 'active', 'ghosted', 'rejected', 'archived'].map(status => (
                <button
                  key={status}
                  onClick={() => updateStatus(status)}
                  className={`status-button ${job.status === status ? 'active' : ''}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </section>

        {analysis && (
          <section className="analysis-results">
            <h2>Analysis Results</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Skills Match</h3>
                <div className="stat-value">{analysis.skillsMatch}%</div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${analysis.skillsMatch}%` }}
                  ></div>
                </div>
              </div>

              <div className="stat-card">
                <h3>Company Rating</h3>
                <div className="stat-value">{analysis.companyRating}/5</div>
                <div className="stars">
                  {'★'.repeat(Math.floor(analysis.companyRating))}
                  {'☆'.repeat(5 - Math.floor(analysis.companyRating))}
                </div>
              </div>

              <div className="stat-card">
                <h3>Response Probability</h3>
                <div className="stat-value">{analysis.responseProbability}%</div>
                <div className="probability-meter">
                  <div 
                    className="probability-fill" 
                    style={{ width: `${analysis.responseProbability}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="keywords-section">
              <h3>Key Skills Mentioned:</h3>
              <div className="keywords-list">
                {analysis.keywords.map((keyword, i) => (
                  <span key={i} className="keyword-tag">{keyword}</span>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="job-notes">
          <h3>Your Notes</h3>
          <textarea
            placeholder="Add your notes about this job..."
            defaultValue={job.notes || ''}
            onBlur={async (e) => {
              try {
                await pb.collection('extension_data').update(id, { notes: e.target.value });
              } catch (err) {
                console.error('Failed to save notes:', err);
              }
            }}
          />
        </section>
      </div>
    </div>
  );
}