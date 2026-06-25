import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import '../styles/Profile.css';

export default function ProfilePage() {
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: '', target_role: '', college: '', experience_level: 'fresher'
  });
  const [resume, setResume] = useState(null);
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);

  useEffect(() => {
    // Profile fetch
    API.get('/user/profile').then(res => {
      const u = res.data;
      setForm({
        name: u.name || '',
        target_role: u.target_role || '',
        college: u.college || '',
        experience_level: u.experience_level || 'fresher'
      });
    });

    // Resume fetch
    API.get('/resume').then(res => {
      setResume(res.data);
    }).catch(() => setResume(null));
  }, []);

  // Update Profile
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setMsg(''); setError('');
    try {
      const res = await API.put('/user/profile', form);
      // Update localStorage user
      const token = localStorage.getItem('token');
      login(res.data.user, token);
      setMsg('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  // Upload Resume
  const handleResumeUpload = async () => {
    if (!file) return;
    setResumeLoading(true);
    setMsg(''); setError('');
    const formData = new FormData();
    formData.append('resume', file);
    try {
      const res = await API.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResume(res.data.resume);
      setFile(null);
      setMsg('Resume uploaded successfully!');
    } catch (err) {
      setError('Failed to upload resume');
    } finally {
      setResumeLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container profile-page">

        {msg && <div className="success-msg">{msg}</div>}
        {error && <div className="error-msg">{error}</div>}

        <div className="profile-grid">

          {/* Profile Form */}
          <div className="card">
            <h3>👤 Edit Profile</h3>
            <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Target Role</label>
                <input type="text" placeholder="e.g. Full Stack Developer"
                  value={form.target_role}
                  onChange={e => setForm({...form, target_role: e.target.value})} />
              </div>
              <div className="form-group">
                <label>College</label>
                <input type="text" placeholder="Your college"
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
              <button className="btn btn-primary" type="submit" disabled={profileLoading}>
                {profileLoading ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>

          {/* Resume Section */}
          <div className="card">
            <h3>📄 Resume</h3>

            {resume ? (
              <div className="resume-info">
                <div className="resume-uploaded">
                  <span>✅ Resume Uploaded</span>
                </div>

                {/* Skills */}
                {resume.skills?.length > 0 && (
                  <div className="resume-section">
                    <h4>Skills Detected:</h4>
                    <div className="skills-list">
                      {resume.skills.map((s, i) => (
                        <span key={i} className="skill-tag">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {resume.education?.length > 0 && (
                  <div className="resume-section">
                    <h4>Education:</h4>
                    {resume.education.map((e, i) => (
                      <p key={i} className="edu-item">{e.degree}</p>
                    ))}
                  </div>
                )}

                <p style={{fontSize:'13px', color:'#888', marginTop:'12px'}}>
                  Upload new resume to replace existing one
                </p>
              </div>
            ) : (
              <p style={{color:'#888', marginBottom:'16px'}}>
                No resume uploaded yet. Upload your PDF resume to get personalized questions!
              </p>
            )}

            {/* Upload */}
            <div className="upload-area">
              <input type="file" accept=".pdf" id="resume-file"
                style={{display:'none'}}
                onChange={e => setFile(e.target.files[0])} />
              <label htmlFor="resume-file" className="upload-label">
                {file ? `📄 ${file.name}` : '📁 Choose PDF File'}
              </label>
              {file && (
                <button className="btn btn-success" onClick={handleResumeUpload}
                  disabled={resumeLoading} style={{marginTop:'10px', width:'100%'}}>
                  {resumeLoading ? 'Uploading...' : 'Upload Resume'}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}