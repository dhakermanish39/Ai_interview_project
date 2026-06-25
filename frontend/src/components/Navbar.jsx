import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import '../styles/Navbar.css';
import { useLang } from '../context/LangContext';


export default function Navbar() {
  const { logout } = useAuth();
  const { dark, toggleDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, toggleLang } = useLang();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/interview', label: 'Practice' },
    { to: '/history', label: 'History' },
    { to: '/bookmarks', label: 'Bookmarks' },
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/study-tips', label: 'Tips' },
    { to: '/schedule', label: 'Schedule' },
    { to: '/mock-interview', label: 'Mock Interview' },
    { to: '/profile', label: 'Profile' },
    
  ];

  return (
    <nav className="navbar">
      <div className="container nav-inner">
        <Link to="/dashboard" className="logo">🎯 AI Interview Prep</Link>

        <div className="nav-links">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}>
              {link.label}
            </Link>
          ))}
          

          <button onClick={toggleDark} className="theme-btn">
            {dark ? '☀️' : '🌙'}
          </button>
<button onClick={toggleLang} className="theme-btn" title="Toggle Language">
  {lang === 'en' ? '🇮🇳 HI' : '🇺🇸 EN'}
</button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}