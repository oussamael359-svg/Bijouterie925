import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function Admin({ onBackToStore }) {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*');
    if (data) setProducts(data);
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    if (!name || !price) return alert('المرجو إدخال اسم المنتج والثمن');

    setLoading(true);
    const { error } = await supabase.from('products').insert([
      { name, price: parseFloat(price), image_url: imageUrl }
    ]);

    setLoading(false);
    if (error) {
      alert('خطأ أثناء إضافة المنتج: ' + error.message);
    } else {
      setName('');
      setPrice('');
      setImageUrl('');
      fetchProducts();
      alert('تم إضافة المنتج بنجاح!');
    }
  }

  async function handleDelete(id) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    await supabase.from('products').delete().eq('id', id);
    fetchProducts();
  }

  return (
    <div style={{ padding: '20px', color: '#fff', backgroundColor: '#111', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <button 
        onClick={onBackToStore}
        style={{ padding: '10px 20px', backgroundColor: '#f39c12', color: '#000', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        ⬅ العودة للمتجر
      </button>

      <h1 style={{ marginTop: '20px' }}>⚙️ لوحة التحكم - إضافة المنتجات</h1>

      <form onSubmit={handleAddProduct} style={{ background: '#1a1a1a', padding: '20px', borderRadius: '8px', maxWidth: '500px', marginTop: '20px', border: '1px solid #333' }}>
        <h3>إضافة منتج جديد</h3>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>اسم المنتج:</label>
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
            placeholder="مثال: خاتم فضة"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>الثمن (DH):</label>
          <input 
            type="number" 
            value={price} 
            onChange={e => setPrice(e.target.value)} 
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
            placeholder="مثال: 250"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>رابط الصورة (Image URL):</label>
          <input 
            type="text" 
            value={imageUrl} 
            onChange={e => setImageUrl(e.target.value)} 
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '10px', backgroundColor: '#27ae60', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {loading ? 'جاري الإضافة...' : 'إضافة المنتج'}
        </button>
      </form>

      <div style={{ marginTop: '40px' }}>
        <h3>المنتجات الحالية في قاعدة البيانات ({products.length})</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
          {products.map(p => (
            <div key={p.id} style={{ background: '#222', padding: '10px', borderRadius: '6px', border: '1px solid #444' }}>
              <img src={p.image_url || 'https://via.placeholder.com/150'} alt={p.name} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '4px' }} />
              <h4>{p.name}</h4>
              <p style={{ color: '#f39c12' }}>{p.price} DH</p>
              <button 
                onClick={() => handleDelete(p.id)}
                style={{ width: '100%', padding: '5px', backgroundColor: '#c0392b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}
              >
                حذف
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}