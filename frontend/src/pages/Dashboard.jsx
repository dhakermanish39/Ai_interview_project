import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import Navbar from '../components/Navbar';
import GoalCard from '../components/GoalCard';
import API from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyRes, resumeRes] = await Promise.all([
          API.get('/interview/history'),
          API.get('/resume').catch(() => ({ data: null }))
        ]);
        setSessions(historyRes.data);
        setResume(resumeRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const avgScore = sessions.length
    ? (sessions.reduce((sum, s) => sum + s.total_score, 0) / sessions.length).toFixed(1)
    : 0;

  return (
    <div>
      <Navbar />
      <div className="container dashboard">

        {/* Welcome Banner */}
        <div className="welcome-banner card">
          <div>
            <h2>{t('welcomeBack')}, {user?.name}! 👋</h2>
            <p>{t('targetRole')}: <strong>{user?.target_role || t('notSet')}</strong></p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/interview')}>
            {t('startPractice')}
          </button>
        </div>

        {/* Daily Goal Card */}
        <GoalCard />

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card card">
            <h3>{sessions.length}</h3>
            <p>{t('totalSessions')}</p>
          </div>
          <div className="stat-card card">
            <h3>{avgScore}/10</h3>
            <p>{t('avgScore')}</p>
          </div>
          <div className="stat-card card">
            <h3>{resume ? '✅' : '❌'}</h3>
            <p>{t('resumeUploaded')}</p>
          </div>
          <div className="stat-card card">
            <h3>{sessions.filter(s => s.total_score >= 7).length}</h3>
            <p>{t('goodSessions')}</p>
          </div>
        </div>

        {/* Resume Upload Banner */}
        {!resume && (
          <div className="card upload-banner">
            <p>📄 Upload your resume to get personalized interview questions!</p>
            <button className="btn btn-secondary" onClick={() => navigate('/profile')}>
              Upload Resume
            </button>
          </div>
        )}

        {/* Score Trend Chart */}
        {sessions.length > 0 && (
          <div className="card" style={{marginBottom:'24px'}}>
            <h3 style={{marginBottom:'20px'}}>📊 Score Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sessions.slice(0, 8).reverse().map((s, i) => ({
                name: `#${i + 1} ${s.role || s.session_type}`,
                score: parseFloat(s.total_score),
              }))}>
                <XAxis dataKey="name" tick={{fontSize: 11}} />
                <YAxis domain={[0, 10]} tick={{fontSize: 11}} />
                <Tooltip
                  formatter={(val) => [`${val}/10`, 'Score']}
                  contentStyle={{borderRadius:'8px', fontSize:'13px'}}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {sessions.slice(0, 8).map((s, i) => (
                    <Cell key={i}
                      fill={s.total_score >= 7 ? '#10b981' : s.total_score >= 5 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent Sessions */}
        <div className="card">
          <h3 style={{marginBottom:'16px'}}>{t('recentSessions')}</h3>
          {loading ? (
            <p>Loading...</p>
          ) : sessions.length === 0 ? (
            <div className="empty-state">
              <p>{t('noSessions')}</p>
              <button className="btn btn-primary" onClick={() => navigate('/interview')}>
                {t('startNow')}
              </button>
            </div>
          ) : (
            <table className="sessions-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Role</th>
                  <th>Difficulty</th>
                  <th>Score</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sessions.slice(0, 5).map(s => (
                  <tr key={s._id}>
                    <td><span className="badge">{s.session_type}</span></td>
                    <td>{s.role || '-'}</td>
                    <td>{s.difficulty}</td>
                    <td>
                      <span className={`score ${s.total_score >= 7 ? 'good' : s.total_score >= 5 ? 'avg' : 'low'}`}>
                        {s.total_score}/10
                      </span>
                    </td>
                    <td>{new Date(s.created_at).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-secondary"
                        style={{padding:'4px 10px', fontSize:'12px'}}
                        onClick={() => navigate(`/result/${s._id}`)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}