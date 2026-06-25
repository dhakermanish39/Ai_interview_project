import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import API from '../services/api';
import '../styles/Leaderboard.css';

export default function LeaderboardPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/leaderboard')
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div>
      <Navbar />
      <div className="container" style={{padding:'30px 20px'}}>
        <h2 style={{marginBottom:'6px'}}>🏆 Leaderboard</h2>
        <p style={{color:'#666', marginBottom:'24px'}}>Top performers this week</p>

        {loading ? <p>Loading...</p> : (
          <div className="leaderboard-list">
            {data.map((user, index) => (
              <div key={index}
                className={`leaderboard-card card ${user.is_me ? 'is-me' : ''}`}>
                <div className="rank">
                  {index < 3 ? medals[index] : `#${user.rank}`}
                </div>
                <div className="user-info">
                  <div className="user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="user-name">
                      {user.name} {user.is_me && <span className="you-badge">You</span>}
                    </p>
                    <p className="user-role">{user.target_role || 'Developer'}</p>
                  </div>
                </div>
                <div className="user-stats">
                  <div className="stat">
                    <span className="stat-val">{user.avg_score}/10</span>
                    <span className="stat-label">Avg Score</span>
                  </div>
                  <div className="stat">
                    <span className="stat-val">{user.total_sessions}</span>
                    <span className="stat-label">Sessions</span>
                  </div>
                  <div className="stat">
                    <span className="stat-val">{user.best_score}/10</span>
                    <span className="stat-label">Best</span>
                  </div>
                </div>
              </div>
            ))}

            {data.length === 0 && (
              <div className="card" style={{textAlign:'center', padding:'40px', color:'#888'}}>
                No data yet. Complete sessions to appear on leaderboard!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}