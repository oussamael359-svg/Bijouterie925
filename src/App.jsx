import React, { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';
import Admin from './Admin';
const SHEET_ID = '1KyfGld5_i55aXg8-DhYRWYskuTnhhcvfJFatc9q4HUo';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/pub?output=csv`;

// ===============================
// إعدادات المتجر
// ===============================

const WHATSAPP_NUMBER = '212600000000';

const PAYMENT_INFO = {
  bank: 'CIH Bank',
  accountName: 'Bijouterie 925',
  rib: '45 0000000000000000 780 230',
};

// ثمن التوصيل حسب المدينة.
// يمكنك تغيير الأثمنة من هنا بسهولة.
const SHIPPING_PRICES = {
  agadir: 20,
  أكادير: 20,
  inezgane: 20,
  إنزكان: 20,
  inzegan: 20,
  ait melloul: 25 : 
  ait melloul: 25,
  أيت ملول: 25,
  marrakech: 30,
  مراكش: 30,
  casablanca: 35,
  الدار البيضاء: 35,
  rabat: 35,
  الرباط: 35,
};

const DEFAULT_SHIPPING_PRICE = 35;

// ===============================
// أدوات مساعدة
// ===============================

const normalizeText = (value = '') =>
  String(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const parseNumber = (value) => {
  if (typeof value === 'number') return value;

  const cleaned = String(value || '')
    .replace(/[^\d.,]/g, '')
    .replace(',', '.');

  const number = Number(cleaned);

  return Number.isFinite(number) ? number : 0;
};

const formatPrice = (value) => {
  const number = parseNumber(value);

  return `${number.toLocaleString('fr-MA')} DH`;
};

const generateOrderId = () => {
  const random = Math.floor(1000 + Math.random() * 9000);
  const time = Date.now().toString().slice(-4);

  return `925-${time}${random}`;
};

const getShippingPrice = (city) => {
  const normalized = normalizeText(city);

  return SHIPPING_PRICES[normalized] ?? DEFAULT_SHIPPING_PRICE;
};

const getStockFromRow = (row) => {
  const stock =
    row.stock ??
    row.Stock ??
    row.quantity ??
    row.Quantity ??
    row['المخزون'] ??
    row['الكمية'];

  if (stock === undefined || stock === '') return null;

  const parsed = Number(stock);

  return Number.isFinite(parsed) ? parsed : null;
};

const getImagesFromRow = (row) => {
  const imagesRaw =
    row.images ||
    row.Images ||
    row['صور'] ||
    row['صور المنتج'] ||
    '';

  const mainImage =
    row.image ||
    row.Image ||
    row['صورة'] ||
    row['صورة المنتج'] ||
    '';

  const images = String(imagesRaw)
    .split(/[,|]/)
    .map((image) => image.trim())
    .filter(Boolean);

  if (mainImage && !images.includes(mainImage)) {
    images.unshift(mainImage);
  }

  return images;
};

// ===============================
// التطبيق
// ===============================

  export default function App() {
   const [showAdmin, setShowAdmin] = useState(false);

  if (showAdmin) return <Admin />;
    if (window.location.pathname === '/admin') return <Admin />;
  const [products, setProducts] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');

  const [activeCategory, setActiveCategory] = useState('الكل');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');

  const [recuImage, setRecuImage] = useState(null);

  const [selectedImage, setSelectedImage] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [orderId, setOrderId] = useState('');
  const [orderSent, setOrderSent] = useState(false);

  // ===============================
  // جلب المنتجات من Google Sheets
  // ===============================

  useEffect(() => {
    setLoading(true);
    setError('');

    Papa.parse(CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,

      complete: (results) => {
        try {
          const cleanData = results.data
            .filter((row) => {
              const name =
                row.name ||
                row.Name ||
                row['اسم المنتج'] ||
                '';

              const image =
                row.image ||
                row.Image ||
                row['صورة'] ||
                row['صورة المنتج'] ||
                '';

              return (
                name &&
                image &&
                !String(name).includes('function') &&
                !String(name).includes('{')
              );
            })
            .map((row, idx) => {
              const name =
                row.name ||
                row.Name ||
                row['اسم المنتج'] ||
                '';

              const price =
                row.price ||
                row.Price ||
                row['الثمن'] ||
                row['السعر'] ||
                '';

              const category =
                row.category ||
                row.Category ||
                row['الصنف'] ||
                row['الفئة'] ||
                'عام';

              const rawSizes =
                row.sizes ||
                row.Sizes ||
                row['المقاسات'] ||
                row['المقاس'] ||
                '';

              const sizes = String(rawSizes)
                .split(',')
                .map((size) => size.trim())
                .filter(Boolean);

              const images = getImagesFromRow(row);

              const stock = getStockFromRow(row);

              const description =
                row.description ||
                row.Description ||
                row['الوصف'] ||
                '';

              /*
                إذا كان عندك stock في Google Sheet:
                stock = 5

                إذا ما كانش موجود:
                stock = null
                وبالتالي الموقع ما غاديش يفرض نظام المخزون.
              */

              return {
                _id: String(idx + 1),
                name: String(name),
                price: String(price),
                category: String(category),
                sizes,
                images,
                description: String(description),
                stock,
              };
            });

          setProducts(cleanData);

          if (cleanData.length > 0) {
            setSelectedProduct(cleanData[0]);
            setSelectedSize(cleanData[0].sizes[0] || '');
            setSelectedImage(cleanData[0].images[0] || '');
          }

          setLoading(false);
        } catch (err) {
          console.error(err);
          setError('وقع مشكل أثناء معالجة المنتجات.');
          setLoading(false);
        }
      },

      error: (err) => {
        console.error(err);
        setError('تعذر تحميل المنتجات. تأكد من Google Sheet والاتصال بالإنترنت.');
        setLoading(false);
      },
    });
  }, []);

  // ===============================
  // Categories
  // ===============================

  const categories = useMemo(() => {
    return [
      'الكل',
      ...new Set(products.map((product) => product.category)),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'الكل') {
      return products;
    }

    return products.filter(
      (product) => product.category === activeCategory
    );
  }, [products, activeCategory]);

  // ===============================
  // Product selection
  // ===============================

  const selectProduct = (product) => {
    setSelectedProduct(product);

    const firstSize = product.sizes[0] || '';
    setSelectedSize(firstSize);

    setSelectedImage(product.images[0] || '');
  };

  // ===============================
  // Price calculations
  // ===============================

  const productPrice = selectedProduct
    ? parseNumber(selectedProduct.price)
    : 0;

  const shippingPrice = city
    ? getShippingPrice(city)
    : DEFAULT_SHIPPING_PRICE;

  const totalPrice = productPrice + shippingPrice;

  // ===============================
  // Phone validation
  // ===============================

  const isValidMoroccanPhone = (value) => {
    const cleaned = value.replace(/\s/g, '');

    return /^(06|07)\d{8}$/.test(cleaned);
  };

  // ===============================
  // Copy RIB
  // ===============================

  const copyRIB = async () => {
    try {
      await navigator.clipboard.writeText(PAYMENT_INFO.rib);
      alert('تم نسخ RIB بنجاح.');
    } catch (error) {
      alert('تعذر النسخ تلقائياً. انسخ RIB يدوياً.');
    }
  };

  // ===============================
  // إرسال الطلب
  // ===============================

  const handleOrder = async (e) => {
    e.preventDefault();

    if (!selectedProduct) {
      alert('اختار منتج أولاً.');
      return;
    }

    if (!fullName.trim()) {
      alert('دخل الاسم الكامل.');
      return;
    }

    if (!isValidMoroccanPhone(phone)) {
      alert('دخل رقم هاتف مغربي صحيح مثل 0600000000 أو 0700000000.');
      return;
    }

    if (!city.trim()) {
      alert('دخل المدينة.');
      return;
    }

    if (!address.trim()) {
      alert('دخل العنوان الكامل.');
      return;
    }

    // إذا كان المخزون محدداً
    if (
      selectedProduct.stock !== null &&
      selectedProduct.stock <= 0
    ) {
      alert('هذا المنتج غير متوفر حالياً.');
      return;
    }

    const newOrderId = generateOrderId();

    setOrderId(newOrderId);

    const message = `
السلام عليكم 👋

🛍️ طلب جديد من BIJOUTERIE 925

رقم الطلب: ${newOrderId}

━━━━━━━━━━━━━━

المنتج:
${selectedProduct.name}

${selectedSize ? `المقاس: ${selectedSize}` : ''}

ثمن المنتج:
${formatPrice(productPrice)}

التوصيل:
${formatPrice(shippingPrice)}

💰 المجموع:
${formatPrice(totalPrice)}

━━━━━━━━━━━━━━

👤 بيانات الزبون

الاسم:
${fullName}

الهاتف:
${phone}

المدينة:
${city}

العنوان:
${address}

━━━━━━━━━━━━━━

🧾 وصل التحويل:
${
  recuImage
    ? 'تم اختيار وصل التحويل، سيتم إرفاقه مع الطلب إذا كان الجهاز يدعم مشاركة الملفات عبر WhatsApp.'
    : 'لم يتم إرفاق وصل التحويل.'
}

شكراً لثقتكم بـ BIJOUTERIE 925.
`.trim();

    const whatsappUrl =
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    /*
      على الهواتف الحديثة:
      نحاول مشاركة الصورة + النص مباشرة عبر نظام المشاركة.

      إذا لم يكن ذلك مدعوماً:
      نفتح WhatsApp بالرسالة، والزبون يقدر يرفق الوصل يدوياً.
    */

    if (
      recuImage &&
      navigator.share &&
      navigator.canShare
    ) {
      try {
        const shareData = {
          title: `طلب ${newOrderId}`,
          text: message,
          files: [recuImage],
        };

        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);

          setOrderSent(true);
          return;
        }
      } catch (error) {
        /*
          المستخدم ممكن يسد نافذة المشاركة.
          ماشي خطأ يستاهل نقتل الصفحة عليه.
        */

        console.log('Share cancelled or unsupported.');
      }
    }

    window.open(whatsappUrl, '_blank');

    setOrderSent(true);
  };

  // ===============================
  // Loading
  // ===============================

  if (loading) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-[#111827] text-white flex items-center justify-center p-6"
      >
        <div className="text-center">
          <div className="text-yellow-500 text-3xl mb-3">
            925
          </div>

          <p className="text-gray-400">
            جاري تحميل المنتجات...
          </p>
        </div>
      </div>
    );
  }

  // ===============================
  // Error
  // ===============================

  if (error) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-[#111827] text-white flex items-center justify-center p-6"
      >
        <div className="max-w-md w-full bg-gray-900 border border-red-900 rounded-2xl p-6 text-center">
          <h2 className="text-xl font-bold text-red-400 mb-3">
            وقع مشكل
          </h2>

          <p className="text-gray-300 text-sm">
            {error}
          </p>
        </div>
      </div>
    );
  }

  // ===============================
  // UI
  // ===============================

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#111827] text-white p-3 md:p-6 font-sans"
    >

      {/* ================= HEADER ================= */}

      <header className="max-w-6xl mx-auto text-center py-5 md:py-8 border-b border-gray-800">

        <h1 className="text-2xl md:text-4xl font-bold tracking-wider text-yellow-500">
          BIJOUTERIE 925
        </h1>

        <p className="text-gray-400 text-sm mt-2">
          عالم الفضة الفاخرة والأناقة
        </p>

      </header>

      {/* ================= MAIN ================= */}

      <main className="max-w-6xl mx-auto mt-5 md:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

        {/* =====================================================
            PRODUCTS
        ===================================================== */}

        <section className="order-1 lg:order-1">

          {/* Categories */}

          <div className="mb-5">

            <div className="flex items-center gap-2 mb-3">

              <span className="text-sm text-yellow-500 font-bold">
                اختر الصنف
              </span>

            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">

              {categories.map((category) => (

                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition ${
                    activeCategory === category
                      ? 'bg-yellow-500 text-black'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {category}
                </button>

              ))}

            </div>

          </div>

          {/* Product grid */}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

            {filteredProducts.map((product) => {

              const unavailable =
                product.stock !== null &&
                product.stock <= 0;

              return (

                <button
                  key={product._id}
                  type="button"
                  disabled={unavailable}
                  onClick={() => selectProduct(product)}
                  className={`text-right border p-2 rounded-xl transition ${
                    selectedProduct?._id === product._id
                      ? 'border-yellow-500 bg-gray-800'
                      : 'border-gray-800 bg-gray-900'
                  } ${
                    unavailable
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer hover:border-gray-600'
                  }`}
                >

                  <div className="relative">

                    <img
                      src={product.images[0]}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-28 sm:h-32 object-cover rounded-lg"
                    />

                    {unavailable && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                        <span className="text-xs font-bold text-red-300">
                          غير متوفر
                        </span>
                      </div>
                    )}

                  </div>

                  <h3 className="font-bold text-xs mt-2 truncate">
                    {product.name}
                  </h3>

                  <p className="text-yellow-500 text-xs font-bold mt-1">
                    {formatPrice(product.price)}
                  </p>

                </button>

              );
            })}

          </div>

          {/* Selected product */}

          {selectedProduct && (

            <div className="bg-gray-900 p-4 md:p-5 rounded-2xl border border-gray-800 mt-5">

              {/* Main image */}

              <img
                src={
                  selectedImage ||
                  selectedProduct.images[0]
                }
                alt={selectedProduct.name}
                className="w-full h-64 md:h-80 object-cover rounded-xl"
              />

              {/* Thumbnails */}

              {selectedProduct.images.length > 1 && (

                <div className="flex gap-2 mt-3 overflow-x-auto">

                  {selectedProduct.images.map((image, index) => (

                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                      className={`shrink-0 rounded-lg overflow-hidden border-2 ${
                        selectedImage === image
                          ? 'border-yellow-500'
                          : 'border-transparent'
                      }`}
                    >

                      <img
                        src={image}
                        alt=""
                        className="w-16 h-16 object-cover"
                      />

                    </button>

                  ))}

                </div>

              )}

              {/* Product info */}

              <div className="mt-4">

                <h2 className="text-xl font-bold">
                  {selectedProduct.name}
                </h2>

                <p className="text-yellow-500 font-bold text-lg mt-1">
                  {formatPrice(selectedProduct.price)}
                </p>

                {selectedProduct.description && (

                  <p className="text-gray-400 text-sm leading-6 mt-3">
                    {selectedProduct.description}
                  </p>

                )}

              </div>

              {/* Sizes */}

              {selectedProduct.sizes.length > 0 && (

                <div className="mt-5">

                  <span className="text-xs text-gray-400 block mb-2">
                    المقاسات المتاحة:
                  </span>

                  <div className="flex flex-wrap gap-2">

                    {selectedProduct.sizes.map((size) => (

                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-lg text-xs ${
                          selectedSize === size
                            ? 'bg-yellow-500 text-black font-bold'
                            : 'bg-gray-800 text-gray-300'
                        }`}
                      >
                        {size}
                      </button>

                    ))}

                  </div>

                </div>

              )}

              {/* Stock */}

              {selectedProduct.stock !== null && (

                <div className="mt-4 text-xs">

                  {selectedProduct.stock > 0 ? (

                    <span className="text-green-400">
                      ✓ متوفر حالياً: {selectedProduct.stock}
                    </span>

                  ) : (

                    <span className="text-red-400">
                      ✕ غير متوفر حالياً
                    </span>

                  )}

                </div>

              )}

            </div>

          )}

        </section>

        {/* =====================================================
            CHECKOUT
        ===================================================== */}

        <section className="order-2 lg:order-2">

          <div className="bg-gray-800/50 p-4 md:p-6 rounded-2xl border border-gray-700 sticky top-4">

            <h2 className="text-xl font-bold text-center mb-5">
              إتمام الطلب
            </h2>

            {/* Payment */}

            <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 mb-5">

              <p className="text-yellow-500 font-bold mb-3">
                معلومات الحساب البنكي للتحويل
              </p>

              <div className="text-sm space-y-2">

                <p>
                  البنك:
                  <span className="font-bold mr-1">
                    {PAYMENT_INFO.bank}
                  </span>
                </p>

                <p>
                  صاحب الحساب:
                  <span className="font-bold mr-1">
                    {PAYMENT_INFO.accountName}
                  </span>
                </p>

              </div>

              <div className="flex gap-2 items-center bg-gray-800 p-2 rounded-lg mt-3">

                <span className="font-mono text-xs flex-1 break-all">
                  {PAYMENT_INFO.rib}
                </span>

                <button
                  type="button"
                  onClick={copyRIB}
                  className="shrink-0 bg-yellow-500 hover:bg-yellow-400 text-black text-xs px-3 py-2 rounded-lg font-bold"
                >
                  نسخ
                </button>

              </div>

              <p className="text-gray-500 text-xs mt-3 leading-5">
                بعد التحويل، أرفق وصل التحويل في الأسفل.
              </p>

            </div>

            {/* Order summary */}

            {selectedProduct && (

              <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 mb-5">

                <p className="text-gray-400 text-xs mb-3">
                  ملخص الطلب
                </p>

                <div className="flex justify-between gap-3 text-sm">

                  <span className="truncate">
                    {selectedProduct.name}
                  </span>

                  <span className="text-yellow-500 font-bold whitespace-nowrap">
                    {formatPrice(productPrice)}
                  </span>

                </div>

                {selectedSize && (

                  <div className="flex justify-between text-xs text-gray-400 mt-2">

                    <span>
                      المقاس
                    </span>

                    <span>
                      {selectedSize}
                    </span>

                  </div>

                )}

                <div className="flex justify-between text-sm text-gray-400 mt-3">

                  <span>
                    التوصيل
                  </span>

                  <span>
                    {formatPrice(shippingPrice)}
                  </span>

                </div>

                <div className="border-t border-gray-700 mt-3 pt-3 flex justify-between">

                  <span className="font-bold">
                    المجموع
                  </span>

                  <span className="text-yellow-500 font-bold text-lg">
                    {formatPrice(totalPrice)}
                  </span>

                </div>

              </div>

            )}

            {/* Form */}

            <form
              onSubmit={handleOrder}
              className="space-y-4"
            >

              {/* Full name */}

              <div>

                <label className="text-xs text-gray-400 block mb-1">
                  الاسم الكامل *
                </label>

                <input
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) =>
                    setFullName(e.target.value)
                  }
                  placeholder="مثال: يوسف العلمي"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm focus:outline-none focus:border-yellow-500"
                />

              </div>

              {/* Phone */}

              <div>

                <label className="text-xs text-gray-400 block mb-1">
                  رقم الهاتف *
                </label>

                <input
                  required
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/[^\d]/g, ''))
                  }
                  placeholder="0600000000"
                  maxLength={10}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm focus:outline-none focus:border-yellow-500"
                />

              </div>

              {/* City */}

              <div>

                <label className="text-xs text-gray-400 block mb-1">
                  المدينة *
                </label>

                <input
                  required
                  type="text"
                  value={city}
                  onChange={(e) =>
                    setCity(e.target.value)
                  }
                  placeholder="أكادير"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm focus:outline-none focus:border-yellow-500"
                />

                <p className="text-gray-600 text-[10px] mt-1">
                  ثمن التوصيل الحالي: {formatPrice(shippingPrice)}
                </p>

              </div>

              {/* Address */}

              <div>

                <label className="text-xs text-gray-400 block mb-1">
                  العنوان الكامل *
                </label>

                <textarea
                  required
                  value={address}
                  onChange={(e) =>
                    setAddress(e.target.value)
                  }
                  placeholder="الحي، الشارع، رقم المنزل"
                  rows={3}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-yellow-500"
                />

              </div>

              {/* Receipt */}

              <div>

                <label className="text-xs text-yellow-500 block mb-2 font-bold">
                  إرفاق وصل التحويل البنكي
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setRecuImage(
                      e.target.files?.[0] || null
                    )
                  }
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-2 text-xs text-gray-300 file:ml-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-yellow-500 file:text-black"
                />

                {recuImage && (

                  <p className="text-green-400 text-xs mt-2">
                    ✓ تم اختيار:
                    {' '}
                    {recuImage.name}
                  </p>

                )}

              </div>

              {/* Submit */}

              <button
                type="submit"
                disabled={
                  !selectedProduct ||
                  (selectedProduct.stock !== null &&
                    selectedProduct.stock <= 0)
                }
                className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-4 rounded-xl transition mt-2"
              >
                إرسال الطلب عبر WhatsApp
              </button>

              <p className="text-center text-gray-600 text-[10px] leading-5">
                سيتم فتح WhatsApp لإرسال تفاصيل الطلب.
                إذا كان جهازك يدعم مشاركة الملفات، سيتم إرفاق الوصل معه.
              </p>

            </form>

          </div>

        </section>

      </main>

      {/* ================= SUCCESS ================= */}

      {orderSent && orderId && (

        <div className="max-w-6xl mx-auto mt-6">

          <div className="bg-green-900/30 border border-green-700 rounded-2xl p-5 text-center">

            <div className="text-green-400 text-2xl mb-2">
              ✓
            </div>

            <h3 className="font-bold text-lg">
              تم تجهيز الطلب
            </h3>

            <p className="text-gray-400 text-sm mt-2">
              رقم الطلب:
            </p>

            <p className="text-yellow-500 font-bold text-lg mt-1">
              {orderId}
            </p>

            <p className="text-gray-500 text-xs mt-3">
              احتفظ برقم الطلب حتى يتم تأكيد العملية.
            </p>

          </div>

        </div>

      )}

      {/* ================= FOOTER ================= */}

      <footer className="max-w-6xl mx-auto text-center py-8 mt-8 border-t border-gray-800">

        <p className="text-gray-600 text-xs">
          © {new Date().getFullYear()} BIJOUTERIE 925
        </p>

      </footer>
<footer style={{ textAlign: 'center', padding: '20px', marginTop: '40px' }}>
    <button 
      onClick={() => setShowAdmin(true)}
      style={{ background: 'transparent', color: '#666', border: 'none', cursor: 'pointer', fontSize: '12px' }}
    >
      ⚙️ لوحة التحكم
    </button>
  </footer>
    </div>
  );
}