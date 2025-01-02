import { NavLink, Link } from "react-router-dom";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import { useState } from "react";
import "./navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="container">
        {/* Logo */}
        <Link to="/" className="logo">
          TicVision
        </Link>

        {/* Hamburger Menu for Mobile */}
        <div className="menu-button">
          <button onClick={toggleMenu} className="focus:outline-none">
            {isOpen ? (
              <XIcon className="h-6 w-6 text-white" />
            ) : (
              <MenuIcon className="h-6 w-6 text-white" />
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <div
          className={`mobile-menu ${isOpen ? "open" : ""} md:flex md:items-center md:space-x-6`}
        >
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Profile
          </NavLink>
          <NavLink
            to="/table"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Tic Table
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
