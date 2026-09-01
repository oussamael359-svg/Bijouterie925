import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Admin from './Admin';

export default function App() {
  const [view, setView] = useState('store');
  const [products, setProducts] = useState([]);
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if admin is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    fetchData();
    return () => subscription.unsubscribe();
  }, []);

  async function fetchData() {
    const { data } = await supabase.from('products').select('*');
    if (data) setProducts(data);
  }

  // Handle actual secure login via Supabase backend
  async function handleAdminLogin(e) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error5) {
      alert('خطأ في تسجيل الدخول: ' + error.message);
    } else {
      setView('admin');
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
    setView('store');
  }

  if (view === 'admin' && session) {
    return <Admin onBackToStore={() => setView('store')} onLogout={handleLogout} />;
  }

  return (
    <div style={{ background: '#121212', color: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: '1px solid #2a2a2a', background: '#181818' }}>
        <h1 style={{ fontSize: '24px', letterSpacing: '1px', color: '#e5c158', margin: 0 }}>✨ Bijouterie 925</h1>
        <button 
          onClick={() => setView('admin')} 
          style={{ background: 'transparent', color: '#e5c158', border: '1px solid #e5c158', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ⚙️ لوحة التحكم
        </button>
      </header>

      {/* If trying to access admin without session, show secure login form */}
      {view === 'admin' && !session ? (
        <div style={{ maxWidth: '400px', margin: '80px auto', background: '#1e1e1e', padding: '30px', borderRadius: '8px', border: '1px solid #2a2a2a' }}>
          <h2 style={{ color: '#e5c158', marginTop: 0 }}>تسجيل دخول المشرف</h2>
          <form onSubmit={handleAdminLogin}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>البريد الإلكتروني:</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #333', background: '#121212', color: '#fff', boxSizing: 'border-box' }}
                required
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>كلمة المرور:</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #333', background: '#121212', color: '#fff', boxSizing: 'border-box' }}
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', padding: '12px', backgroundColor: '#e5c158', color: '#121212', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {loading ? 'جاري التحقق...' : 'دخول'}
            </button>
          </form>
          <button 
            onClick={() => setView('store')} 
            style={{ background: 'transparent', color: '#aaa', border: 'none', marginTop: '15px', cursor: 'pointer', width: '100%' }}
          >
            العودة للمتجر
          </button>
        </div>
      ) : (
        <main style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '28px', marginBottom: '10px' }}>مرحباً بكم في مجوهرات 925</h2>
            <p style={{ color: '#aaa', fontSize: '16px' }}>تشكيلة راقية من الفضة الخالصة والمجوهرات الفاخرة</p>
          </div>

          <h3 style={{ borderBottom: '2px solid #e5c158', paddingBottom: '10px', display: 'inline-block', marginBottom: '20px' }}>المنتجات المتاحة</h3>
          
          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: '#181818', borderRadius: '8px', border: '1px solid #2a2a2a' }}>
              <p style={{ color: '#888', fontSize: '18px' }}>لا توجد منتجات حالياً. أضف منتجات عبر لوحة التحكم.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '25px' }}>
              {products.map(p => (
                <div key={p.id} style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                  <img src={p.image_url || 'https://via.placeholder.com/250'} alt={p.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                  <div style={{ padding: '15px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{p.name}</h4>
                    <p style={{ color: '#e5c158', fontWeight: 'bold', fontSize: '16px', margin: 0 }}>{p.price} DH</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* Footer */}
      <footer style={{ marginTop: '80px', borderTop: '1px solid #2a2a2a', padding: '20px', textAlign: 'center', color: '#777', fontSize: '14px', background: '#181818' }}>
        <p>Bijouterie 925 © 2026 - جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
}