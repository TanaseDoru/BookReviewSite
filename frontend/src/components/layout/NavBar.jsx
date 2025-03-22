// src/components/layout/NavBar.jsx
import { useContext, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Button from '../shared/Button';

const navLinks = [
  { name: 'Home', route: '/' },
  { name: 'Browse', route: '/browse' },
  { name: 'My Books', route: '/myBooks' },
];

const NavBar = () => {
  const { user, setUser } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:3000/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        localStorage.removeItem('token');
        setUser(null);
      }
    };

    fetchUserProfile();
  }, [setUser]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <NavLink to="/" className="text-2xl font-bold font-mono">
              BookReview
            </NavLink>
            <img src="/image.png" className="w-12 h-8" alt="logo" />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.route}
                to={link.route}
                className={({ isActive }) =>
                  `transition duration-300 ${isActive ? 'text-blue-300 font-semibold' : 'text-white hover:text-blue-300'}`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Profile/Login Section */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <img
                  src={`data:image/png;base64,${user.profilePicture}` || '/assets/blankProfile.png'}
                  alt="Profile"
                  className="w-10 h-10 rounded-full cursor-pointer border-2 border-blue-300 hover:border-blue-500 transition"
                  onClick={() => navigate('/profile')}
                />
                <Button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                  Log Out
                </Button>
              </>
            ) : (
              <NavLink to="/login">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                  Log In
                </Button>
              </NavLink>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? '✖' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden flex flex-col space-y-4 pb-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.route}
                to={link.route}
                className={({ isActive }) =>
                  `block text-center py-2 rounded-md transition duration-300 ${
                    isActive ? 'bg-blue-700 text-white' : 'bg-gray-800 hover:bg-gray-700'
                  }`
                }
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </NavLink>
            ))}
            {user ? (
              <div className="flex flex-col items-center">
                <img
                  src={user.profilePicture || '/assets/blankProfile.png'}
                  alt="Profile"
                  className="w-12 h-12 rounded-full cursor-pointer border-2 border-blue-300"
                  onClick={() => {
                    navigate('/profile');
                    setIsOpen(false);
                  }}
                />
                <Button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 mt-2 rounded-lg"
                >
                  Log Out
                </Button>
              </div>
            ) : (
              <NavLink to="/login" className="text-center" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                  Log In
                </Button>
              </NavLink>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;