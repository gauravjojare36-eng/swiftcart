import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import { motion } from 'motion/react';
import { ArrowRight, Zap, Shield, Truck, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pSnap = await getDocs(query(collection(db, 'products'), limit(8), orderBy('createdAt', 'desc')));
        const cSnap = await getDocs(collection(db, 'categories'));
        
        setProducts(pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
        setCategories(cSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center overflow-hidden bg-black">
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1920" 
            className="w-full h-full object-cover"
            alt="Hero background"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="inline-block bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-6">
              New Season Collection
            </span>
            <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8">
              STYLE THAT <br />
              <span className="text-emerald-500 italic">SPEAKS.</span>
            </h1>
            <p className="text-lg text-gray-300 mb-10 max-w-lg leading-relaxed">
              Discover our curated collection of premium products designed for the modern lifestyle. Quality meets elegance.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-emerald-500 hover:text-white transition-all duration-300 flex items-center gap-2 group">
                Shop Collection <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/categories" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-full font-bold hover:bg-white/20 transition-all duration-300">
                Browse Categories
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: Zap, title: "Fast Delivery", desc: "Same day shipping on orders over $100" },
            { icon: Shield, title: "Secure Payment", desc: "100% secure payment processing" },
            { icon: Truck, title: "Free Shipping", desc: "Free shipping on all domestic orders" },
            { icon: RefreshCw, title: "Easy Returns", desc: "30-day hassle-free return policy" }
          ].map((feature, i) => (
            <div key={i} className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:shadow-emerald-500/5 transition-all">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                <feature.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <span className="text-emerald-500 text-xs font-bold uppercase tracking-widest">Explore</span>
            <h2 className="text-4xl font-black tracking-tighter text-gray-900 mt-2">SHOP BY CATEGORY</h2>
          </div>
          <Link to="/categories" className="text-sm font-bold text-gray-400 hover:text-black transition-colors flex items-center gap-2">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.slice(0, 4).map((cat, i) => (
            <Link key={cat.id} to={`/category/${cat.slug}`} className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-gray-100">
              <img 
                src={cat.image || `https://picsum.photos/seed/${cat.slug}/600/800`} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                alt={cat.name}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">{cat.name}</h3>
                <p className="text-xs text-white/60 mt-1 group-hover:text-emerald-400 transition-colors">Browse Collection</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <span className="text-emerald-500 text-xs font-bold uppercase tracking-widest">Trending Now</span>
            <h2 className="text-4xl font-black tracking-tighter text-gray-900 mt-2">FEATURED PRODUCTS</h2>
          </div>
          <Link to="/products" className="text-sm font-bold text-gray-400 hover:text-black transition-colors flex items-center gap-2">
            Shop All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-500 rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
            <Zap className="w-full h-full" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none mb-8">
              JOIN THE CLUB & <br />GET 20% OFF
            </h2>
            <p className="text-emerald-100 text-lg mb-10">
              Sign up for our newsletter and receive an exclusive discount on your first order. Plus, early access to new drops.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-white/20 border-white/30 text-white placeholder:text-emerald-100 rounded-full px-8 py-4 flex-grow focus:ring-2 focus:ring-white/50 outline-none"
              />
              <button className="bg-white text-emerald-600 px-10 py-4 rounded-full font-bold hover:bg-black hover:text-white transition-all duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
