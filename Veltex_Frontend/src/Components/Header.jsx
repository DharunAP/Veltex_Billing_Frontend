import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/veltex_logo.jpg'
import { BACKEND_URL } from '../Credentials/const';
const Header = () => {
  const [isLoading,setLoading] = useState(false)
  const handleArcheives = async() =>{
    if (!window.confirm(`Are you sure you want to clear all the bills and convert them to pdf?`)) return;
    setLoading(true)
    const response = await fetch(`${BACKEND_URL}/archives/`)
    if(response.ok){
      const data = await response.json()
      alert(data.message)
    }
    else alert("Failed to reset bills.")
    setLoading(false)
  }
  return (
    <header className="bg-white shadow-md p-4 flex items-center justify-between">
      {isLoading &&(
        <h1 className='fixed bg-black text-white p-1 rounded text-lg top-25 right-[50%]'>Loading...</h1>
      )}
      {/* Left: Logo and Title */}
      <a href='/' className="flex items-center gap-3">
        {/* Replace with your actual logo */}
        <img
          src={logo}
          alt="Logo"
          className="w-15 h-15 object-contain rounded-full"
        />
        <h1 className="text-2xl font-bold text-[40px] text-yellow-600">VEL TEX</h1>
      </a>

      {/* Right: Archive link */}
      <div className='flex items-center gap-5'>
        <Link
            to={"/create-bill"}
            className='text-sm font-semibold bg-blue-200 px-4 py-1.5 rounded hover:bg-blue-300'
        >
            CreateBill
        </Link>
        <Link
            onClick={()=>handleArcheives()}
            className="text-sm font-semibold bg-gray-200 px-4 py-1.5 rounded hover:bg-gray-300"
        >
            Archive
        </Link>
      </div>
    </header>
  );
};

export default Header;
