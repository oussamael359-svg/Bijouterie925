import React from 'react';

export default function Admin({ onBackToStore }) {
  return (
    <div style={{ padding: '20px', color: '#fff', backgroundColor: '#111', minHeight: '100vh' }}>
      <button 
        onClick={onBackToStore} 
        style={{ padding: '10px 20px', backgroundColor: '#f39c12', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        ⬅️ العودة للمتجر
      </button>
      <h1 style={{ marginTop: '20px' }}>⚙️ لوحة التحكم</h1>
      <p>مرحباً بك في لوحة تحكم المتجر.</p>
    </div>
  );
}