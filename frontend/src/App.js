import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
import ComparePets from "./pages/ComparePets";
import Shortlist from "./pages/Shortlist";
import Applications from "./pages/Applications";
import Questionnaire from "./pages/Questionnaire";

function App() {
  return (
    <Router>
      <Navbar />
      <ToastContainer position="bottom-right" autoClose={3000} />
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
        <Route path="/compare" element={<ComparePets />} />
        <Route path="/shortlist" element={<Shortlist />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
      </Routes>
    </Router>
  );
}

export default App;