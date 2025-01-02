import { NavLink, Link } from "react-router-dom";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="navbar relative"
    >
      <div className="container">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-shrink-0"
        >
          <Link to="/" className="logo">
            TicVision
          </Link>
        </motion.div>

        {/* Hamburger Menu for Mobile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="menu-button md:hidden"
        >
          <button onClick={toggleMenu} className="focus:outline-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={isOpen ? 'close' : 'menu'}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                {isOpen ? (
                  <XIcon className="h-6 w-6 text-white" />
                ) : (
                  <MenuIcon className="h-6 w-6 text-white" />
                )}
              </motion.div>
            </AnimatePresence>
          </button>
        </motion.div>

        {/* Desktop Navigation Links */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="hidden md:flex md:items-center md:gap-8 md:ml-auto"
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
            to="/table"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Tic Table
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Profile
          </NavLink>
        </motion.div>
      </div>

      {/* Mobile Navigation Links */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-full left-0 right-0 bg-[#4a90a1] shadow-lg w-full"
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
                to="/profile"
                className={({ isActive }) =>
                  `${isActive ? "nav-link active" : "nav-link"} block px-4 py-2 hover:bg-[#3a7a8a]`
                }
                onClick={() => setIsOpen(false)}
              >
                Profile
              </NavLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;