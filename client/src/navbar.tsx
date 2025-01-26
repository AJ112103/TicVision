import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import userIcon from "./assets/usericon.png";
import logo from "./assets/logo.png";
import { MenuIcon } from "lucide-react";

const Navbar = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Fixed Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`navbar fixed top-0 w-full bg-[#4a90a1] text-white shadow-md z-50 border-b border-black ${
          isLoggedIn ? "bg-[#4a90a1] text-white" : "bg-[#C6E8F0] text-[#256472]"
        }`}
      >
        <div className="container flex items-center justify-between px-4 py-2 w-full">
          {/* Logo or Hamburger Menu */}
          {isLoggedIn ? (
            <button onClick={toggleMenu} className="focus:outline-none">
              <MenuIcon className="h-8 w-8 text-[#F28C8C]" />
            </button>
          ) : (
            <img src={logo} alt="Logo" className="h-12 w-auto" />
          )}

          {/* Centered Logo */}
          <Link
            to="/dashboard"
            className={`text-2xl font-bold ${
              isLoggedIn ? "text-[#C1E4EC]" : "text-[#256472]"
            }`}
          >
            TicVision
          </Link>

          {/* Profile Icon or Login */}
          {isLoggedIn ? (
            <Link to="/profile">
              <img
                src={userIcon}
                alt="Profile"
                className="h-12 w-12 rounded-full"
              />
            </Link>
          ) : (
            <div className="flex flex-col items-center">
              <Link to="/login">
                <img
                  src={userIcon}
                  alt="Profile"
                  className="h-12 w-12 rounded-full"
                />
              </Link>
              <Link
                to="/login"
                className="text-[#F28C8C] text-sm font-bold mt-[-8px]"
              >
                Login
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Navigation Links for Logged-In User */}
        {isLoggedIn && (
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 bg-[#4a90a1] shadow-lg w-full"
              >
                <div className="flex flex-col py-2">
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      `${isActive ? "nav-link active" : "nav-link"} block px-4 py-2 hover:bg-[#3a7a8a]`
                    }
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/table"
                    className={({ isActive }) =>
                      `${isActive ? "nav-link active" : "nav-link"} block px-4 py-2 hover:bg-[#3a7a8a]`
                    }
                    onClick={() => setIsOpen(false)}
                  >
                    Tic Table
                  </NavLink>
                  <NavLink
                    to="/suggestions"
                    className={({ isActive }) =>
                      `${isActive ? "nav-link active" : "nav-link"} block px-4 py-2 hover:bg-[#3a7a8a]`
                    }
                    onClick={() => setIsOpen(false)}
                  >
                    Suggestions
                  </NavLink>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.nav>

      {/* Add padding to offset the fixed navbar */}
      <div className="pt-[64px]">
        {/* This ensures the content starts below the navbar */}
      </div>
    </>
  );
};

export default Navbar;
