import { Link } from "react-router-dom";
import { isLoggedIn } from "../services/auth";

export default function Navbar() {
  const loggedIn = isLoggedIn();

  return (
    <div className="navbar">
      <div />

      <div className="navbar-right">
        <Link className="brand nav-link" to="/">
          PawPact
        </Link>

        {!loggedIn ? (
          <>
            <Link className="nav-link" to="/login">
              Login
            </Link>
            <Link className="nav-link" to="/signup">
              Sign Up
            </Link>
          </>
        ) : (
          <button className="btn btn-primary" type="button">
            Profile
          </button>
        )}
      </div>
    </div>
  );
}