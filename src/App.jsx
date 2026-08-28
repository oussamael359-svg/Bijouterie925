import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

// رابط Google Sheets المباشر
const SHEET_ID = '1KyfGld5_i55aXg8-DhYRWYskuTnhhcvfJFatc9q4HUo';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/pub?output=csv`;

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
    Papa.parse(CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const cleanData = results.data
          .filter(row => {
            const name = row.name || row.Name || row['اسم المنتج'] || '';
            // حماية حارمة: كيتأكد بلي الاسم ماشي كود JS
            return name && !name.includes('function') && !name.includes('{') && !name.includes('var ');
          })
          .map((row, idx) => {
            const name = row.name || row.Name || '';
            const price = row.price || row.Price || '';
            const image = row.image || row.Image || '';
            const rawSizes = row.sizes || row.Sizes || '';
            const category = row.category || row.Category || 'عام';
            const sizes = rawSizes ? String(rawSizes).split(',').map(s => s.trim()) : [];

            return {
              _id: String(idx + 1),
              name,
              price,
              image,
              sizes,
              category
            };
          });

        setProducts(cleanData);
        if (cleanData.length > 0) {
          setSelectedProduct(cleanData[0]);
          setSelectedSize(cleanData[0].sizes[0] || '');
        }
      },
      error: (err) => {
        console.error("Error fetching CSV:", err);
      }
    });
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

          {filteredProducts.length === 0 ? (
            <div className="text-center py-10 bg-gray-900 rounded-xl border border-gray-800 text-gray-400 text-sm">
              جاري تحميل المنتجات أو لا توجد منتجات حالياً...
            </div>
          ) : (
            <>
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
                      <div className="w-full h-20 bg-gray-800 rounded-lg mb-2 flex items-center justify-center text-[10px] text-gray-500">لا توجد صورة</div>
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
            </>
          )}
        </div>

      </main>
    </div>
  );
}