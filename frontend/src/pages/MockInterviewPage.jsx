import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import API from '../services/api';
import '../styles/MockInterview.css';

export default function MockInterviewPage() {
  const [step, setStep] = useState('setup'); // setup | interview | finished
  const [role, setRole] = useState('Full Stack Developer');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const startInterview = async () => {
    setStep('interview');
    setLoading(true);
    setTyping(true);
    try {
      const res = await API.post('/mock/chat', { messages: [], role });
      setMessages([{ role: 'assistant', content: res.data.message, type: res.data.type }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setTyping(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);
    setTyping(true);

    try {
      const res = await API.post('/mock/chat', {
        messages: updatedMessages.map(m => ({
          role: m.role,
          content: m.content
        })),
        role
      });

      const aiMessage = {
        role: 'assistant',
        content: res.data.message,
        type: res.data.type
      };

      setMessages([...updatedMessages, aiMessage]);

      if (res.data.type === 'conclusion') {
        setFinalScore(res.data.score);
        setStep('finished');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetInterview = () => {
    setStep('setup');
    setMessages([]);
    setInput('');
    setFinalScore(null);
  };

  return (
    <div>
      <Navbar />
      <div className="container mock-page">

        {/* SETUP */}
        {step === 'setup' && (
          <div className="mock-setup card">
            <div className="mock-setup-icon">🤝</div>
            <h2>AI Mock Interview</h2>
            <p>Practice with an AI interviewer in a real conversation style.
              The AI will ask questions, give feedback, and evaluate your performance.</p>

            <div className="form-group" style={{marginTop:'24px'}}>
              <label>Target Role</label>
              <input type="text"
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="e.g. Full Stack Developer, React Developer" />
            </div>

            <div className="mock-features">
              <div className="mock-feature">
                <span>🎯</span>
                <p>Role-specific questions</p>
              </div>
              <div className="mock-feature">
                <span>💬</span>
                <p>Real conversation flow</p>
              </div>
              <div className="mock-feature">
                <span>📊</span>
                <p>Final score & feedback</p>
              </div>
            </div>

            <button className="btn btn-primary"
              style={{width:'100%', marginTop:'8px'}}
              onClick={startInterview}>
              Start Mock Interview →
            </button>
          </div>
        )}

        {/* INTERVIEW */}
        {(step === 'interview' || step === 'finished') && (
          <div className="mock-interview-box">

            {/* Header */}
            <div className="mock-header card">
              <div className="interviewer-info">
                <div className="interviewer-avatar">🤖</div>
                <div>
                  <h3>AI Interviewer</h3>
                  <p>{role} Interview</p>
                </div>
              </div>
              {step === 'finished' && finalScore && (
                <div className="final-score-chip">
                  Final Score: {finalScore}/10
                </div>
              )}
            </div>

            {/* Chat Messages */}
            <div className="chat-box">
              {messages.map((msg, i) => (
                <div key={i} className={`chat-msg ${msg.role}`}>
                  {msg.role === 'assistant' && (
                    <div className="msg-avatar">🤖</div>
                  )}
                  <div className={`msg-bubble ${msg.role} ${msg.type === 'conclusion' ? 'conclusion' : ''}`}>
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="msg-avatar user-avatar">👤</div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {typing && (
                <div className="chat-msg assistant">
                  <div className="msg-avatar">🤖</div>
                  <div className="msg-bubble assistant typing-bubble">
                    <span className="dot" /><span className="dot" /><span className="dot" />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            {step === 'interview' && (
              <div className="chat-input-box card">
                <textarea
                  rows={3}
                  placeholder="Type your answer... (Press Enter to send, Shift+Enter for new line)"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                />
                <div className="chat-input-footer">
                  <span className="input-hint">Enter to send • Shift+Enter for new line</span>
                  <button className="btn btn-primary"
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}>
                    {loading ? 'Thinking...' : 'Send →'}
                  </button>
                </div>
              </div>
            )}

            {/* Finished */}
            {step === 'finished' && (
              <div className="card" style={{textAlign:'center', padding:'24px'}}>
                <h3>🎉 Interview Complete!</h3>
                {finalScore && (
                  <p style={{fontSize:'32px', fontWeight:'800', color:'#4f46e5', margin:'12px 0'}}>
                    {finalScore}/10
                  </p>
                )}
                <div style={{display:'flex', gap:'12px', justifyContent:'center', marginTop:'16px'}}>
                  <button className="btn btn-primary" onClick={resetInterview}>
                    Try Again
                  </button>
                  <button className="btn btn-secondary"
                    onClick={() => window.location.href = '/dashboard'}>
                    Dashboard
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