import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { saveAuth } from "../services/auth";

export default function Signup() {
  const nav = useNavigate();
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Adopter",
    district: "",
    thana: "",
    area: "",
    password: "",
    confirmPassword: "",
  });

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      const res = await api.post("/auth/signup", form);
      saveAuth(res.data.token, res.data.user);
      nav("/");
    } catch (error) {
      setErr(error?.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h2>Sign Up</h2>
        {err && <p className="error">{err}</p>}

        <form className="form" onSubmit={onSubmit}>
          <input className="input" name="name" placeholder="Name" value={form.name} onChange={onChange} />
          <input className="input" name="email" placeholder="Email" value={form.email} onChange={onChange} />
          <input className="input" name="phone" placeholder="Phone Number" value={form.phone} onChange={onChange} />

          <select className="select" name="role" value={form.role} onChange={onChange}>
            <option value="Adopter">Adopter</option>
            <option value="Adoptee Parent">Adoptee Parent</option>
          </select>

          <input className="input" name="district" placeholder="District" value={form.district} onChange={onChange} />
          <input className="input" name="thana" placeholder="Thana" value={form.thana} onChange={onChange} />
          <input className="input" name="area" placeholder="Area" value={form.area} onChange={onChange} />

          <input className="input" type="password" name="password" placeholder="Create Password" value={form.password} onChange={onChange} />
          <input className="input" type="password" name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={onChange} />

          <button className="btn btn-primary" type="submit">
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}