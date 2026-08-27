import React, { useState } from 'react';

export default function App() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('الكل');

  const contactInfo = {
    whatsapp: "212666122251",
  };

  const products = [
    {
      id: 1,
      name: "خاتم الفضة الملكي الأنيق",
      price: 299,
      image: "https://images.unsplash.com/photo-1603561591411-0cec1342e11a?auto=format&fit=crop&w=600&q=80",
      category: "خواتم"
    },
    {
      id: 2,
      name: "سلسلة الفضة الفاخرة عيار 925",
      price: 349,
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
      category: "سلاسل"
    },
    {
      id: 3,
      name: "أقراط الفضة العصرية",
      price: 220,
      image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80",
      category: "أقراط"
    },
    {
      id: 4,
      name: "سوارة الفضة بتصميم راقي",
      price: 390,
      image: "https://images.unsplash.com/photo-1611591475271-1d530868ac2a?auto=format&fit=crop&w=600&q=80",
      category: "أساور"
    }
  ];

  const filteredProducts = selectedCategory === 'الكل' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const addToCart = (product) => {
    setCart([...cart, product]);
    setIsCartOpen(true);
  };

  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  const checkoutWhatsApp = () => {
    if (cart.length === 0) return;
    let message = "سلام، بغيت نطلب هاد المنتجات من متجركم Bijouterie 925:\n\n";
    cart.forEach((item, idx) => {
      message += `${idx + 1}. ${item.name} - ${item.price} درهم\n`;
    });
    message += `\nالمجموع الكلي: ${totalPrice} درهم`;
    window.open(`https://wa.me/${contactInfo.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans" dir="rtl">
      
      {/* Navbar */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <span className="text-2xl font-bold text-slate-900">
            Bijouterie <span className="text-amber-600">925</span>
          </span>

          <button 
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="relative p-2 bg-gray-100 hover:bg-gray-200 rounded-full font-bold px-4 flex items-center gap-2"
          >
            🛒 السلة ({cart.length})
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-4 py-1.5 rounded-full text-sm font-semibold inline-block mb-6">
            فضة أصلية معتمدة عيار 925 ✨
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
            تألقوا بأرقى تصاميم <span className="text-amber-400">الفضة الراقية</span>
          </h1>
          <p className="text-gray-300 text-lg mb-8">
            تشكيلة فريدة ومميزة من المجوهرات الفضية للرجال والنساء.
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">تشكيلة المجوهرات</h2>
        </div>

        {/* Categories */}
        <div className="flex justify-center gap-3 mb-12 flex-wrap">
          {['الكل', 'خواتم', 'سلاسل', 'أساور', 'أقراط'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2.5 rounded-full font-medium transition ${
                selectedCategory === cat 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-white text-gray-600 border hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border flex flex-col">
              <img src={product.image} alt={product.name} className="w-full h-64 object-cover" />
              <div className="p-5 flex flex-col flex-grow justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                  <div className="text-amber-600 font-extrabold text-xl mb-4">{product.price} درهم</div>
                </div>
                <button 
                  onClick={() => addToCart(product)}
                  className="w-full bg-slate-900 hover:bg-amber-600 text-white font-medium py-2.5 rounded-xl transition"
                >
                  إضافة إلى السلة
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-6">
            <div className="flex justify-between items-center pb-4 border-b">
              <h2 className="text-xl font-bold">سلة المشتريات</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-xl font-bold">✕</button>
            </div>

            <div className="flex-grow overflow-y-auto py-4 space-y-4">
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 py-10">السلة فارغة حالياً</p>
              ) : (
                cart.map((item, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                    <div>
                      <h4 className="font-semibold text-sm">{item.name}</h4>
                      <span className="text-amber-600 text-sm font-bold">{item.price} درهم</span>
                    </div>
                    <button onClick={() => removeFromCart(index)} className="text-red-500 text-sm">حذف</button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4 text-lg font-bold">
                  <span>المجموع:</span>
                  <span className="text-amber-600">{totalPrice} درهم</span>
                </div>
                <button 
                  onClick={checkoutWhatsApp}
                  className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl shadow-lg"
                >
                  إتمام الطلب عبر واتساب
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 text-center mt-20">
        <p className="text-gray-400 mb-2">Bijouterie 925 - وجهتك الأولى لاقتناء أرقى مجوهرات الفضة.</p>
        <p className="text-gray-500 text-sm">© 2026 جميع الحقوق محفوظة</p>
      </footer>

    </div>
  );
} 