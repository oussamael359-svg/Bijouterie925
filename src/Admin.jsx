import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [sizes, setSizes] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: prodData } = await supabase.from('products').select('*');
    const { data: ordData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (prodData) setProducts(prodData);
    if (ordData) setOrders(ordData);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!imageFile) return alert('المرجو اختيار صورة للمنتج');
    setLoading(true);

    try {
      // 1. رفع الصورة إلى Cloudinary
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('upload_preset', 'bijouterie925.products');

      const res = await fetch('https://api.cloudinary.com/v1_1/pa0ujkdp/image/upload', {
        method: 'POST',
        body: formData
      });
      const fileData = await res.json();
      const imageUrl = fileData.secure_url;

      // 2. حفظ المنتج في Supabase
      const { error } = await supabase.from('products').insert([
        {
          title,
          price: parseFloat(price),
          category,
          sizes: sizes.split(',').map(s => s.trim()).filter(Boolean),
          images: [imageUrl]
        }
      ]);

      if (error) throw error;

      alert('تمت إضافة المنتج بنجاح!');
      setTitle(''); setPrice(''); setCategory(''); setSizes(''); setImageFile(null);
      fetchData();
    } catch (err) {
      alert('حدث خطأ أثناء الإضافة: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('هل أنت تأكد من حذف هذا المنتج؟')) {
      await supabase.from('products').delete().eq('id', id);
      fetchData();
    }
  };

  return (
    <div style={{ padding: '20px', color: '#fff', backgroundColor: '#111', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#f39c12' }}>لوحة التحكم - Bijouterie 925</h1>
      
      {/* نموذج إضافة منتج */}
      <div style={{ background: '#222', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h2>إضافة منتج جديد</h2>
        <form onSubmit={handleAddProduct} style={{ display: 'grid', gap: '10px', maxWidth: '500px' }}>
          <input type="text" placeholder="اسم المنتج" value={title} onChange={e => setTitle(e.target.value)} required style={{ padding: '8px' }} />
          <input type="number" placeholder="الثمن (DH)" value={price} onChange={e => setPrice(e.target.value)} required style={{ padding: '8px' }} />
          <input type="text" placeholder="الصنف (مثال: خواتم، سلاسل)" value={category} onChange={e => setCategory(e.target.value)} required style={{ padding: '8px' }} />
          <input type="text" placeholder="المقاسات (مفصولة بفاصلة: 52, 54, 56)" value={sizes} onChange={e => setSizes(e.target.value)} style={{ padding: '8px' }} />
          <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} required style={{ color: '#fff' }} />
          <button type="submit" disabled={loading} style={{ padding: '10px', background: '#f39c12', color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
            {loading ? 'جاري الرفع...' : 'إضافة المنتج'}
          </button>
        </form>
      </div>

      {/* قائمة المنتجات */}
      <div style={{ marginBottom: '30px' }}>
        <h2>المنتجات الحالية ({products.length})</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
          {products.map(p => (
            <div key={p.id} style={{ background: '#222', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
              <img src={p.images[0]} alt={p.title} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
              <h3>{p.title}</h3>
              <p>{p.price} DH</p>
              <button onClick={() => handleDeleteProduct(p.id)} style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>حذف</button>
            </div>
          ))}
        </div>
      </div>

      {/* قائمة الطلبات */}
      <div>
        <h2>الطلبات الواردة ({orders.length})</h2>
        <table border="1" style={{ width: '100%', textAlign: 'right', borderColor: '#444', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#333' }}>
              <th style={{ padding: '8px' }}>الاسم</th>
              <th style={{ padding: '8px' }}>الهاتف</th>
              <th style={{ padding: '8px' }}>المدينة</th>
              <th style={{ padding: '8px' }}>المبلغ</th>
              <th style={{ padding: '8px' }}>وصل التحويل (Reçu)</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td style={{ padding: '8px' }}>{o.full_name}</td>
                <td style={{ padding: '8px' }}>{o.phone}</td>
                <td style={{ padding: '8px' }}>{o.city}</td>
                <td style={{ padding: '8px' }}>{o.total_price} DH</td>
                <td style={{ padding: '8px' }}>
                  {o.receipt_url ? <a href={o.receipt_url} target="_blank" rel="noreferrer" style={{ color: '#f39c12' }}>عرض الوصل</a> : 'لا يوجد'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 