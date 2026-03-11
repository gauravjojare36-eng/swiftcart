import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CategoryProducts: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // First find the category name from slug if needed, but here we assume slug is unique
        const q = query(collection(db, 'products'), where('category', '==', slug?.charAt(0).toUpperCase() + slug?.slice(1)), orderBy('createdAt', 'desc'));
        // Note: This is a simple mapping, in a real app you'd fetch the category doc first
        const pSnap = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
        const allProducts = pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(allProducts.filter(p => p.category.toLowerCase() === slug?.toLowerCase()));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [slug]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => navigate('/categories')} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-black mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> ALL CATEGORIES
      </button>

      <div className="mb-12">
        <h1 className="text-5xl font-black tracking-tighter text-gray-900 uppercase leading-none">
          {slug?.replace(/-/g, ' ')} <br /><span className="text-emerald-500">COLLECTION.</span>
        </h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-gray-100">
              <h3 className="text-2xl font-black text-gray-300 uppercase tracking-widest">No products in this category</h3>
              <p className="text-gray-400 mt-2">Check back later for new arrivals.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CategoryProducts;
