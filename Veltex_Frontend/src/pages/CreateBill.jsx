import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../Credentials/const';

const CreateBill = () => {
  const { buyerId, bill_number } = useParams();
  const isEditMode = !!bill_number;

  const navigate = useNavigate();
  const [buyer, setBuyer] = useState({
    name: '',
    address: '',
    gstin: '',
    phone: '',
    state_code: '',
  });

  const [items, setItems] = useState([
    { particulars:"", hsn_code:5208, quantity: 0, rate: 0, amount: 0 }
  ]);

  const [subtotal, setSubtotal] = useState(0);
  const [gstSGST, setGstSGST] = useState(0);
  const [gstCGST, setGstCGST] = useState(0);
  const [gstIGST, setGstIGST] = useState(0);
  const [total, setTotal] = useState(0);

  // Fetch buyer if buyerId is present
  useEffect(() => {
    if (isEditMode) {
      fetch(`${BACKEND_URL}/bills/${bill_number}/`)
        .then(res => res.json())
        .then(data => {
          setBuyer(data.buyer);
          setItems(data.items.map(item => ({
            particulars: item.particulars,
            hsn_code: item.hsn_code,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.quantity * item.rate
          })));
        })
        .catch(err => console.error('Failed to fetch bill:', err));
    } else if (buyerId) {
      fetch(`${BACKEND_URL}/buyers/${buyerId}/`)
        .then(res => res.json())
        .then(data => setBuyer(data))
        .catch(err => console.error('Failed to fetch buyer:', err));
    }
    console.log(items)
  }, [buyerId, bill_number]);
  

  // Update amounts on items change
  useEffect(() => {
    let sum = 0;
    items.forEach(item => {
      item.amount = item.quantity * item.rate;
      sum += item.amount;
    });
    setSubtotal(sum);

    const isTamilNadu = buyer.state_code === '33';
    if (isTamilNadu) {
      const tax = +(sum * 0.025).toFixed(2);
      setGstSGST(tax);
      setGstCGST(tax);
      setGstIGST(0);
      setTotal(Math.round(sum + tax * 2));
    } else {
      const igst = +(sum * 0.05).toFixed(2);
      setGstIGST(igst);
      setGstSGST(0);
      setGstCGST(0);
      setTotal(Math.round(sum + igst));
    }
  }, [items, buyer]);

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    if (field === 'product') {
      updated[index][field] = value;
    } else {
      updated[index][field] = field === 'rate' || field === 'quantity' ? parseFloat(value || 0) : value;
    }
    setItems(updated);
  };

  const addItemRow = () => {
    setItems([...items, { particulars:"", hsn_code:5208, quantity: 0, rate: 0, amount: 0 }]);
  };

  const removeItemRow = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const handleBuyerChange = (e) => {
    setBuyer({ ...buyer, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const payload = {
      date: new Date().toISOString().split('T')[0],
      buyer,
      items,
    };
  
    const endpoint = isEditMode
      ? `${BACKEND_URL}/bills/${bill_number}/`
      : `${BACKEND_URL}/bills/create/`;
  
    const method = isEditMode ? 'PUT' : 'POST';
  
    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  
    if (res.ok) {
      const data = await res.json();
      alert(`Bill ${isEditMode ? "updated" : "created"} successfully!`);
      window.open(`${BACKEND_URL.replace('/api', '')}/media/Bills/bill_${data.bill_number}.pdf`, '_blank');
      navigate('/');
    } else {
      alert(`Failed to ${isEditMode ? "update" : "create"} bill.`);
    }
  };
  

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? "Edit Bill" : "Create Bill"}
      </h1>


      {/* Buyer Info */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {['name', 'address', 'gstin', 'state_code', 'phone'].map(field => (
            <div key={field}>
              <label className="block font-medium capitalize">{field.replace('_', ' ')}:</label>
              <input
                required
                name={field}
                value={buyer[field]}
                onChange={handleBuyerChange}
                className="w-full border px-3 py-1 rounded"
              />
            </div>
          ))}
        </div>

        {/* Items Table */}
        <div>
          <h2 className="font-semibold mb-2">Items</h2>
          <table className="w-full table-auto border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">HSN Code</th>
                <th className="border px-2 py-1">Product</th>
                <th className="border px-2 py-1">Qty</th>
                <th className="border px-2 py-1">Rate</th>
                <th className="border px-2 py-1">Amount</th>
                <th className="border px-2 py-1"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td className="border p-1">
                    <input
                      type="text"
                      value={item.hsn_code}
                      onChange={e => handleItemChange(idx, 'hsn_code', e.target.value)}
                      className="w-full border px-2 py-1 rounded"
                    />
                  </td>
                  <td className="border p-1">
                    <input
                      type="text"
                      value={item.particulars}
                      onChange={e => handleItemChange(idx, 'particulars', e.target.value)}
                      className="w-full border px-2 py-1 rounded"
                    />
                  </td>
                  <td className="border p-1">
                    <input
                      type="text"
                      value={item.quantity}
                      onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-full border px-2 py-1 rounded"
                    />
                  </td>
                  <td className="border p-1">
                    <input
                      type="text"
                      value={item.rate}
                      onChange={e => handleItemChange(idx, 'rate', e.target.value)}
                      className="w-full border px-2 py-1 rounded"
                    />
                  </td>
                  <td className="border p-1 text-right">{item.amount.toFixed(2)}</td>
                  <td className="border p-1 text-center">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        className="text-red-600"
                      >
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" onClick={addItemRow} className="mt-2 bg-blue-500 text-white px-3 py-1 rounded">
            + Add Item
          </button>
        </div>

        {/* Summary */}
        <div className="text-right space-y-1">
          <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
          {buyer.state_code === '33' ? (
            <>
              <p>SGST (2.5%): ₹{gstSGST.toFixed(2)}</p>
              <p>CGST (2.5%): ₹{gstCGST.toFixed(2)}</p>
            </>
          ) : (
            <p>IGST (5%): ₹{gstIGST.toFixed(2)}</p>
          )}
          <p className="font-bold text-lg">Total: ₹{total.toFixed(2)}</p>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
            Save Bill
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBill;
