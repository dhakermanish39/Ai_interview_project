import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../services/api';
import '../styles/Interview.css';
import Timer from '../components/Timer';
import Toast from '../components/Toast';
import VoiceInput from '../components/VoiceInput';
export default function InterviewPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('setup'); // setup | interview | submitting
  const [config, setConfig] = useState({
    session_type: 'resume',
    role: '',
    difficulty: 'medium',
    count: 5,
    include_mcq: false
  });
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);


  // Start Session
  const handleStart = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/interview/start', config);
      setSession(res.data.session_id);
      setQuestions(res.data.questions);
      setStep('interview');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  // Submit Answer
  const handleSubmitAnswer = async () => {
    if (answer === '') return;
    setLoading(true);
    setError(''); // ← pehle error clear karo
    try {
      const res = await API.post('/interview/answer', {
        question_id: questions[currentIndex].id,
        session_id: session,
        answer_text: answer
      });

      setEvaluations([...evaluations, {
        question: questions[currentIndex].question_text,
        answer,
        ...res.data.evaluation
      }]);
      setAnswer('');
      setError(''); // ← success pe clear

      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        await API.get(`/interview/result/${session}`);
        navigate(`/result/${session}`);
      }
    } catch (err) {
      setError('Failed to submit answer. Please try again.');
      // ← answer remove mat karo, user retry kar sake
    } finally {
      setLoading(false);
    }
  };
  const handleBookmark = async () => {
    try {
      await API.post('/bookmarks', {
        question_text: questions[currentIndex].question_text,
        question_type: questions[currentIndex].question_type,
        session_id: session
      });
      setToast({ message: 'Question bookmarked! 🔖', type: 'success' });
    } catch (err) {
      setToast({ message: 'Already bookmarked', type: 'error' });
    }
  };

  return (
    <div>
      <Navbar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="container interview-page">

        {/* SETUP SCREEN */}
        {step === 'setup' && (
          <div className="card setup-box">
            <h2>🎯 Start Interview Practice</h2>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              Configure your practice session below
            </p>

            {error && <div className="error-msg">{error}</div>}
            {/* Setup box ke andar, form ke upar */}
            <div className="quick-practice-banner">
              <div>
                <h4>⚡ Quick Practice</h4>
                <p>3 questions • 2 min each • instant result</p>
              </div>
              <button className="btn btn-success"
                onClick={() => {
                  setConfig({ session_type: 'role', role: 'Software Developer', difficulty: 'medium', count: 3 });
                  setTimeout(() => handleStart(), 100);
                }}>
                Start Now →
              </button>
            </div>

            <div className="divider">or customize below</div>
            <div className="form-group">
              <label>Session Type</label>
              <select value={config.session_type}
                onChange={e => setConfig({ ...config, session_type: e.target.value })}>
                <option value="resume">Resume Based</option>
                <option value="role">Role Based</option>
                <option value="hr">HR Round</option>
                <option value="mock">Mock Interview</option>
              </select>
            </div>

            <div className="form-group">
              <label>Target Role</label>
              <input type="text" placeholder="e.g. Full Stack Developer, React Developer"
                value={config.role}
                onChange={e => setConfig({ ...config, role: e.target.value })} />
            </div>

            <div className="form-group">
              <label>Difficulty</label>
              <select value={config.difficulty}
                onChange={e => setConfig({ ...config, difficulty: e.target.value })}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="form-group">
              <label>Number of Questions</label>
              <select value={config.count}
                onChange={e => setConfig({ ...config, count: parseInt(e.target.value) })}>
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
              </select>
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox"
                  checked={config.include_mcq}
                  onChange={e => setConfig({ ...config, include_mcq: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                Include MCQ Questions (Multiple Choice)
              </label>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }}
              onClick={handleStart} disabled={loading}>
              {loading ? 'Generating Questions...' : 'Start Interview →'}
            </button>
          </div>
        )}

        {/* INTERVIEW SCREEN */}
        {step === 'interview' && questions.length > 0 && (
          <div className="interview-box">

            {/* Progress */}
            <div className="progress-bar-wrap">
              <div className="progress-info">
                <span>Question {currentIndex + 1} of {questions.length}</span>
                <span>{Math.round(((currentIndex) / questions.length) * 100)}% Complete</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill"
                  style={{ width: `${(currentIndex / questions.length) * 100}%` }} />
              </div>
            </div>

            {/* Question Card */}
            <div className="card question-card">
              <div className="q-meta">
                <span className="badge">{questions[currentIndex].question_type}</span>
                <Timer
                  key={currentIndex} // ← har question pe reset hoga
                  seconds={90}
                  onTimeUp={() => {
                    setError('Time up! Answer auto-submitted.');
                    handleSubmitAnswer();
                  }}
                />
                <button onClick={handleBookmark}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>
                  🔖
                </button>
                <span className="q-number">Q{currentIndex + 1}</span>
              </div>
              <h3>{questions[currentIndex].question_text}</h3>
            </div>

            {/* MCQ ya Text answer */}
            {questions[currentIndex].type === 'mcq' && questions[currentIndex].options?.length > 0 ? (
              <div className="card">
                <label style={{ fontWeight: '600', display: 'block', marginBottom: '12px' }}>
                  Choose the correct answer:
                </label>
                <div className="mcq-options">
                  {questions[currentIndex].options.map((opt, i) => (
                    <button key={i}
                      className={`mcq-option ${answer === String(i) ? 'selected' : ''}`}
                      onClick={() => setAnswer(String(i))}>
                      <span className="mcq-label">{['A', 'B', 'C', 'D'][i]}</span>
                      {opt}
                    </button>
                  ))}
                </div>
                {error && <div className="error-msg" style={{ marginTop: '10px' }}>{error}</div>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button className="btn btn-primary" onClick={handleSubmitAnswer}
                    disabled={loading || answer === ''}>
                    {loading ? 'Checking...' :
                      currentIndex + 1 === questions.length ? 'Submit & Finish 🎉' : 'Next →'}
                  </button>
                </div>
              </div>
            ) : (
              // existing textarea answer box
              <div className="card">

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontWeight: '600' }}>Your Answer:</label>
                  <VoiceInput onResult={(text) => setAnswer(prev => prev + ' ' + text)} />
                </div>
                <textarea rows={6} placeholder="Type your answer here..."
                  value={answer} onChange={e => setAnswer(e.target.value)}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '8px',
                    border: '1.5px solid #d1d5db', fontSize: '14px', outline: 'none', resize: 'vertical'
                  }} />
                {error && (
                  <div className="error-msg" style={{ marginTop: '10px' }}>
                    {error}
                    <button style={{
                      marginLeft: '10px', background: 'none', border: 'none',
                      color: '#dc2626', cursor: 'pointer', fontWeight: '600', fontSize: '13px'
                    }}
                      onClick={() => setError('')}>Dismiss ✕</button>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button className="btn btn-primary" onClick={handleSubmitAnswer}
                    disabled={loading || answer === ''}>
                    {loading ? 'Evaluating...' :
                      currentIndex + 1 === questions.length ? 'Submit & Finish 🎉' : 'Next Question →'}
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}