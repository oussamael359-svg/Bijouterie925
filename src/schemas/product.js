export default {
  name: 'product',
  title: 'المنتجات',
  type: 'document',
  fields: [
    { name: 'name', title: 'اسم المنتج', type: 'string' },
    { name: 'price', title: 'الثمن', type: 'string' },
    { name: 'image', title: 'صورة المنتج', type: 'image', options: { hotspot: true } },
    { 
      name: 'sizes', 
      title: 'المقاسات المتوفرة', 
      type: 'array', 
      of: [{ type: 'string' }] 
    }
  ]
}
