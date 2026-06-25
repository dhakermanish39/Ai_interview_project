import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import Toast from '../components/Toast';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    target_role: '', college: '', experience_level: 'fresher'
  });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/register', form);
      login(res.data.user, res.data.token);
      setToast({ message: 'Account created successfully! 🎉', type: 'success' });
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Registration failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="auth-box">
        <h2>Create Account 🚀</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" placeholder="Your name"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="Your email"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Create password"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              required />
          </div>
          <div className="form-group">
            <label>Target Role</label>
            <input type="text" placeholder="e.g. Full Stack Developer"
              value={form.target_role}
              onChange={e => setForm({...form, target_role: e.target.value})} />
          </div>
          <div className="form-group">
            <label>College</label>
            <input type="text" placeholder="Your college name"
              value={form.college}
              onChange={e => setForm({...form, college: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Experience Level</label>
            <select value={form.experience_level}
              onChange={e => setForm({...form, experience_level: e.target.value})}>
              <option value="fresher">Fresher</option>
              <option value="1-2 years">1-2 Years</option>
              <option value="2+ years">2+ Years</option>
            </select>
          </div>
          <button className="btn btn-primary" style={{width:'100%'}}
            type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        <div className="link">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}