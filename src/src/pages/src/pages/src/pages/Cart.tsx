import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

const Cart: React.FC = () => {
  const { 
    items, removeItem, updateQuantity, total, subtotal, discount, tax, shipping, itemCount, 
    applyCoupon, removeCoupon, appliedCoupon, clearCart 
  } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = React.useState('');
  const [couponMsg, setCouponMsg] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);
  const [orderSuccess, setOrderSuccess] = React.useState(false);
  const [customerDetails, setCustomerDetails] = React.useState({
    name: '',
    mobile: '',
    address: ''
  });

  const isFormValid = customerDetails.name.trim() !== '' && 
                      customerDetails.mobile.trim() !== '' && 
                      customerDetails.address.trim() !== '';

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    const res = await applyCoupon(couponCode);
    setCouponMsg({ type: res.success ? 'success' : 'error', text: res.message });
    if (res.success) setCouponCode('');
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setIsCheckingOut(true);
    try {
      // Create Order
      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        customerName: customerDetails.name,
        mobileNumber: customerDetails.mobile,
        shippingAddress: {
          street: customerDetails.address,
          city: '',
          state: '',
          zip: '',
          country: ''
        },
        items,
        total,
        subtotal,
        discount,
        tax,
        shipping,
        couponCode: appliedCoupon?.code || null,
        status: 'pending',
        paymentStatus: 'unpaid',
        createdAt: new Date().toISOString(),
      });

      // Track Coupon Usage
      if (appliedCoupon) {
        const couponRef = doc(db, 'coupons', appliedCoupon.id);
        await updateDoc(couponRef, {
          usageCount: increment(1)
        });
      }

      setOrderSuccess(true);
      clearCart();
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-3xl font-black tracking-tighter mb-4">ORDER PLACED!</h2>
        <p className="text-gray-500 mb-8">Thank you for your purchase. Your order is being processed.</p>
        <Link to="/products" className="bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-emerald-500 transition-all inline-flex items-center gap-2">
          Continue Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-3xl font-black tracking-tighter mb-4">YOUR CART IS EMPTY</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/products" className="bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-emerald-500 transition-all inline-flex items-center gap-2">
          Start Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-black tracking-tighter mb-12">YOUR SHOPPING BAG <span className="text-emerald-500">({itemCount})</span></h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 mb-8">
            <h2 className="text-xl font-black tracking-tighter mb-6">SHIPPING DETAILS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                <input 
                  type="text" 
                  placeholder="Enter your full name"
                  value={customerDetails.name}
                  onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mobile Number</label>
                <input 
                  type="tel" 
                  placeholder="Enter mobile number"
                  value={customerDetails.mobile}
                  onChange={(e) => setCustomerDetails({...customerDetails, mobile: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Address</label>
                <textarea 
                  placeholder="Enter your complete delivery address"
                  rows={3}
                  value={customerDetails.address}
                  onChange={(e) => setCustomerDetails({...customerDetails, address: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 resize-none"
                />
              </div>
            </div>
          </div>

          {items.map((item) => (
            <motion.div 
              layout
              key={item.productId} 
              className="flex gap-6 bg-white p-6 rounded-3xl border border-gray-100"
            >
              <div className="w-32 h-32 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-grow flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">${item.price}</p>
                  </div>
                  <button onClick={() => removeItem(item.productId)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4 bg-gray-50 rounded-xl px-3 py-1">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-1 hover:text-emerald-600"><Minus className="w-4 h-4" /></button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-1 hover:text-emerald-600"><Plus className="w-4 h-4" /></button>
                  </div>
                  <span className="text-lg font-black text-gray-900">${(item.price * item.quantity).toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 sticky top-24">
            <h2 className="text-xl font-black tracking-tighter mb-6">ORDER SUMMARY</h2>
            
            <div className="mb-8">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Coupon Code" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-grow bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20"
                />
                <button 
                  onClick={handleApplyCoupon}
                  className="bg-black text-white px-4 py-3 rounded-xl text-xs font-bold hover:bg-emerald-500 transition-all"
                >
                  Apply
                </button>
              </div>
              {couponMsg && (
                <p className={`text-[10px] mt-2 font-bold uppercase tracking-widest ${couponMsg.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {couponMsg.text}
                </p>
              )}
              {appliedCoupon && (
                <div className="mt-3 flex items-center justify-between bg-emerald-50 px-3 py-2 rounded-lg">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                    {appliedCoupon.code} Applied
                  </span>
                  <button onClick={removeCoupon} className="text-emerald-700 hover:text-emerald-900">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">${subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Discount</span>
                  <span className="font-bold">-${discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-500">
                <span>Shipping</span>
                <span className="font-bold text-gray-900">${shipping.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Estimated Tax (5%)</span>
                <span className="font-bold text-gray-900">${tax.toLocaleString()}</span>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                <span className="text-lg font-black">TOTAL</span>
                <span className="text-2xl font-black text-emerald-500">${total.toLocaleString()}</span>
              </div>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={isCheckingOut || !isFormValid}
              className="w-full bg-black text-white py-5 rounded-2xl font-bold hover:bg-emerald-500 disabled:bg-gray-200 disabled:text-gray-400 transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              {isCheckingOut ? 'Processing...' : 'Checkout Now'} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            {!isFormValid && (
              <p className="text-[10px] text-center text-red-400 mt-3 font-bold uppercase tracking-widest">
                Please fill in all shipping details
              </p>
            )}
            <p className="text-center text-[10px] text-gray-400 mt-6 uppercase tracking-widest font-bold">
              Secure Checkout Powered by Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
