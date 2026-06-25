import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import API from '../services/api';
import Toast from '../components/Toast';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    API.get('/bookmarks')
      .then(res => setBookmarks(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    await API.delete(`/bookmarks/${id}`);
    setBookmarks(bookmarks.filter(b => b._id !== id));
    setToast({ message: 'Bookmark removed', type: 'success' });
  };

  return (
    <div>
      <Navbar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="container" style={{padding:'30px 20px'}}>
        <h2 style={{marginBottom:'20px'}}>🔖 Saved Questions</h2>
        {loading ? <p>Loading...</p> : bookmarks.length === 0 ? (
          <div className="card" style={{textAlign:'center', padding:'40px', color:'#888'}}>
            No bookmarks yet. Bookmark questions during practice!
          </div>
        ) : bookmarks.map(b => (
          <div key={b._id} className="card" style={{marginBottom:'16px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
              <div style={{flex:1}}>
                <span className="badge" style={{marginBottom:'10px', display:'inline-block'}}>
                  {b.question_type}
                </span>
                <p style={{fontWeight:'600', color:'#1f2937', lineHeight:'1.5'}}>
                  {b.question_text}
                </p>
                <p style={{fontSize:'12px', color:'#999', marginTop:'8px'}}>
                  {new Date(b.created_at).toLocaleDateString()}
                </p>
              </div>
              <button onClick={() => handleDelete(b._id)}
                style={{background:'none', border:'none', cursor:'pointer',
                  color:'#ef4444', fontSize:'18px', marginLeft:'12px'}}>
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}