import React, { useState, useEffect } from 'react';
import { Copy, CheckCircle, Send, Upload, X, ShieldCheck, Truck } from 'lucide-react';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR71iWm7C7ARztL8OctD-YGBihEwkjEAzZdDxGVwVPs71CG5c8DR-1IvHzn7vUCZha4oO6ym_1d4CfW/pub?output=csv';

export default function App() {
  const bankDetails = {
    bankName: 'CIH Bank',
    accountHolder: 'Bijouterie 925',
    rib: '230 780 0000000000000000 45'
  };

  const whatsappNumber = '212600000000';

  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [formData, setFormData] = useState({ fullName: '', phone: '', city: '', address: '' });
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(CSV_URL)
      .then(res => res.text())
      .then(csvText => {
        const lines = csvText.split('\n').filter(line => line.trim() !== '');
        const data = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/);
          if (cols.length >= 2) {
            const name = cols[0]?.replace(/^\"|\"$/g, '').trim() || '';
            const price = cols[1]?.replace(/^\"|\"$/g, '').trim() || '';
            const image = cols[2]?.replace(/^\"|\"$/g, '').trim() || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500';
            const rawSizes = cols[3]?.replace(/^\"|\"$/g, '').trim() || '';
            const sizes = rawSizes ? rawSizes.split(',').map(s => s.trim()) : [];
            const category = cols[4]?.replace(/^\"|\"$/g, '').trim() || 'عام';
            
            data.push({ _id: String(i), name, price, image, sizes, category });
          }
        }
        setProducts(data);
        if (data.length > 0) {
          setSelectedProduct(data[0]);
          setSelectedSize(data[0].sizes[0] || '');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading data:', err);
        setLoading(false);
      });
  }, []);

  const categories = ['الكل', ...new Set(products.map(p => p.category))];

  const filteredProducts = selectedCategory === 'الكل' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setSelectedSize(product.sizes ? product.sizes[0] : '');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const copyRib = () => {
    navigator.clipboard.writeText(bankDetails.rib);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const message = `*طلب جديد - Bijouterie 925* 💍\n--------------------------------\n*المنتج:* ${selectedProduct.name}\n*الصنف:* ${selectedProduct.category}\n*المقاس المحدد:* ${selectedSize}\n*الثمن:* ${selectedProduct.price}\n\n*معلومات الزبون:*\n• *الاسم:* ${formData.fullName}\n• *الهاتف:* ${formData.phone}\n• *المدينة:* ${formData.city}\n• *العنوان:* ${formData.address}\n--------------------------------\n*طريقة الدفع:* تحويل بنكي (RIB)\n${receiptFile ? '_ملاحظة: تم إرفاق صورة وصل التحويل._' : '_سأقوم بإرسال الوصل فالمحادثة._'}`;

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center font-sans">
        <p className="text-amber-400 font-bold animate-pulse text-lg">جاري تحميل التصميم والمنتجات...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 dir-rtl font-sans pb-12">
      <header className="bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 py-4 px-6 border-b border-slate-800 text-center">
        <h1 className="text-3xl font-extrabold tracking-wider bg-gradient-to-r from-slate-200 via-amber-200 to-slate-400 bg-clip-text text-transparent">
          BIJOUTERIE 925
        </h1>
        <p className="text-xs text-slate-400 mt-1">عالم الفضة الفاخرة والأناقة</p>
      </header>

      <div className="bg-slate-800/50 py-2 border-b border-slate-800 text-xs text-slate-300 flex justify-center gap-6">
        <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-amber-400"/> فضة 925 مئة بالمئة</span>
        <span className="flex items-center gap-1"><Truck size={14} className="text-amber-400"/> توصيل لجميع المدن</span>
      </div>

      <main className="max-w-4xl mx-auto px-4 mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-xs font-bold tracking-wide text-amber-400 uppercase mb-3">اختر الصنف:</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border transition duration-200 ${selectedCategory === cat ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md shadow-amber-400/10' : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {filteredProducts.map((p) => (
              <div 
                key={p._id}
                onClick={() => handleProductSelect(p)}
                className={`cursor-pointer rounded-xl p-2 bg-slate-800 border transition duration-200 text-center ${selectedProduct?._id === p._id ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-700 opacity-70 hover:opacity-100'}`}
              >
                <img src={p.image} alt={p.name} className="h-20 w-full object-cover rounded-lg mb-2" />
                <p className="text-xs font-medium text-slate-200 truncate">{p.name}</p>
                <p className="text-xs text-amber-400 font-bold mt-1">{p.price}</p>
              </div>
            ))}
          </div>

          {selectedProduct && (
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 shadow-xl">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-60 object-cover rounded-xl mb-4 border border-slate-700" />
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-slate-100">{selectedProduct.name}</h3>
                <span className="text-xs bg-slate-900 text-amber-400 px-2.5 py-1 rounded-full border border-amber-400/20 font-semibold">{selectedProduct.category}</span>
              </div>
              <p className="text-amber-400 text-xl font-bold mb-4">{selectedProduct.price}</p>

              {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold mb-2 text-slate-300">المقاس المتوفر:</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition ${selectedSize === size ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 shadow-xl self-start">
          <h2 className="text-lg font-bold text-slate-100 mb-4">إتمام الطلب (الدفع عبر الـ RIB)</h2>
          <div className="bg-slate-900/90 border border-amber-500/30 p-4 rounded-xl mb-6">
            <p className="text-xs font-bold text-amber-400 mb-1">معلومات الحساب البنكي للتحويل:</p>
            <p className="text-xs text-slate-300">البنك: <span className="text-white font-semibold">{bankDetails.bankName}</span></p>
            <p className="text-xs text-slate-300 mb-2">صاحب الحساب: <span className="text-white font-semibold">{bankDetails.accountHolder}</span></p>
            <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-700">
              <span className="font-mono text-xs font-bold text-slate-200 tracking-wider">{bankDetails.rib}</span>
              <button onClick={copyRib} className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs px-2.5 py-1 rounded font-bold flex items-center gap-1 transition">
                {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
                {copied ? 'تم النسخ' : 'نسخ'}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">الاسم الكامل *</label>
              <input type="text" required value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 outline-none focus:border-amber-400 transition" placeholder="مثال: يوسف العلمي" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">رقم الهاتف *</label>
                <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 outline-none focus:border-amber-400 dir-ltr text-right" placeholder="0600000000" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">المدينة *</label>
                <input type="text" required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 outline-none focus:border-amber-400" placeholder="أكادير" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">العنوان الكامل *</label>
              <input type="text" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-100 outline-none focus:border-amber-400" placeholder="الحي، الشارع، رقم المنزل" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">إرفاق صورة وصل التحويل (اختياري)</label>
              {!receiptPreview ? (
                <label className="flex items-center justify-center border border-dashed border-slate-600 p-3 rounded-lg cursor-pointer bg-slate-900 hover:bg-slate-900/80 text-xs text-slate-400 gap-2 transition">
                  <Upload size={16} />
                  اختر صورة الوصل من تليفونك
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              ) : (
                <div className="relative h-20 bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
                  <img src={receiptPreview} alt="Reçu" className="w-full h-full object-contain" />
                  <button type="button" onClick={() => { setReceiptFile(null); setReceiptPreview(null); }} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><X size={12} /></button>
                </div>
              )}
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm mt-4 shadow-lg transition duration-200">
              <Send size={16} />
              إرسال الطلب عبر الواتساب
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}