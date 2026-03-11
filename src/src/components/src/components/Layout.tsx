import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { motion } from 'motion/react';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50/30 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Outlet />
        </motion.div>
      </main>
      <footer className="bg-white border-t border-gray-100 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-1">
              <span className="text-2xl font-bold tracking-tighter text-black">
                SWIFTCART<span className="text-emerald-500">.</span>
              </span>
              <p className="mt-4 text-sm text-gray-500 leading-relaxed">
                The next generation of e-commerce. Fast, secure, and reliable shopping experience for everyone.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-emerald-600 transition-colors">All Products</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">New Arrivals</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Best Sellers</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Deals</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Shipping Info</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Returns</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Newsletter</h4>
              <p className="text-sm text-gray-500 mb-4">Subscribe to get special offers and updates.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="Email address" className="bg-gray-50 border-none rounded-lg px-4 py-2 text-sm flex-grow" />
                <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">Join</button>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400">© 2026 SwiftCart Pro. All rights reserved.</p>
            <div className="flex gap-6 text-xs text-gray-400">
              <a href="#" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-600 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
