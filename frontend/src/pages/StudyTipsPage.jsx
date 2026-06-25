import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import API from '../services/api';
import '../styles/StudyTips.css';

export default function StudyTipsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/study-tips')
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  const priorityColor = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };

  return (
    <div>
      <Navbar />
      <div className="container" style={{padding:'30px 20px'}}>
        <h2 style={{marginBottom:'6px'}}>💡 AI Study Tips</h2>
        <p style={{color:'#666', marginBottom:'24px'}}>
          Personalized tips based on your performance
        </p>

        {loading ? (
          <div className="card" style={{textAlign:'center', padding:'40px'}}>
            <p style={{fontSize:'18px'}}>🤖 AI analyzing your performance...</p>
          </div>
        ) : !data || data.tips.length === 0 ? (
          <div className="card" style={{textAlign:'center', padding:'40px', color:'#888'}}>
            <p style={{fontSize:'32px', marginBottom:'12px'}}>📊</p>
            <p>{data?.message || 'Complete sessions to get tips!'}</p>
          </div>
        ) : (
          <>
            {/* Weak Areas */}
            {data.weakAreas?.length > 0 && (
              <div className="card" style={{marginBottom:'24px'}}>
                <h3 style={{marginBottom:'14px'}}>⚠️ Areas to Improve</h3>
                <div className="weak-areas">
                  {data.weakAreas.map((a, i) => (
                    <div key={i} className="weak-chip">
                      <span>{a.type}</span>
                      <span className="weak-score">{a.avg}/10</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="tips-grid">
              {data.tips.map((tip, i) => (
                <div key={i} className="tip-card card">
                  <div className="tip-header">
                    <h3>{tip.topic}</h3>
                    <span className="priority-badge"
                      style={{background: priorityColor[tip.priority] + '20',
                        color: priorityColor[tip.priority]}}>
                      {tip.priority} priority
                    </span>
                  </div>
                  <p className="tip-text">{tip.tip}</p>
                  <div className="tip-resource">
                    <span>📚</span>
                    <p>{tip.resources}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}