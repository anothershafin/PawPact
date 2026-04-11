import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/toastify-compat.css";
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
import DiscoverPets from "./pages/DiscoverPets";
import Shortlist from "./pages/Shortlist";
import ComparePets from "./pages/ComparePets";
import Questionnaire from "./pages/Questionnaire";
import MyApplications from "./pages/MyApplications";
import ReviewApplications from "./pages/ReviewApplications";
import Contracts from "./pages/Contracts";
import ContractDetail from "./pages/ContractDetail";
import Reports from "./pages/Reports";
import Reviews from "./pages/Reviews";
import AdminPanel from "./pages/AdminPanel";

function App() {
  return (
    <Router>
      <Navbar />
      <ToastContainer position="top-right" newestOnTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/view-profile" element={<ViewProfile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/pets" element={<Pets />} />
        <Route path="/add-pet" element={<AddPet />} />
        <Route path="/discover" element={<DiscoverPets />} />
        <Route path="/shortlist" element={<Shortlist />} />
        <Route path="/compare" element={<ComparePets />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/applications" element={<MyApplications />} />
        <Route path="/review-applications" element={<ReviewApplications />} />
        <Route path="/contracts" element={<Contracts />} />
        <Route path="/contracts/:id" element={<ContractDetail />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/pet/:id" element={<PetProfile />} />
        <Route path="/edit-pet/:id" element={<EditPet />} />
      </Routes>
    </Router>
  );
}

export default App;
