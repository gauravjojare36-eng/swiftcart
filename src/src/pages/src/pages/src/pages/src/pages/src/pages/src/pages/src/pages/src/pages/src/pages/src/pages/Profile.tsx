import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, User, MapPin, CreditCard, Bell, Shield, LogOut, ChevronRight } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <div className="w-full md:w-80 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 text-center">
            <img 
              src={profile?.photoURL || `https://ui-avatars.com/api/?name=${profile?.displayName}`} 
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-emerald-50"
            />
            <h2 className="text-xl font-black tracking-tighter text-gray-900 uppercase">{profile?.displayName}</h2>
            <p className="text-sm text-gray-400">{profile?.email}</p>
            <div className="mt-4 inline-block bg-emerald-50 text-emerald-600 text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest">
              {profile?.role} Account
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden">
            {[
              { icon: Package, label: "My Orders", path: "/orders", active: true },
              { icon: User, label: "Personal Info" },
              { icon: MapPin, label: "Addresses" },
              { icon: CreditCard, label: "Payments" },
              { icon: Bell, label: "Notifications" },
              { icon: Shield, label: "Security" }
            ].map((item, i) => (
              <button 
                key={i}
                onClick={() => item.path && navigate(item.path)}
                className={`w-full flex items-center justify-between px-6 py-4 text-sm font-bold transition-all ${item.active ? 'bg-emerald-50 text-emerald-600' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            ))}
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-6 py-4 text-sm font-bold text-red-500 hover:bg-red-50 transition-all border-t border-gray-50"
            >
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black tracking-tighter uppercase">Recent Orders</h3>
              <button onClick={() => navigate('/orders')} className="text-sm font-bold text-emerald-600 hover:underline uppercase tracking-widest">View All</button>
            </div>
            <div className="space-y-4">
              <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No orders yet</p>
                <button onClick={() => navigate('/products')} className="mt-4 text-emerald-600 font-bold hover:underline">Start Shopping</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100">
              <h3 className="text-lg font-black tracking-tighter mb-6 uppercase">Default Address</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                No address saved yet. Add a shipping address to speed up your checkout process.
              </p>
              <button className="mt-6 text-emerald-600 font-bold text-sm hover:underline uppercase tracking-widest">Add Address</button>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100">
              <h3 className="text-lg font-black tracking-tighter mb-6 uppercase">Payment Methods</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Securely save your payment methods for a faster checkout experience next time.
              </p>
              <button className="mt-6 text-emerald-600 font-bold text-sm hover:underline uppercase tracking-widest">Add Card</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
