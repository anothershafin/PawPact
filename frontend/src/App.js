import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ViewProfile from "./pages/ViewProfile";
import EditProfile from "./pages/EditProfile";
import Pets from "./pages/Pets";
import AddPet from "./pages/AddPet";
import PetProfile from "./pages/PetProfile";
import EditPet from "./pages/EditPet";
import ReportForm from "./pages/ReportForm";


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/view-profile" element={<ViewProfile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/pets" element={<Pets />} />
        <Route path="/add-pet" element={<AddPet />} />
        <Route path="/pet/:id" element={<PetProfile />} />
        <Route path="/edit-pet/:id" element={<EditPet />} />
        <Route path="/report" element={<ReportForm />} />
      </Routes>
    </Router>
  );
}

export default App;
