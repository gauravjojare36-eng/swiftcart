import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const pSnap = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
        const cSnap = await getDocs(collection(db, 'categories'));
        setProducts(pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
        setCategories(cSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-gray-900 uppercase leading-none">EXPLORE ALL <br /><span className="text-emerald-500">PRODUCTS.</span></h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl px-12 py-3.5 text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 bg-white border border-gray-100 px-6 py-3.5 rounded-2xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all">
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-12">
        <button 
          onClick={() => setSelectedCategory('All')}
          className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${selectedCategory === 'All' ? 'bg-black text-white' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-100'}`}
        >
          All
        </button>
        {categories.map(cat => (
          <button 
            key={cat.id}
            onClick={() => setSelectedCategory(cat.name)}
            className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${selectedCategory === cat.name ? 'bg-black text-white' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-100'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-2xl font-bold text-gray-400 uppercase tracking-widest">No products found</h3>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;
