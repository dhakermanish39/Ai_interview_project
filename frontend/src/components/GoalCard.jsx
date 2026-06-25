import { useState, useEffect } from 'react';
import API from '../services/api';
import '../styles/GoalCard.css';

export default function GoalCard() {
  const [goal, setGoal] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newGoal, setNewGoal] = useState(5);

  useEffect(() => {
    API.get('/goal').then(res => {
      setGoal(res.data);
      setNewGoal(res.data.daily_goal);
    });
  }, []);

  const handleSave = async () => {
    const res = await API.put('/goal', { daily_goal: newGoal });
    setGoal(res.data.goal);
    setEditing(false);
  };

  if (!goal) return null;

  const percent = Math.min((goal.today_count / goal.daily_goal) * 100, 100);
  const completed = goal.today_count >= goal.daily_goal;

  return (
    <div className={`goal-card card ${completed ? 'completed' : ''}`}>
      <div className="goal-header">
        <div>
          <h3>🎯 Daily Goal</h3>
          <p className="streak">🔥 {goal.streak} day streak</p>
        </div>
        <button className="edit-btn" onClick={() => setEditing(!editing)}>
          {editing ? 'Cancel' : '✏️ Edit'}
        </button>
      </div>

      {editing ? (
        <div className="goal-edit">
          <label>Questions per day:</label>
          <div style={{display:'flex', gap:'8px', marginTop:'8px'}}>
            {[5, 10, 15, 20].map(n => (
              <button key={n}
                className={`goal-opt ${newGoal === n ? 'active' : ''}`}
                onClick={() => setNewGoal(n)}>
                {n}
              </button>
            ))}
          </div>
          <button className="btn btn-primary"
            style={{marginTop:'12px', width:'100%'}}
            onClick={handleSave}>
            Save Goal
          </button>
        </div>
      ) : (
        <>
          <div className="goal-progress">
            <div className="goal-bar">
              <div className="goal-fill" style={{width:`${percent}%`}} />
            </div>
            <div className="goal-count">
              <span>{goal.today_count}/{goal.daily_goal} questions today</span>
              <span>{Math.round(percent)}%</span>
            </div>
          </div>
          {completed && (
            <div className="goal-done">
              🎉 Daily goal completed! Amazing work!
            </div>
          )}
        </>
      )}
    </div>
  );
}