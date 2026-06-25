import { useNavigate } from 'react-router-dom';
import '../styles/Landing.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">

      {/* Navbar */}
      <nav className="landing-nav">
        <div className="container nav-inner">
          <span className="logo">🎯 AI Interview Prep</span>
          <div>
            <button className="btn btn-secondary" style={{marginRight:'10px'}}
              onClick={() => navigate('/login')}>Login</button>
            <button className="btn btn-primary"
              onClick={() => navigate('/register')}>Get Started Free</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-text">
            <span className="hero-badge">🚀 AI Powered Interview Preparation</span>
            <h1>Crack Your Dream Job Interview with AI</h1>
            <p>
              Upload your resume, practice role-based questions, get instant AI feedback
              and track your progress — all in one place.
            </p>
            <div className="hero-btns">
              <button className="btn btn-primary btn-lg"
                onClick={() => navigate('/register')}>
                Start Practicing Free →
              </button>
              <button className="btn btn-secondary btn-lg"
                onClick={() => navigate('/login')}>
                Login
              </button>
            </div>
          </div>
          <div className="hero-card">
            <div className="mock-card">
              <div className="mock-header">
                <span>🤖 AI Evaluator</span>
                <span className="score-chip">Score: 8/10</span>
              </div>
              <p className="mock-q">Q: Explain the difference between REST and GraphQL?</p>
              <div className="mock-feedback">
                <div className="fb good">✅ Strong understanding of REST principles</div>
                <div className="fb good">✅ Mentioned real use cases</div>
                <div className="fb missing">⚠️ Could explain GraphQL queries in more detail</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="container">
          <h2>Everything You Need to Prepare</h2>
          <p className="section-sub">One platform for complete interview preparation</p>
          <div className="features-grid">
            {[
              { icon: '📄', title: 'Resume Based Questions', desc: 'Upload your resume and get personalized interview questions based on your skills and projects.' },
              { icon: '🤖', title: 'AI Answer Evaluation', desc: 'Get instant feedback on your answers with score, strong points, missing points and better sample answer.' },
              { icon: '🎯', title: 'Role Wise Practice', desc: 'Practice questions for specific roles — Frontend, Backend, Full Stack, Data Science and more.' },
              { icon: '📊', title: 'Progress Dashboard', desc: 'Track your performance over time, see weak topics and get recommendations for improvement.' },
              { icon: '💼', title: 'HR Round Practice', desc: 'Practice common HR questions like strengths, weaknesses, situation based questions.' },
              { icon: '🏆', title: 'Mock Interviews', desc: 'Full mock interview sessions with timer, scoring and detailed report at the end.' },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <span className="feature-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <p className="section-sub">Get started in 3 simple steps</p>
          <div className="steps-grid">
            {[
              { step: '01', title: 'Create Account & Upload Resume', desc: 'Sign up for free and upload your PDF resume. Our AI will extract your skills and projects automatically.' },
              { step: '02', title: 'Start Interview Practice', desc: 'Choose your target role, difficulty level and session type. AI generates relevant interview questions instantly.' },
              { step: '03', title: 'Get Feedback & Improve', desc: 'Submit your answers and get instant AI feedback with score, strong points, missing points and better answers.' },
            ].map((s, i) => (
              <div key={i} className="step-card">
                <span className="step-number">{s.step}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container cta-inner">
          <h2>Ready to Crack Your Interview?</h2>
          <p>Join thousands of students who are preparing smarter with AI</p>
          <button className="btn btn-primary btn-lg"
            onClick={() => navigate('/register')}>
            Get Started Free — No Credit Card Required
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>🎯 AI Interview Prep — Built with React, Node.js & AI</p>
        </div>
      </footer>

    </div>
  );
}