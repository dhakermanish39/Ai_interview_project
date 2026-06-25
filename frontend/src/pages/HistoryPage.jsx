import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../services/api';

export default function HistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/interview/history')
      .then(res => setSessions(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Navbar />
      <div className="container" style={{padding:'30px 20px'}}>
        <h2 style={{marginBottom:'20px'}}>📋 Interview History</h2>
        {loading ? <p>Loading...</p> : sessions.length === 0 ? (
          <div className="card" style={{textAlign:'center', padding:'40px', color:'#888'}}>
            <p>No completed sessions yet.</p>
            <button className="btn btn-primary" style={{marginTop:'12px'}}
              onClick={() => navigate('/interview')}>Start Practice</button>
          </div>
        ) : (
          sessions.map(s => (
            <div key={s._id} className="card" style={{marginBottom:'16px',
              display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <span className="badge" style={{marginRight:'8px'}}>{s.session_type}</span>
                <strong>{s.role || 'General'}</strong>
                <p style={{color:'#666', fontSize:'13px', marginTop:'4px'}}>
                  {s.difficulty} • {new Date(s.created_at).toLocaleDateString()}
                </p>
              </div>
              <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                <span style={{fontSize:'20px', fontWeight:'700',
                  color: s.total_score >= 7 ? '#10b981' : s.total_score >= 5 ? '#f59e0b' : '#ef4444'}}>
                  {s.total_score}/10
                </span>
                <button className="btn btn-secondary"
                  style={{padding:'6px 12px', fontSize:'13px'}}
                  onClick={() => navigate(`/result/${s._id}`)}>
                  View
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}