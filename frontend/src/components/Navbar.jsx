
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LangContext';
import '../styles/Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggleDark } = useTheme();
  const { lang, toggleLang } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/interview', label: 'Practice', icon: '🎯' },
    { to: '/mock-interview', label: 'Mock Interview', icon: '🤝' },
    { to: '/history', label: 'History', icon: '📋' },
    { to: '/bookmarks', label: 'Bookmarks', icon: '🔖' },
    { to: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { to: '/study-tips', label: 'AI Tips', icon: '💡' },
    { to: '/schedule', label: 'Schedule', icon: '📅' },
    { to: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <>
      <nav className="navbar">
        <div className="nav-inner">
          <Link to="/dashboard" className="logo" onClick={() => setMenuOpen(false)}>
            🎯 <span>AI Interview Prep</span>
          </Link>

          {/* Desktop Links */}
          <div className="nav-links desktop-links">
            {links.map(link => (
              <Link key={link.to} to={link.to}
                className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="nav-actions">
            <button onClick={toggleLang} className="icon-btn" title="Toggle Language">
              {lang === 'en' ? '🇮🇳' : '🇺🇸'}
            </button>
            <button onClick={toggleDark} className="icon-btn" title="Toggle Theme">
              {dark ? '☀️' : '🌙'}
            </button>
            <button className="logout-btn desktop-only" onClick={handleLogout}>
              Logout
            </button>
            {/* Hamburger */}
            <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu">
              <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
              <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
              <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />
      )}

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${menuOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <span className="logo">🎯 AI Interview Prep</span>
          <button className="close-btn" onClick={() => setMenuOpen(false)}>✕</button>
        </div>

        <div className="drawer-user">
          <div className="drawer-avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
          <div>
            <p className="drawer-name">{user?.name}</p>
            <p className="drawer-role">{user?.target_role || 'No role set'}</p>
          </div>
        </div>

        <div className="drawer-links">
          {links.map(link => (
            <Link key={link.to} to={link.to}
              className={`drawer-link ${location.pathname === link.to ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}>
              <span className="drawer-icon">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="drawer-footer">
          <button onClick={toggleDark} className="drawer-action-btn">
            {dark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <button onClick={toggleLang} className="drawer-action-btn">
            {lang === 'en' ? '🇮🇳 Hindi' : '🇺🇸 English'}
          </button>
          <button onClick={handleLogout} className="drawer-logout-btn">
            🚪 Logout
          </button>
        </div>
      </div>
    </>
  );
}