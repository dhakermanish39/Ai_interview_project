import { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    dashboard: 'Dashboard',
    practice: 'Practice',
    history: 'History',
    profile: 'Profile',
    bookmarks: 'Bookmarks',
    leaderboard: 'Leaderboard',
    tips: 'Tips',
    logout: 'Logout',
    startPractice: 'Start Practice →',
    totalSessions: 'Total Sessions',
    avgScore: 'Average Score',
    resumeUploaded: 'Resume Uploaded',
    goodSessions: 'Good Sessions (7+)',
    recentSessions: 'Recent Sessions',
    noSessions: 'No sessions yet. Start your first practice!',
    startNow: 'Start Now',
    welcomeBack: 'Welcome back',
    targetRole: 'Target Role',
    notSet: 'Not set',
    yourAnswer: 'Your Answer',
    typeAnswer: 'Type your answer here...',
    nextQuestion: 'Next Question →',
    submitFinish: 'Submit & Finish 🎉',
    evaluating: 'Evaluating...',
    sessionStarted: 'Start Interview Practice',
    startInterview: 'Start Interview →',
    generating: 'Generating Questions...',
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    practice: 'अभ्यास',
    history: 'इतिहास',
    profile: 'प्रोफाइल',
    bookmarks: 'बुकमार्क',
    leaderboard: 'लीडरबोर्ड',
    tips: 'टिप्स',
    logout: 'लॉगआउट',
    startPractice: 'अभ्यास शुरू करें →',
    totalSessions: 'कुल सेशन',
    avgScore: 'औसत स्कोर',
    resumeUploaded: 'रेज़्युमे अपलोड',
    goodSessions: 'अच्छे सेशन (7+)',
    recentSessions: 'हाल के सेशन',
    noSessions: 'अभी तक कोई सेशन नहीं। पहला अभ्यास शुरू करें!',
    startNow: 'अभी शुरू करें',
    welcomeBack: 'वापस स्वागत है',
    targetRole: 'लक्ष्य भूमिका',
    notSet: 'सेट नहीं',
    yourAnswer: 'आपका जवाब',
    typeAnswer: 'यहाँ अपना जवाब लिखें...',
    nextQuestion: 'अगला सवाल →',
    submitFinish: 'जमा करें और समाप्त करें 🎉',
    evaluating: 'मूल्यांकन हो रहा है...',
    sessionStarted: 'इंटरव्यू अभ्यास शुरू करें',
    startInterview: 'इंटरव्यू शुरू करें →',
    generating: 'प्रश्न बन रहे हैं...',
  }
};

const LangContext = createContext();

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en');
  const t = (key) => translations[lang][key] || key;
  const toggleLang = () => {
    const newLang = lang === 'en' ? 'hi' : 'en';
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };
  return (
    <LangContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);