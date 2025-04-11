import React, { useEffect, useState } from 'react';
import { BACKEND_URL } from '../Credentials/const';
const BuyerFormModal = ({ onClose, onCreated, buyer = null }) => {
  const isEditMode = !!buyer;

  const [form, setForm] = useState({
    name: '',
    address: '',
    state_code: '',
    gstin: '',
    phone: ''
  });

  useEffect(() => {
    if (isEditMode && buyer) {
      setForm({
        name: buyer.name || '',
        address: buyer.address || '',
        state_code: buyer.state_code || '',
        gstin: buyer.gstin || '',
        phone: buyer.phone || ''
      });
    }
  }, [buyer]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isEditMode
      ? `${BACKEND_URL}/buyers/${buyer.id}/`
      : `${BACKEND_URL}/buyers/`;

    const method = isEditMode ? 'PUT' : 'POST';
    console.log(form,url,method)
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    if (res.ok) {
      onCreated(); // refresh buyer list
      onClose();   // close modal
    } else {
      alert(`Failed to ${isEditMode ? 'update' : 'create'} buyer`);
    }
  };

  return (
    <div className="fixed inset-0 text-white bg-opacity-30 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-blue-500 border-3 border-black border-dashed p-6 rounded-lg w-[400px] space-y-4 "
      >
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{isEditMode ? 'Edit Buyer' : 'Add New Buyer'}</h2>
            <button
                onClick={onClose}
                className="text-red-500 bg-white border-1 border-black hover:text-red-600 text-2xl font-bold leading-none"
                aria-label="Close"
            >
                &times;
            </button>
        </div>

        {['name', 'address', 'state_code', 'gstin', 'phone'].map((field) => (
          <div key={field}>
            <label className="block font-semibold capitalize">{field.replace('_', ' ')}</label>
            <input
              type="text"
              name={field}
              value={form[field]}
              onChange={handleChange}
              required
              className="w-full bg-white text-black border px-3 py-1 rounded"
            />
          </div>
        ))}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-1 bg-gray-300 rounded">Cancel</button>
          <button type="submit" className="px-4 py-1 bg-blue-600 text-white rounded">
            {isEditMode ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BuyerFormModal;
