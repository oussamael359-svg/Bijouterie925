import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import Admin from './Admin';

export default function App() {
  const [viewAdmin, setViewAdmin] = useState(false);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [cart, setCart] = useState([]);

  // نموذج الطلب
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*');
    if (data) setProducts(data);
  };

  const addToCart = (product) => {
    setCart(prev => [...prev, product]);
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return alert('السلة فارغة!');
    setSubmitting(true);

    let receiptUrl = null;

    // رفع صورة الوصل إن وجدت
    if (receiptFile) {
      const fileExt = receiptFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage.from('receipts').upload(fileName, receiptFile);
      if (!error) receiptUrl = data.path;
    }

    const orderNumber = `925-${Math.floor(100000 + Math.random() * 900000)}`;

    const { error } = await supabase.from('orders').insert([{
      order_number: orderNumber,
      full_name: fullName,
      phone,
      city,
      address,
      items: cart,
      total_price: totalPrice,
      receipt_url: receiptUrl
    }]);

    setSubmitting(false);

    if (error) {
      alert('حدث خطأ أثناء إرسال الطلب: ' + error.message);
    } else {
      // توجيه لـ WhatsApp
      const text = `السلام عليكم، تم طلب جديد:\nرقم الطلب: ${orderNumber}\nالاسم: ${fullName}\nالمجموع: ${totalPrice} DH`;
      window.open(`https://wa.me/212600000000?text=${encodeURIComponent(text)}`, '_blank');
      setCart([]);
      setFullName(''); setPhone(''); setCity(''); setAddress(''); setReceiptFile(null);
      alert('✅ تم حفظ طلبك بنجاح! تم توجيهك للواتساب للتأكيد.');
    }
  };

  if (viewAdmin) {
    return <Admin onBackToStore={() => setViewAdmin(false)} />;
  }

  const filteredProducts = activeCategory === 'الكل' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div style={{ background: '#111', color: '#fff', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* الهيدر */}
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#f39c12', margin: '0 0 10px 0' }}>BIJOUTERIE 925</h1>
        <p style={{ color: '#aaa', margin: 0 }}>عالم الفضة الفاخرة والأناقة</p>
      </header>

      {/* التصنيفات */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
        {['الكل', 'خواتم', 'سلاسل', 'أساور'].map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{
            background: activeCategory === cat ? '#f39c12' : '#222',
            color: activeCategory === cat ? '#000' : '#fff',
            border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold'
          }}>{cat}</button>
        ))}
      </div>

      {/* عرض المنتجات والسلة */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        
        {/* شبكة المنتجات */}
        <div>
          <h3>المنتجات المتوفرة</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            {filteredProducts.map(p => (
              <div key={p.id} style={{ background: '#1e1e1e', padding: '15px', borderRadius: '10px', border: '1px solid #333' }}>
                <img src={p.image_url || 'https://via.placeholder.com/150'} alt={p.name} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '5px' }} />
                <h4 style={{ margin: '10px 0 5px 0' }}>{p.name}</h4>
                <p style={{ color: '#f39c12', fontWeight: 'bold', margin: '0 0 10px 0' }}>{p.price} DH</p>
                <button onClick={() => addToCart(p)} style={{ width: '100%', background: '#f39c12', border: 'none', padding: '8px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
                  🛒 أضف السلة
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* إتمام الطلب والسلة */}
        <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '10px', border: '1px solid #333', height: 'fit-content' }}>
          <h3>🛒 سلة الشراء ({cart.length})</h3>
          {cart.map((item, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', padding: '5px 0' }}>
              <span>{item.name}</span>
              <span style={{ color: '#f39c12' }}>{item.price} DH</span>
            </div>
          ))}
          <h4 style={{ textAlign: 'right', color: '#f39c12' }}>المجموع: {totalPrice} DH</h4>

          <hr style={{ borderColor: '#333', margin: '15px 0' }} />

          <h4>معلومات الدفع والتوصيل</h4>
          <p style={{ fontSize: '12px', color: '#aaa' }}>RIB: CIH BANK - 230 780 000000000000000000</p>
          
          <form onSubmit={handleOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="text" placeholder="الاسم الكامل" value={fullName} onChange={e => setFullName(e.target.value)} required style={inputStyle} />
            <input type="tel" placeholder="رقم الهاتف" value={phone} onChange={e => setPhone(e.target.value)} required style={inputStyle} />
            <input type="text" placeholder="المدينة" value={city} onChange={e => setCity(e.target.value)} required style={inputStyle} />
            <textarea placeholder="العنوان الكامل" value={address} onChange={e => setAddress(e.target.value)} required style={{ ...inputStyle, height: '50px' }} />
            
            <label style={{ fontSize: '12px', color: '#ccc' }}>رفع وصل التحويل (Reçu):</label>
            <input type="file" accept="image/*" onChange={e => setReceiptFile(e.target.files[0])} style={{ color: '#aaa', fontSize: '12px' }} />

            <button type="submit" disabled={submitting} style={{ background: '#27ae60', color: '#fff', border: 'none', padding: '10px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
              {submitting ? 'جاري الإرسال...' : 'تأكيد الطلب وإرسال عبر WhatsApp'}
            </button>
          </form>
        </div>

      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', marginTop: '50px', borderTop: '1px solid #333', paddingTop: '20px' }}>
        <button onClick={() => setViewAdmin(true)} style={{ background: '#222', color: '#aaa', border: '1px solid #444', padding: '6px 14px', borderRadius: '5px', cursor: 'pointer' }}>
          ⚙️ لوحة التحكم (Admin)
        </button>
      </footer>

    </div>
  );
}

const inputStyle = { width: '100%', padding: '8px', background: '#111', border: '1px solid #444', color: '#fff', borderRadius: '5px', boxSizing: 'border-box' };