import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';
import { Package, Clock, CheckCircle2, Truck, XCircle, ChevronRight, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const Orders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', user?.uid),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'processing': return <Package className="w-4 h-4 text-blue-500" />;
      case 'shipped': return <Truck className="w-4 h-4 text-indigo-500" />;
      case 'delivered': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'processing': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'shipped': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
        <p className="text-gray-500 font-medium">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="text-3xl font-black tracking-tighter mb-4">NO ORDERS YET</h2>
        <p className="text-gray-500 mb-8">You haven't placed any orders yet. Start shopping to see your history here!</p>
        <Link to="/products" className="bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-emerald-500 transition-all inline-flex items-center gap-2">
          Browse Products <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-black tracking-tighter mb-12">ORDER HISTORY</h1>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <motion.div 
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-6 md:p-8">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order ID</p>
                  <p className="font-mono text-sm text-gray-600">#{order.id.toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Date Placed</p>
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="text-xs font-black uppercase tracking-widest">{order.status}</span>
                </div>
              </div>

              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-sm font-bold text-gray-900">{item.name}</h4>
                      <p className="text-xs text-gray-500">Qty: {item.quantity} × ${item.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-gray-900">${(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {(order.carrier || order.trackingNumber || order.estimatedDelivery) && (
                <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-wrap gap-8">
                  {order.carrier && (
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Carrier</p>
                      <p className="text-sm font-bold text-gray-900 uppercase">{order.carrier}</p>
                    </div>
                  )}
                  {order.trackingNumber && (
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tracking Number</p>
                      <p className="text-sm font-mono text-emerald-600 font-bold">{order.trackingNumber}</p>
                    </div>
                  )}
                  {order.estimatedDelivery && (
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Est. Delivery</p>
                      <p className="text-sm font-bold text-gray-900">
                        {new Date(order.estimatedDelivery).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 pt-8 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <div className="mb-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Shipping To</p>
                    <p className="text-xs font-bold text-gray-900">{order.customerName}</p>
                    <p className="text-[10px] text-gray-500">{order.shippingAddress?.street}</p>
                    <p className="text-[10px] text-gray-500">{order.mobileNumber}</p>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-bold">${order.subtotal?.toLocaleString() || '0'}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-xs text-emerald-600">
                      <span>Discount</span>
                      <span className="font-bold">-${order.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Shipping</span>
                    <span className="font-bold">${order.shipping?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Tax (5%)</span>
                    <span className="font-bold">${order.tax?.toLocaleString() || '0'}</span>
                  </div>
                </div>

                <div className="flex flex-col justify-end items-end">
                  <div className="text-right mb-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment Status</p>
                    <p className={`text-xs font-bold uppercase tracking-widest ${order.paymentStatus === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {order.paymentStatus}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                    <p className="text-2xl font-black text-black">${order.total.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
