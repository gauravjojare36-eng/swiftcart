import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Category } from '../types';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cSnap = await getDocs(collection(db, 'categories'));
        setCategories(cSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-16">
        <span className="text-emerald-500 text-xs font-bold uppercase tracking-widest">Browse</span>
        <h1 className="text-5xl font-black tracking-tighter text-gray-900 mt-2 uppercase">SHOP BY <br /><span className="text-emerald-500">CATEGORY.</span></h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link to={`/category/${cat.slug}`} className="group relative aspect-[4/5] overflow-hidden rounded-[3rem] bg-gray-100 block">
              <img 
                src={cat.image || `https://picsum.photos/seed/${cat.slug}/800/1000`} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                alt={cat.name}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-10">
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">{cat.name}</h3>
                <p className="text-sm text-white/60 mb-6 max-w-xs">Explore our curated collection of premium {cat.name.toLowerCase()} products.</p>
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-widest group-hover:gap-4 transition-all">
                  Browse Collection <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[3rem] border border-gray-100">
          <h3 className="text-2xl font-black text-gray-300 uppercase tracking-widest">No categories found</h3>
          <p className="text-gray-400 mt-2">Check back later for new collections.</p>
        </div>
      )}
    </div>
  );
};

e
