import { useState } from 'react';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import '../styles/Schedule.css';

export default function SchedulePage() {
  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem('interview_schedule');
    return saved ? JSON.parse(saved) : [];
  });
  const [form, setForm] = useState({ title: '', date: '', time: '', type: 'practice', notes: '' });
  const [toast, setToast] = useState(null);

  const handleAdd = () => {
    if (!form.title || !form.date) return;
    const newSchedule = [...schedule, { ...form, id: Date.now() }]
      .sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));
    setSchedule(newSchedule);
    localStorage.setItem('interview_schedule', JSON.stringify(newSchedule));
    setForm({ title: '', date: '', time: '', type: 'practice', notes: '' });
    setToast({ message: 'Schedule added! ✅', type: 'success' });
  };

  const handleDelete = (id) => {
    const updated = schedule.filter(s => s.id !== id);
    setSchedule(updated);
    localStorage.setItem('interview_schedule', JSON.stringify(updated));
  };

  const typeColors = {
    practice: { bg: '#ede9fe', color: '#4f46e5' },
    mock: { bg: '#fef3c7', color: '#d97706' },
    real: { bg: '#fee2e2', color: '#dc2626' },
    revision: { bg: '#d1fae5', color: '#065f46' }
  };

  const upcoming = schedule.filter(s => new Date(s.date) >= new Date());
  const past = schedule.filter(s => new Date(s.date) < new Date());

  return (
    <div>
      <Navbar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="container" style={{padding:'30px 20px'}}>
        <h2 style={{marginBottom:'6px'}}>📅 Interview Schedule</h2>
        <p style={{color:'#666', marginBottom:'24px'}}>Plan your practice sessions</p>

        <div className="schedule-grid">
          {/* Add Form */}
          <div className="card">
            <h3 style={{marginBottom:'16px'}}>Add New Session</h3>
            <div className="form-group">
              <label>Title</label>
              <input type="text" placeholder="e.g. React Interview Practice"
                value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={form.date}
                  onChange={e => setForm({...form, date: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input type="time" value={form.time}
                  onChange={e => setForm({...form, time: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label>Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="practice">Practice Session</option>
                <option value="mock">Mock Interview</option>
                <option value="real">Real Interview</option>
                <option value="revision">Revision</option>
              </select>
            </div>
            <div className="form-group">
              <label>Notes (optional)</label>
              <textarea rows={2} placeholder="Topics to cover..."
                value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                style={{width:'100%', padding:'10px', borderRadius:'8px',
                  border:'1.5px solid #d1d5db', fontSize:'14px', resize:'none', outline:'none'}} />
            </div>
            <button className="btn btn-primary" style={{width:'100%'}} onClick={handleAdd}>
              Add to Schedule
            </button>
          </div>

          {/* Schedule List */}
          <div>
            {upcoming.length > 0 && (
              <>
                <h3 style={{marginBottom:'12px'}}>📌 Upcoming</h3>
                {upcoming.map(s => (
                  <div key={s.id} className="schedule-item card">
                    <div className="schedule-left">
                      <span className="schedule-type"
                        style={{background: typeColors[s.type].bg, color: typeColors[s.type].color}}>
                        {s.type}
                      </span>
                      <h4>{s.title}</h4>
                      <p className="schedule-time">
                        📅 {new Date(s.date).toLocaleDateString('en-IN', {weekday:'short', day:'numeric', month:'short'})}
                        {s.time && ` • ⏰ ${s.time}`}
                      </p>
                      {s.notes && <p className="schedule-notes">📝 {s.notes}</p>}
                    </div>
                    <button onClick={() => handleDelete(s.id)}
                      style={{background:'none', border:'none', cursor:'pointer',
                        color:'#ef4444', fontSize:'18px'}}>🗑️</button>
                  </div>
                ))}
              </>
            )}

            {past.length > 0 && (
              <>
                <h3 style={{marginBottom:'12px', marginTop:'20px', color:'#999'}}>✅ Past</h3>
                {past.map(s => (
                  <div key={s.id} className="schedule-item card past">
                    <div className="schedule-left">
                      <h4 style={{color:'#999'}}>{s.title}</h4>
                      <p className="schedule-time">
                        {new Date(s.date).toLocaleDateString()}
                      </p>
                    </div>
                    <button onClick={() => handleDelete(s.id)}
                      style={{background:'none', border:'none', cursor:'pointer',
                        color:'#ccc', fontSize:'18px'}}>🗑️</button>
                  </div>
                ))}
              </>
            )}

            {schedule.length === 0 && (
              <div className="card" style={{textAlign:'center', padding:'40px', color:'#888'}}>
                No sessions scheduled yet. Add your first one!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}