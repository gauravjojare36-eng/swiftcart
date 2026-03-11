import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, LogOut, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';

const Navbar: React.FC = () => {
  const { user, profile, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold tracking-tighter text-black">
              SWIFTCART<span className="text-emerald-500">.</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
              <Link to="/products" className="hover:text-black transition-colors">Shop</Link>
              <Link to="/categories" className="hover:text-black transition-colors">Categories</Link>
              {user && (
                <Link to="/orders" className="hover:text-black transition-colors">Orders</Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="text-emerald-600 font-semibold hover:text-emerald-700">Admin Panel</Link>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search products..." 
                className="bg-gray-50 border-none rounded-full px-4 py-2 text-sm w-64 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
              <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>

            <Link to="/cart" className="relative p-2 hover:bg-gray-50 rounded-full transition-colors">
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-2 hover:bg-gray-50 p-1 pr-3 rounded-full transition-colors">
                  <img src={profile?.photoURL || `https://ui-avatars.com/api/?name=${profile?.displayName}`} className="w-8 h-8 rounded-full border border-gray-100" />
                  <span className="text-sm font-medium text-gray-700">{profile?.displayName?.split(' ')[0]}</span>
                </Link>
                <button onClick={handleLogout} className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link to="/auth" className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                Sign In
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center gap-4">
            <Link to="/cart" className="relative p-2">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              <Link to="/products" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Shop</Link>
              <Link to="/categories" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Categories</Link>
              {user && (
                <Link to="/orders" className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Orders</Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="block px-3 py-2 text-base font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg">Admin Panel</Link>
              )}
              <div className="pt-4 border-t border-gray-100">
                {user ? (
                  <>
                    <Link to="/profile" className="block px-3 py-2 text-base font-medium text-gray-700">Profile</Link>
                    <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-base font-medium text-red-500">Sign Out</button>
                  </>
                ) : (
                  <Link to="/auth" className="block px-3 py-2 text-center bg-black text-white rounded-lg font-medium">Sign In</Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
