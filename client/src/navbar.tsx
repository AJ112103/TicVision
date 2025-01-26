import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import userIcon from "./assets/usericon.png";
import logo from "./assets/logo.png";
import { MenuIcon } from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Table", path: "/table" },
  { label: "Suggestions", path: "/suggestions" },
  { label: "Information", path: "/ticinfo" },
];

const Navbar = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Framer Motion variants for NavLinks
  const navLinkVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        delay: i * 0.1, // stagger each link slightly
      },
    }),
  };

  return (
    <>
      {/* Fixed Navbar */}
      <motion.nav
        // Navbar fade-in and slide-down
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`navbar fixed top-0 w-full text-white shadow-md z-50 border-b border-black ${
          isLoggedIn ? "bg-[#4a90a1]" : "bg-[#C6E8F0]"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-2 w-full">
          {/* Left Side: Logo & Brand */}
          <div className="flex items-center space-x-2">
            <img src={logo} alt="Logo" className="h-10 w-auto" />
            {isLoggedIn ? (
              <Link to="/dashboard" className="text-2xl font-bold text-[#C1E4EC]">
                TicVision
              </Link>
            ) : (
              <Link to="/" className="text-2xl font-bold text-[#256472]">
                TicVision
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Desktop NavLinks (only if logged in) */}
            {isLoggedIn && (
              <div className="hidden md:flex items-center space-x-4">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.label}
                    variants={navLinkVariants}
                    initial="hidden"
                    animate="visible"
                    custom={i}
                  >
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `${
                          isActive ? "text-[#F28C8C]" : "text-white"
                        } hover:text-[#F28C8C] transition-colors`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Profile / Login Icon */}
            {isLoggedIn ? (
              <>
                {/* Mobile Hamburger Button (hidden on desktop) */}
                <button
                  onClick={toggleMenu}
                  className="focus:outline-none md:hidden"
                >
                  <MenuIcon className="h-8 w-8 text-[#F28C8C]" />
                </button>

                {/* Profile Icon (desktop) */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="hidden md:block"
                >
                  <Link to="/profile">
                    <img
                      src={userIcon}
                      alt="Profile"
                      className="h-12 w-12 rounded-full"
                    />
                  </Link>
                </motion.div>
              </>
            ) : (
              // If not logged in: Show login icon & label
              <motion.div
                className="flex flex-col items-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
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
              </motion.div>
            )}
          </div>
        </div>

        {/* Mobile Dropdown (if logged in) */}
        {isLoggedIn && (
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 bg-[#4a90a1] shadow-lg w-full md:hidden"
              >
                <div className="flex flex-col py-2">
                  {navItems.map((item, i) => (
                    <motion.div
                      key={item.label}
                      variants={navLinkVariants}
                      initial="hidden"
                      animate="visible"
                      custom={i}
                    >
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `${
                            isActive ? "text-[#F28C8C]" : "text-white"
                          } block px-4 py-2 hover:bg-[#3a7a8a] transition-colors`
                        }
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </NavLink>
                    </motion.div>
                  ))}

                  {/* Profile icon in dropdown */}
                  <div className="border-t border-[#F28C8C] mt-2 pt-2 px-4">
                    <Link to="/profile" onClick={() => setIsOpen(false)}>
                      <div className="flex items-center space-x-2 hover:bg-[#3a7a8a] p-2 rounded transition-colors">
                        <img
                          src={userIcon}
                          alt="Profile"
                          className="h-8 w-8 rounded-full"
                        />
                        <span>Profile</span>
                      </div>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.nav>

      {/* Offset for fixed navbar */}
      <div className="pt-[64px]" />
    </>
  );
};

export default Navbar;
