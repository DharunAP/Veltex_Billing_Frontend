import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreateBill from "./pages/CreateBill";
import Header from "./Components/Header";

function App() {
  return (
    <Router>
      <Header/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-bill" element={<CreateBill/>} />
        <Route path="/create-bill/:buyerId" element={<CreateBill />} />
        <Route path="/edit-bill/:bill_number" element={<CreateBill />} />
      </Routes>
    </Router>
  );
}

export default App;
