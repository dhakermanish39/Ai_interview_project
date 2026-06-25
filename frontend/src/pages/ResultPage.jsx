import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import '../styles/Result.css';

export default function ResultPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const resultRef = useRef();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});
  const [savedNotes, setSavedNotes] = useState({});

  useEffect(() => {
    API.get(`/interview/result/${sessionId}`)
      .then(res => {
        setResult(res.data);
        // Load saved notes
        const loaded = {};
        res.data.answers.forEach((_, i) => {
          loaded[i] = localStorage.getItem(`note_${sessionId}_${i}`) || '';
        });
        setNotes(loaded);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleSaveNote = (index) => {
    localStorage.setItem(`note_${sessionId}_${index}`, notes[index] || '');
    setSavedNotes({ ...savedNotes, [index]: true });
    setTimeout(() => setSavedNotes({ ...savedNotes, [index]: false }), 2000);
  };

  const handleDownloadPDF = async () => {
    const element = resultRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save(`interview-result-${sessionId}.pdf`);
  };

  if (loading) return (
    <div>
      <Navbar />
      <div className="container" style={{padding:'40px'}}>Loading...</div>
    </div>
  );

  if (!result) return (
    <div>
      <Navbar />
      <div className="container" style={{padding:'40px'}}>Result not found</div>
    </div>
  );

  const score = parseFloat(result.average_score);

  return (
    <div>
      <Navbar />
      <div className="container result-page">
        <div ref={resultRef}>

          {/* Score Banner */}
          <div className={`card score-banner ${score >= 7 ? 'good' : score >= 5 ? 'avg' : 'low'}`}>
            <div>
              <h2>Interview Complete! 🎉</h2>
              <p>{result.total_questions} questions attempted</p>
            </div>
            <div className="big-score">
              <span>{result.average_score}</span>
              <small>/10</small>
            </div>
          </div>

          {/* Detailed Feedback */}
          <h3 style={{margin:'24px 0 16px'}}>Detailed Feedback</h3>

          {result.answers.map((a, i) => (
            <div key={i} className="card answer-card">
              <div className="answer-header">
                <span className="q-label">Q{i + 1}: {a.question_type}</span>
                <span className={`score-badge ${a.score >= 7 ? 'good' : a.score >= 5 ? 'avg' : 'low'}`}>
                  {a.score}/10
                </span>
              </div>

              <p className="question-text">{a.question}</p>

              {/* MCQ Result */}
              {a.is_mcq ? (
                <div className="mcq-result">
                  <div className={`mcq-answer-row ${a.is_correct ? 'correct' : 'wrong'}`}>
                    <span className="mcq-label">Your Answer:</span>
                    <span className="mcq-value">
                      {a.is_correct ? '✅' : '❌'} {a.your_option}
                    </span>
                  </div>
                  {!a.is_correct && (
                    <div className="mcq-answer-row correct">
                      <span className="mcq-label">Correct Answer:</span>
                      <span className="mcq-value">✅ {a.correct_option_text}</span>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Text Answer */}
                  <div className="your-answer">
                    <strong>Your Answer:</strong>
                    <p>{a.your_answer}</p>
                  </div>

                  {/* Feedback Grid */}
                  <div className="feedback-grid">
                    <div className="feedback-box strong">
                      <h4>✅ Strong Points</h4>
                      <ul>
                        {a.strong_points.map((p, j) => (
                          <li key={j}>{p}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="feedback-box missing">
                      <h4>⚠️ Missing Points</h4>
                      <ul>
                        {a.missing_points.map((p, j) => (
                          <li key={j}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Better Answer */}
                  {a.better_answer && (
                    <div className="better-answer">
                      <h4>💡 Better Answer:</h4>
                      <p>{a.better_answer}</p>
                    </div>
                  )}
                </>
              )}

              {/* Notes */}
              <div className="note-box">
                <h4>📝 My Notes:</h4>
                <textarea
                  rows={3}
                  placeholder="Write your notes for this question..."
                  value={notes[i] || ''}
                  onChange={e => setNotes({ ...notes, [i]: e.target.value })}
                  style={{
                    width: '100%', padding: '10px', borderRadius: '8px',
                    border: '1.5px solid #d1d5db', fontSize: '13px',
                    resize: 'vertical', outline: 'none'
                  }}
                />
                <button
                  className="btn btn-secondary"
                  style={{marginTop:'8px', padding:'6px 14px', fontSize:'13px'}}
                  onClick={() => handleSaveNote(i)}>
                  {savedNotes[i] ? '✅ Saved!' : 'Save Note'}
                </button>
              </div>

            </div>
          ))}

        </div>

        {/* Action Buttons */}
        <div style={{display:'flex', gap:'12px', marginTop:'24px', marginBottom:'40px'}}>
          <button className="btn btn-primary" onClick={() => navigate('/interview')}>
            Practice Again
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </button>
          <button className="btn btn-success" onClick={handleDownloadPDF}>
            📤 Download PDF
          </button>
        </div>

      </div>
    </div>
  );
}