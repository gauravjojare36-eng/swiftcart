import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, Category } from '../types';
import { Plus, Trash2, Edit2, Package, Layers, BarChart3, Users, Settings, ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'orders' | 'coupons'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '', description: '', price: 0, category: '', stock: 10, images: ['https://picsum.photos/seed/product/800/800']
  });
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', icon: 'Package', image: 'https://picsum.photos/seed/category/800/800' });
  const [newCoupon, setNewCoupon] = useState({
    code: '', type: 'percentage', value: 0, minPurchase: 0, expiryDate: '', isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const pSnap = await getDocs(collection(db, 'products'));
    const cSnap = await getDocs(collection(db, 'categories'));
    const coSnap = await getDocs(collection(db, 'coupons'));
    const oSnap = await getDocs(collection(db, 'orders'));
    setProducts(pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    setCategories(cSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    setCoupons(coSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setOrders(oSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'coupons'), {
        ...newCoupon,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setNewCoupon({ code: '', type: 'percentage', value: 0, minPurchase: 0, expiryDate: '', isActive: true });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'products'), {
        ...newProduct,
        rating: 5,
        reviewsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setNewProduct({ name: '', description: '', price: 0, category: '', stock: 10, images: ['https://picsum.photos/seed/product/800/800'] });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'categories'), newCategory);
      setNewCategory({ name: '', slug: '', icon: 'Package', image: 'https://picsum.photos/seed/category/800/800' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (coll: string, id: string) => {
    if (window.confirm('Are you sure?')) {
      await deleteDoc(doc(db, coll, id));
      fetchData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-2">
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'products' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Package className="w-5 h-5" /> Products
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'categories' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Layers className="w-5 h-5" /> Categories
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'orders' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <ShoppingCart className="w-5 h-5" /> Orders
          </button>
          <button 
            onClick={() => setActiveTab('coupons')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'coupons' ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Settings className="w-5 h-5" /> Coupons
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100">
            <BarChart3 className="w-5 h-5" /> Analytics
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100">
            <Users className="w-5 h-5" /> Customers
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow space-y-8">
          {activeTab === 'products' && (
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-black tracking-tighter mb-6">ADD NEW PRODUCT</h2>
                <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" placeholder="Product Name" required
                    value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    className="bg-gray-50 border-none rounded-xl px-4 py-3 text-sm"
                  />
                  <input 
                    type="number" placeholder="Price" required
                    value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                    className="bg-gray-50 border-none rounded-xl px-4 py-3 text-sm"
                  />
                  <select 
                    required value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                    className="bg-gray-50 border-none rounded-xl px-4 py-3 text-sm"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                  <input 
                    type="number" placeholder="Stock" required
                    value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                    className="bg-gray-50 border-none rounded-xl px-4 py-3 text-sm"
                  />
                  <input 
                    type="text" placeholder="Image URL" required
                    value={newProduct.images?.[0]} onChange={e => setNewProduct({...newProduct, images: [e.target.value]})}
                    className="bg-gray-50 border-none rounded-xl px-4 py-3 text-sm md:col-span-2"
                  />
                  <textarea 
                    placeholder="Description" className="bg-gray-50 border-none rounded-xl px-4 py-3 text-sm md:col-span-2"
                    value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  />
                  <button type="submit" className="bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all md:col-span-2">
                    Create Product
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-black tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Image</th>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Stock</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <img src={p.images[0]} alt="" className="w-10 h-10 object-cover rounded-lg" referrerPolicy="no-referrer" />
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">{p.name}</td>
                        <td className="px-6 py-4 text-gray-500">{p.category}</td>
                        <td className="px-6 py-4 font-bold">${p.price}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${p.stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {p.stock} in stock
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button className="p-2 text-gray-400 hover:text-black transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete('products', p.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-black tracking-tighter mb-6">ADD NEW CATEGORY</h2>
                <form onSubmit={handleAddCategory} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" placeholder="Category Name" required
                    value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
                    className="bg-gray-50 border-none rounded-xl px-4 py-3 text-sm"
                  />
                  <input 
                    type="text" placeholder="Image URL" required
                    value={newCategory.image} onChange={e => setNewCategory({...newCategory, image: e.target.value})}
                    className="bg-gray-50 border-none rounded-xl px-4 py-3 text-sm"
                  />
                  <button type="submit" className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all md:col-span-2">
                    Add Category
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map(c => (
                  <div key={c.id} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-4">
                    <img src={c.image} alt="" className="w-12 h-12 object-cover rounded-xl" referrerPolicy="no-referrer" />
                    <div className="flex-grow">
                      <span className="font-bold text-gray-900 uppercase tracking-tight">{c.name}</span>
                    </div>
                    <button onClick={() => handleDelete('categories', c.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-8">
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-black tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Items</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4">Status & Tracking</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map(o => (
                      <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-[10px] text-gray-500">{o.id}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900">{o.customerName || 'N/A'}</span>
                            <span className="text-[10px] text-gray-500">{o.mobileNumber || 'No Mobile'}</span>
                            <span className="text-[10px] text-gray-400 line-clamp-1 max-w-[150px]">{o.shippingAddress?.street || 'No Address'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{o.items.length} items</td>
                        <td className="px-6 py-4 font-bold">${o.total.toLocaleString()}</td>
                        <td className="px-6 py-4 space-y-2">
                          <select 
                            value={o.status}
                            onChange={async (e) => {
                              await updateDoc(doc(db, 'orders', o.id), { status: e.target.value });
                              fetchData();
                            }}
                            className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border-none bg-gray-100 w-full`}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          
                          {(o.status === 'shipped' || o.status === 'delivered') && (
                            <div className="grid grid-cols-1 gap-1">
                              <input 
                                type="text" 
                                placeholder="Carrier"
                                defaultValue={o.carrier}
                                onBlur={async (e) => {
                                  await updateDoc(doc(db, 'orders', o.id), { carrier: e.target.value });
                                  fetchData();
                                }}
                                className="text-[10px] px-2 py-1 rounded bg-gray-50 border-none w-full"
                              />
                              <input 
                                type="text" 
                                placeholder="Tracking #"
                                defaultValue={o.trackingNumber}
                                onBlur={async (e) => {
                                  await updateDoc(doc(db, 'orders', o.id), { trackingNumber: e.target.value });
                                  fetchData();
                                }}
                                className="text-[10px] px-2 py-1 rounded bg-gray-50 border-none w-full"
                              />
                              <input 
                                type="date" 
                                defaultValue={o.estimatedDelivery}
                                onChange={async (e) => {
                                  await updateDoc(doc(db, 'orders', o.id), { estimatedDelivery: e.target.value });
                                  fetchData();
                                }}
                                className="text-[10px] px-2 py-1 rounded bg-gray-50 border-none w-full"
                              />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDelete('orders', o.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'coupons' && (
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-black tracking-tighter mb-6">ADD NEW COUPON</h2>
                <form onSubmit={handleAddCoupon} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input 
                    type="text" placeholder="Coupon Code (e.g. SAVE10)" required
                    value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                    className="bg-gray-50 border-none rounded-xl px-4 py-3 text-sm"
                  />
                  <select 
                    required value={newCoupon.type} onChange={e => setNewCoupon({...newCoupon, type: e.target.value as any})}
                    className="bg-gray-50 border-none rounded-xl px-4 py-3 text-sm"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                  <input 
                    type="number" placeholder="Value" required
                    value={newCoupon.value} onChange={e => setNewCoupon({...newCoupon, value: Number(e.target.value)})}
                    className="bg-gray-50 border-none rounded-xl px-4 py-3 text-sm"
                  />
                  <input 
                    type="number" placeholder="Min Purchase"
                    value={newCoupon.minPurchase} onChange={e => setNewCoupon({...newCoupon, minPurchase: Number(e.target.value)})}
                    className="bg-gray-50 border-none rounded-xl px-4 py-3 text-sm"
                  />
                  <input 
                    type="date" required
                    value={newCoupon.expiryDate} onChange={e => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
                    className="bg-gray-50 border-none rounded-xl px-4 py-3 text-sm"
                  />
                  <button type="submit" className="bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all">
                    Create Coupon
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-black tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Code</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Value</th>
                      <th className="px-6 py-4">Usage</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {coupons.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900">{c.code}</td>
                        <td className="px-6 py-4 text-gray-500 uppercase text-[10px]">{c.type}</td>
                        <td className="px-6 py-4 font-bold">{c.type === 'percentage' ? `${c.value}%` : `$${c.value}`}</td>
                        <td className="px-6 py-4 text-gray-500">{c.usageCount} used</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDelete('coupons', c.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
