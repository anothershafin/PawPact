import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { saveAuth } from "../services/auth";

export default function Login() {
  const nav = useNavigate();
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      const res = await api.post("/auth/login", form);
      saveAuth(res.data.token, res.data.user);
      nav("/");
    } catch (error) {
      setErr(error?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h2>Login</h2>
        {err && <p className="error">{err}</p>}

        <form className="form" onSubmit={onSubmit}>
          <input className="input" name="email" placeholder="Email" value={form.email} onChange={onChange} />
          <input className="input" type="password" name="password" placeholder="Password" value={form.password} onChange={onChange} />

          <button className="btn btn-primary" type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}