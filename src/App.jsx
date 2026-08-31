import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Admin from './Admin';

export default function App() {
  const [view, setView] = useState('store');
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState({ whatsapp_number: '', bank_rib: '', bank_name: '' });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: prodData } = await supabase.from('products').select('*');
    if (prodData) setProducts(prodData);

    const { data: setData } = await supabase.from('settings').select('*').single();
    if (setData) setSettings(setData);
  }

  if (view === 'admin') {
    return (
      <div>
        <button 
          onClick={() => setView('store')} 
          style={{ margin: '10px', padding: '10px 20px', background: '#333', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          ⬅ العودة للمتجر
        </button>
        <Admin />
      </div>
    );
  }

  return (
    <div style={{ background: '#0a0a0a', color: '#fff', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222', paddingBottom: '15px' }}>
        <h2>Bijouterie 925</h2>
        <button 
          onClick={() => setView('admin')} 
          style={{ background: '#f39c12', color: '#000', border: 'none', padding: '8px 15px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          ⚙️ لوحة التحكم
        </button>
      </header>

      <main style={{ marginTop: '30px' }}>
        <h3>المنتجات المتاحة</h3>
        {products.length === 0 ? (
          <p style={{ color: '#888' }}>لا توجد منتجات حالياً. أضف منتجات من لوحة التحكم.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {products.map(p => (
              <div key={p.id} style={{ background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '15px' }}>
                <img src={p.image_url || 'https://via.placeholder.com/150'} alt={p.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '5px' }} />
                <h4>{p.name}</h4>
                <p style={{ color: '#f39c12', fontWeight: 'bold' }}>{p.price} DH</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer style={{ marginTop: '50px', borderTop: '1px solid #222', paddingTop: '20px', textAlign: 'center', color: '#666', fontSize: '12px' }}>
        <p>Bijouterie 925 © 2026</p>
      </footer>
    </div>
  );
}