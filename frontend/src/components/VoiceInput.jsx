import { useState, useRef } from 'react';
import '../styles/VoiceInput.css';

export default function VoiceInput({ onResult }) {
  const [listening, setListening] = useState(false);
  const [supported] = useState(() => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  const recognitionRef = useRef(null);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map(r => r[0].transcript)
        .join('');
      onResult(transcript);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  if (!supported) return null;

  return (
    <button
      className={`voice-btn ${listening ? 'active' : ''}`}
      onClick={listening ? stopListening : startListening}
      title={listening ? 'Stop recording' : 'Speak your answer'}>
      {listening ? (
        <>
          <span className="voice-pulse" />
          🎤 Stop
        </>
      ) : (
        '🎤 Speak'
      )}
    </button>
  );
}