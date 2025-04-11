import React, { useEffect, useState } from 'react';
import BuyerFormModal from '../Components/BuyerForm';
import { BACKEND_URL } from '../Credentials/const';
import { data } from 'react-router-dom';

const Home = () => {
  const [buyers, setBuyers] = useState([]);
  const [bills, setBills] = useState([]);
  const [showBuyerModal, setShowBuyerModal] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setLoading] = useState(false);


  const fetchBuyers = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${BACKEND_URL}/buyers/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      setBuyers(data);
    } catch (err) {
      console.error("Failed to fetch buyers:", err);
    }
    setLoading(false)
  };

  const fetchBills = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${BACKEND_URL}/bills/`);
      const data = await res.json();
      setBills(data);
      setStartDate(data[data.length-1].date)
      setEndDate(data[0].date)
      console.log(data)
    } catch (err) {
      console.error("Failed to fetch bills:", err);
    }
    setLoading(false)
  };

  useEffect(() => {
    fetchBuyers();
    fetchBills();
  }, []);

  const deleteBuyer = async (buyer) => {
    if (!window.confirm(`Are you sure you want to delete Bill #${buyer.name}?`)) return;
    setLoading(true)
    const response = await fetch(`${BACKEND_URL}/buyers/${buyer.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    console.log(data);
    fetchBuyers(); // Refresh after delete
    setLoading(false)
  };

  const handleDeleteBill = async (bill) => {
    if (!window.confirm(`Are you sure you want to delete Bill #${bill.bill_number}?`)) return;

    try {
      setLoading(true)
      const res = await fetch(`${BACKEND_URL}/bills/${bill.id}/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
  
      if (res.ok) {
        alert("Bill deleted successfully.");
        fetchBills(); // Refresh the bill list
      } else {
        alert("Failed to delete bill.");
      }
    } catch (err) {
      console.error("Error deleting bill:", err);
      alert("Error deleting bill.");
    }
    setLoading(false)
  };
  

  // 🔍 Filtered buyers and bills based on search
  const filteredBuyers = buyers.filter(buyer =>
    buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    buyer.gstin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    buyer.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  let filteredBills = bills.filter(bill =>
    bill.bill_number.toString().includes(searchQuery.toLowerCase()) ||
    bill.buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bill.total_amount.toString().includes(searchQuery.toLowerCase())
  );

  filteredBills = bills.filter(bill => {
    const billDate = new Date(bill.date);
  
    const matchesSearch =
      bill.bill_number.toString().includes(searchQuery.toLowerCase()) ||
      bill.buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.total_amount.toString().includes(searchQuery.toLowerCase());
  
    const matchesStart = startDate ? billDate >= new Date(startDate) : true;
    const matchesEnd = endDate ? billDate <= new Date(endDate) : true;
  
    return matchesSearch && matchesStart && matchesEnd;
  });

  const generatePDF = async() =>{
    setLoading(true)
    const response = await fetch(`${BACKEND_URL}/export/?file_name=${startDate}-${endDate}.pdf`,{
      method:'POST',
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify({'bills':filteredBills})
    })
    if(response.ok){
      const data = await response.json();
      alert(data.message)
      window.open(`${BACKEND_URL.replace('/api', '')}/media/Archives/${startDate}-${endDate}.pdf`, '_blank');
    }
    else alert('Failed to save bills.')
    setLoading(false)
  }
  

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Veltex Billing Dashboard</h1>
      {isLoading &&(
        <h1 className='fixed bg-black text-white p-1 rounded text-lg top-25 right-[50%]'>Loading...</h1>
      )}
      {/* 🔍 Search Box */}
      <div className="mb-4 w-[35%]">
        <input
          type="text"
          placeholder="Search buyers or bills..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full border px-4 py-2 rounded shadow"
        />
      </div>

      <div className='flex gap-10'>
        <div className="space-y-4 w-[50%] pr-5 border-r-1 border-grey-200">
          <h1 className='font-bold text-green-600 pb-[10px] text-lg'>Buyers List :</h1>
          {filteredBuyers.map(buyer => (
            <div key={buyer.id} className="border rounded p-4 shadow flex justify-between items-center">
              <div className='w-[50%]'>
                <p className="font-bold text-lg">{buyer.name}</p>
                <p>{buyer.address}</p>
                <p><span className='font-semibold'>GSTIN :</span> {buyer.gstin}</p>
                <p><span className='font-semibold'>Phone :</span> {buyer.phone}</p>
              </div>
              <div className="space-x-2 w-[50%]">
                <button className="bg-yellow-500 text-white px-3 py-1 rounded"
                  onClick={() => {
                    setSelectedBuyer(buyer);
                    setShowBuyerModal(true);
                  }}
                >Edit Buyer</button>
                <button
                  onClick={() => window.location.href = `/create-bill/${buyer.id}`}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Create Bill
                </button>
                <button className="bg-red-600 text-white px-3 py-1 rounded"
                  onClick={() => deleteBuyer(buyer)}
                >Delete</button>
              </div>
            </div>
          ))}
        </div>

        <div className="w-[60%]">
          <h1 className='font-bold text-blue-600 pb-[10px] text-lg'>Previous Bills :</h1>

          <div className="flex gap-4 items-center mb-2">
            <div>
              <label className="text-sm font-medium">Start Date: </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border px-2 py-1 rounded"
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date: </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border px-2 py-1 rounded"
              />
            </div>
            {(startDate || endDate) && (
              <div>
                <button
                  className="ml-4 text-lg text-red-500 underline cursor-pointer"
                  onClick={() => {
                    setStartDate(bills[0].date);
                    setEndDate(bills[bills.length].date);
                  }}
                >
                  Clear Dates
                </button>
                <button
                  className="ml-4 text-lg text-green-500 underline cursor-pointer"
                  onClick={() => {
                    generatePDF();
                  }}
                >
                  Generate PDF
                </button>
              </div>
            )}
          </div>


          <table className="w-full border text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1 w-[10%]">Bill No</th>
                <th className="border px-2 py-1 w-[20%]">Date</th>
                <th className="border px-2 py-1 w-[30%]">Buyer</th>
                <th className="border px-2 py-1 w-[20%]">Amount</th>
                <th className='border px-2 py-1'>Options</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.map(bill => (
                <tr key={bill.bill_number}>
                  <td className="border px-2 py-1">
                    <a target='_blank' rel="noopener noreferrer" href={`http://localhost:8000/media/Bills/bill_${bill.bill_number}.pdf`}>
                      {bill.bill_number}
                    </a>
                  </td>
                  <td className="border px-2 py-1">
                    <a target='_blank' rel="noopener noreferrer" href={`http://localhost:8000/media/Bills/bill_${bill.bill_number}.pdf`}>
                      {bill.date}
                    </a>
                  </td>
                  <td className="border px-2 py-1">
                    <a target='_blank' href={`http://localhost:8000/media/Bills/bill_${bill.bill_number}.pdf`}>
                      {bill.buyer.name}
                    </a>
                  </td>
                  <td className="border px-2 py-1">
                    <a target='_blank' href={`http://localhost:8000/media/Bills/bill_${bill.bill_number}.pdf`}>
                      ₹{bill.total_amount}
                    </a>
                  </td>
                  <td className="border px-2 py-1">
                    <button
                        className="text-yellow-500 underline ml-2 cursor-pointer hover:text-yellow-700"
                        onClick={() => window.location.href = `/edit-bill/${bill.id}`}
                    >
                      Edit
                    </button>

                    <button
                      className="text-red-400 underline ml-2 cursor-pointer hover:text-red-700"
                      onClick={() => handleDeleteBill(bill)}
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ➕ Create Buyer Button */}
      <button
        onClick={() => {
          setSelectedBuyer(null);
          setShowBuyerModal(true);
        }}
        className="fixed bottom-6 right-[50%] bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-all"
      >
        + Create Buyer
      </button>

      {/* 📋 Buyer Modal */}
      {showBuyerModal && (
        <BuyerFormModal
          onClose={() => setShowBuyerModal(false)}
          onCreated={fetchBuyers}
          buyer={selectedBuyer}
        />
      )}
    </div>
  );
};

export default Home;
