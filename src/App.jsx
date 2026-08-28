import React, { useState, useEffect } from 'react';

// حط الرابط الجديد اللي خديتي من Publish to web هنا
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS85x-I1IFAW3C30y5iA3-1k6Kx0/pub?output=csv';

export default function App() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [activeCategory, setActiveCategory] = useState('الكل');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    fetch(CSV_URL)
      .then(res => res.text())
      .then(csvText => {
        // حماية: إذا رجع كود JS أو HTML من جوجل كيتجاهلو
        if (csvText.includes('<!DOCTYPE') || csvText.includes('function(') || csvText.includes('var ')) {
          console.error("Google Sheets returned invalid CSV format");
          return;
        }

        const lines = csvText.split('\n').filter(line => line.trim() !== '');
        const data = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          const name = cols[0]?.replace(/^\"|\"$/g, '').trim() || '';
          const price = cols[1]?.replace(/^\"|\"$/g, '').trim() || '';
          const image = cols[2]?.replace(/^\"|\"$/g, '').trim() || '';
          const rawSizes = cols[3]?.replace(/^\"|\"$/g, '').trim() || '';
          const sizes = rawSizes ? rawSizes.split(',').map(s => s.trim()) : [];
          const category = cols[4]?.replace(/^\"|\"$/g, '').trim() || 'عام';

          // تصفية حارمة: خاص يكون اسم منطقي وما فيش كود
          if (name && !name.includes('function') && !name.includes('{')) {
            data.push({ _id: String(i), name, price, image, sizes, category });
          }
        }
        setProducts(data);
        if (data.length > 0) {
          setSelectedProduct(data[0]);
          setSelectedSize(data[0].sizes[0] || '');
        }
      })
      .catch(err => console.error(err));
  }, []);

  const categories = ['الكل', ...new Set(products.map(p => p.category))];
  const filteredProducts = activeCategory === 'الكل' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const handleOrder = (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    const message = `السلام عليكم، بغيت نطلب:\n- المنتج: ${selectedProduct.name}\n- الثمن: ${selectedProduct.price}\n- المقاس: ${selectedSize || 'غير محدد'}\n\nبيانات الزبون:\n- الاسم: ${fullName}\n- الهاتف: ${phone}\n- المدينة: ${city}\n- العنوان: ${address}`;
    const whatsappUrl = `https://wa.me/212600000000?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#111827] text-white p-4 font-sans dir-rtl">
      <header className="text-center py-6 border-b border-gray-800">
        <h1 className="text-3xl font-bold tracking-wider text-yellow-500">BIJOUTERIE 925</h1>
        <p className="text-gray-400 text-sm mt-1">عالم الفضة الفاخرة والأناقة</p>
      </header>

      <main className="max-w-5xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Form Section */}
        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
          <h2 className="text-lg font-bold mb-4 text-center">إتمام الطلب (الدفع عبر الـ RIB)</h2>
          
          <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 mb-6 text-sm">
            <p className="text-yellow-500 font-bold mb-1">معلومات الحساب البنكي للتحويل:</p>
            <p>البنك: <span className="font-bold">CIH Bank</span></p>
            <p>صاحب الحساب: <span className="font-bold">Bijouterie 925</span></p>
            <div className="flex justify-between items-center bg-gray-800 p-2 rounded mt-2">
              <span className="font-mono text-xs">45 0000000000000000 780 230</span>
              <button type="button" onClick={() => navigator.clipboard.writeText('45 0000000000000000 780 230')} className="bg-yellow-500 text-black text-xs px-2 py-1 rounded font-bold">نسخ</button>
            </div>
          </div>

          <form onSubmit={handleOrder} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">الاسم الكامل *</label>
              <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="مثال: يوسف العلمي" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-yellow-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">رقم الهاتف *</label>
              <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0600000000" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-yellow-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">المدينة *</label>
              <input required type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="أكادير" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-yellow-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">العنوان الكامل *</label>
              <input required type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="الحي، الشارع، رقم المنزل" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-yellow-500" />
            </div>

            <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition mt-4">
              إرسال الطلب عبر WhatsApp
            </button>
          </form>
        </div>

        {/* Products Section */}
        <div>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            <span className="text-xs text-yellow-500 flex items-center font-bold ml-2">اختر الصنف:</span>
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  activeCategory === cat ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {filteredProducts.map(product => (
              <div
                key={product._id}
                onClick={() => {
                  setSelectedProduct(product);
                  setSelectedSize(product.sizes[0] || '');
                }}
                className={`border p-2 rounded-xl cursor-pointer transition ${
                  selectedProduct?._id === product._id ? 'border-yellow-500 bg-gray-800' : 'border-gray-800 bg-gray-900'
                }`}
              >
                {product.image && product.image.startsWith('http') ? (
                  <img src={product.image} alt={product.name} className="w-full h-20 object-cover rounded-lg mb-2" />
                ) : (
                  <div className="w-full h-20 bg-gray-800 rounded-lg mb-2 flex items-center justify-center text-xs text-gray-500">لا توجد صورة</div>
                )}
                <h3 className="font-bold text-xs truncate">{product.name}</h3>
                <p className="text-yellow-500 text-xs font-bold mt-1">{product.price}</p>
              </div>
            ))}
          </div>

          {selectedProduct && (
            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
              {selectedProduct.image && selectedProduct.image.startsWith('http') && (
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-48 object-cover rounded-lg mb-3" />
              )}
              <h3 className="font-bold">{selectedProduct.name}</h3>
              <p className="text-yellow-500 font-bold mt-1">{selectedProduct.price}</p>
              
              {selectedProduct.sizes.length > 0 && (
                <div className="mt-3">
                  <span className="text-xs text-gray-400 block mb-1">المقاسات المتاحة:</span>
                  <div className="flex gap-2">
                    {selectedProduct.sizes.map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`px-2 py-1 rounded text-xs ${
                          selectedSize === size ? 'bg-yellow-500 text-black font-bold' : 'bg-gray-800 text-gray-400'
                        }`}
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

      </main>
    </div>
  );
}