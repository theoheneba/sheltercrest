import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Home, LogIn, UserPlus, LogOut, User, ChevronDown, ShoppingBag, Briefcase } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import CartDrawer from '../shop/CartDrawer';
import { useCartStore } from '../../store/cartStore';
import Button from '../../components/ui/Button';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { items } = useCartStore();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img 
                src="https://translogixgroup.com/wp-content/uploads/2025/05/shelterlogo.png" 
                alt="ShelterCrest Logo" 
                className="h-10 w-auto"
              />
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
              Home
            </Link>
            <Link to="/eligibility" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
              Eligibility Check
            </Link>
            
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
                  Login
                </Link>
                <Link to="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors relative"
                >
                  <ShoppingBag size={20} />
                  {items.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {items.length}
                    </span>
                  )}
                </button>
                <div className="relative ml-3">
                  <div>
                    <button
                      onClick={toggleProfile}
                      className="flex items-center max-w-xs text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-md py-2 px-3"
                      id="user-menu-button"
                      aria-expanded={isProfileOpen}
                      aria-haspopup="true"
                    >
                      <span className="sr-only">Open user menu</span>
                      <span className="flex items-center text-gray-800 font-medium">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-2 text-primary-700">
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </div>
                        <span className="mr-2 hidden sm:block">{user?.firstName} {user?.lastName}</span>
                        <ChevronDown size={16} />
                      </span>
                    </button>
                  </div>
                  
                  {isProfileOpen && (
                    <div 
                      className="origin-top-right absolute right-0 mt-2 w-48 rounded-lg shadow-dropdown py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu-button"
                      tabIndex={-1}
                    >
                      <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700" role="menuitem" onClick={() => setIsProfileOpen(false)}>
                        Dashboard
                      </Link>
                      {user?.role === 'company' && (
                        <Link to="/company" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700" role="menuitem" onClick={() => setIsProfileOpen(false)}>
                          Company Dashboard
                        </Link>
                      )}
                      {user?.role === 'company_manager' && (
                        <Link to="/company-manager" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700" role="menuitem" onClick={() => setIsProfileOpen(false)}>
                          Company Manager
                        </Link>
                      )}
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700" role="menuitem" onClick={() => setIsProfileOpen(false)}>
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                        role="menuitem"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden">
            {isAuthenticated && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 rounded-md text-gray-500 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 relative"
              >
                <ShoppingBag size={20} />
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 max-h-[80vh] overflow-y-auto">
            <Link to="/" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50" onClick={toggleMenu}>
              <Home size={18} className="mr-2" />
              Home
            </Link>
            <Link to="/eligibility" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50" onClick={toggleMenu}>
              Eligibility Check
            </Link>
            
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50" onClick={toggleMenu}>
                  <LogIn size={18} className="mr-2" />
                  Login
                </Link>
                <Link to="/register" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50" onClick={toggleMenu}>
                  <UserPlus size={18} className="mr-2" />
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50" onClick={toggleMenu}>
                  <User size={18} className="mr-2" />
                  Dashboard
                </Link>
                {user?.role === 'company' && (
                <Link to="/company" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50" onClick={toggleMenu}>
                  <Briefcase size={18} className="mr-2" />
                  Company Dashboard
                </Link>
                )}
                {user?.role === 'company_manager' && (
                <Link to="/company-manager" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50" onClick={toggleMenu}>
                  <Briefcase size={18} className="mr-2" />
                  Company Manager
                </Link>
                )}
                <Link to="/profile" className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50" onClick={toggleMenu}>
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50"
                >
                  <LogOut size={18} className="mr-2" />
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </nav>
  );
};

export default Navbar;