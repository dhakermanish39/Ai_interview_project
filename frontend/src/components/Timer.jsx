import { useState, useEffect } from 'react';
import '../styles/Timer.css';

export default function Timer({ seconds = 120, onTimeUp }) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, onTimeUp]);

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');
  const percent = (timeLeft / seconds) * 100;

  return (
    <div className={`timer ${timeLeft <= 30 ? 'danger' : timeLeft <= 60 ? 'warning' : ''}`}>
      <svg viewBox="0 0 36 36" className="timer-circle">
        <path className="timer-bg"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
        <path className="timer-fill"
          strokeDasharray={`${percent}, 100`}
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
      </svg>
      <span className="timer-text">{mins}:{secs}</span>
    </div>
  );
}