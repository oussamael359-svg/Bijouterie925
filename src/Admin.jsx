import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';

export default function Admin({ onBackToStore }) {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // حالة المنتجات والطلبات
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');

  // نموذج إضافة منتج جديد
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('خواتم');
  const [sizes, setSizes] = useState('');
  const [stock, setStock] = useState(1);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchData();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchData();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    const { data: pData } = await supabase.from('products').select('*').order('id', { ascending: false });
    const { data: oData } = await supabase.from('orders').select('*').order('id', { ascending: false });
    if (pData) setProducts(pData);
    if (oData) setOrders(oData);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert('خطأ في تسجيل الدخول: ' + error.message);
    setLoading(false);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const sizesArr = sizes ? sizes.split(',').map(s => s.trim()) : [];
    const { error } = await supabase.from('products').insert([{
      name, price: parseFloat(price), category, sizes: sizesArr, stock: parseInt(stock), image_url: imageUrl, description
    }]);

    if (error) alert('حدث خطأ: ' + error.message);
    else {
      alert('✅ تم إضافة المنتج بنجاح');
      setName(''); setPrice(''); setSizes(''); setImageUrl(''); setDescription('');
      fetchData();
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (!error) fetchData();
  };

  if (!session) {
    return (
      <div style={{ background: '#111', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <form onSubmit={handleLogin} style={{ background: '#1e1e1e', padding: '30px', borderRadius: '10px', width: '320px', border: '1px solid #333' }}>
          <h2 style={{ color: '#f39c12', textAlign: 'center' }}>دخول Admin</h2>
          <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="كلمة السر" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} />
          <button type="submit" disabled={loading} style={btnStyle}>{loading ? 'جاري الدخول...' : 'تسجيل الدخول'}</button>
          <button type="button" onClick={onBackToStore} style={{ ...btnStyle, background: '#333', marginTop: '10px' }}>الرجوع للمتجر</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ background: '#111', color: '#fff', minHeight: '100vh', padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
        <h2>👑 لوحة التحكم - Bijouterie 925</h2>
        <div>
          <button onClick={onBackToStore} style={{ ...btnStyle, width: 'auto', marginRight: '10px' }}>الواجهة الرئيسية</button>
          <button onClick={() => supabase.auth.signOut()} style={{ ...btnStyle, width: 'auto', background: '#e74c3c' }}>خروج</button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
        <button onClick={() => setActiveTab('orders')} style={activeTab === 'orders' ? tabActive : tabStyle}>🛒 الطلبات ({orders.length})</button>
        <button onClick={() => setActiveTab('products')} style={activeTab === 'products' ? tabActive : tabStyle}>📦 المنتجات ({products.length})</button>
        <button onClick={() => setActiveTab('add')} style={activeTab === 'add' ? tabActive : tabStyle}>➕ إضافة منتج</button>
      </div>

      {activeTab === 'orders' && (
        <div>
          <h3>قائمة الطلبات</h3>
          {orders.map(o => (
            <div key={o.id} style={{ background: '#1e1e1e', padding: '15px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #333' }}>
              <p><strong>طلب رقم:</strong> {o.order_number} | <strong>الحالة:</strong> <span style={{ color: '#f39c12' }}>{o.status}</span></p>
              <p><strong>الزبون:</strong> {o.full_name} ({o.phone}) - {o.city}, {o.address}</p>
              <p><strong>المجموع:</strong> {o.total_price} DH</p>
              <div style={{ marginTop: '10px' }}>
                <select value={o.status} onChange={(e) => handleStatusChange(o.id, e.target.value)} style={{ padding: '5px', background: '#222', color: '#fff', border: '1px solid #444' }}>
                  <option value="New">جديد (New)</option>
                  <option value="Confirmed">مؤكد (Confirmed)</option>
                  <option value="Shipped">تم الشحن (Shipped)</option>
                  <option value="Delivered">تم التسليم (Delivered)</option>
                  <option value="Cancelled">ملغى (Cancelled)</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'add' && (
        <form onSubmit={handleAddProduct} style={{ maxWidth: '500px', background: '#1e1e1e', padding: '20px', borderRadius: '10px' }}>
          <h3>إضافة منتج جديد</h3>
          <input type="text" placeholder="اسم المنتج" value={name} onChange={e => setName(e.target.value)} required style={inputStyle} />
          <input type="number" placeholder="الثمن (DH)" value={price} onChange={e => setPrice(e.target.value)} required style={inputStyle} />
          <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
            <option value="خواتم">خواتم</option>
            <option value="سلاسل">سلاسل</option>
            <option value="أساور">أساور</option>
          </select>
          <input type="text" placeholder="المقاسات (مفصولة بـ فاصلة: 16,17,18)" value={sizes} onChange={e => setSizes(e.target.value)} style={inputStyle} />
          <input type="number" placeholder="الكمية المتوفرة (Stock)" value={stock} onChange={e => setStock(e.target.value)} required style={inputStyle} />
          <input type="url" placeholder="رابط صورة المنتج (URL)" value={imageUrl} onChange={e => setImageUrl(e.target.value)} style={inputStyle} />
          <textarea placeholder="الوصف" value={description} onChange={e => setDescription(e.target.value)} style={{ ...inputStyle, height: '80px' }} />
          <button type="submit" style={btnStyle}>حفظ المنتج</button>
        </form>
      )}

      {activeTab === 'products' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          {products.map(p => (
            <div key={p.id} style={{ background: '#1e1e1e', padding: '10px', borderRadius: '8px', border: '1px solid #333' }}>
              <img src={p.image_url || 'https://via.placeholder.com/150'} alt={p.name} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '5px' }} />
              <h4>{p.name}</h4>
              <p style={{ color: '#f39c12' }}>{p.price} DH</p>
              <p style={{ fontSize: '12px', color: '#aaa' }}>المخزون: {p.stock}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px', background: '#111', border: '1px solid #444', color: '#fff', borderRadius: '5px', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '10px', background: '#f39c12', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '5px' };
const tabStyle = { padding: '8px 16px', background: '#222', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '5px' };
const tabActive = { ...tabStyle, background: '#f39c12', color: '#000', fontWeight: 'bold' };