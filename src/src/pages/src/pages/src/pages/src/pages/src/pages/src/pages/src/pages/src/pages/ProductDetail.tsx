import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Star, ShoppingCart, Heart, Shield, Truck, RefreshCw, ArrowLeft, Plus, Minus } from 'lucide-react';
import { motion } from 'motion/react';
import ProductCard from '../components/ProductCard';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docSnap = await getDoc(doc(db, 'products', id));
        if (docSnap.exists()) {
          const pData = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(pData);
          
          // Fetch related
          const q = query(collection(db, 'products'), where('category', '==', pData.category), limit(4));
          const rSnap = await getDocs(q);
          setRelatedProducts(rSnap.docs.filter(d => d.id !== id).map(d => ({ id: d.id, ...d.data() } as Product)));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="h-screen flex items-center justify-center">Product not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-black mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> BACK
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
        {/* Image Gallery */}
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-square rounded-[3rem] overflow-hidden bg-gray-50 border border-gray-100"
          >
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </motion.div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img, i) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 cursor-pointer hover:opacity-80 transition-opacity">
                <img src={img} alt={`${product.name} ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-yellow-400">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-bold text-gray-900">{product.rating}</span>
              <span className="text-xs text-gray-400">({product.reviewsCount} reviews)</span>
            </div>
          </div>

          <h1 className="text-5xl font-black tracking-tighter text-gray-900 mb-4 leading-none uppercase">{product.name}</h1>
          <p className="text-3xl font-black text-emerald-500 mb-8">${product.price.toLocaleString()}</p>
          
          <p className="text-gray-500 leading-relaxed mb-10 text-lg">
            {product.description || "Experience the perfect blend of style and functionality with our premium selection. Crafted with attention to detail and quality materials."}
          </p>

          <div className="flex items-center gap-6 mb-10">
            <div className="flex items-center gap-4 bg-gray-50 rounded-2xl px-6 py-3 border border-gray-100">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1 hover:text-emerald-600"><Minus className="w-5 h-5" /></button>
              <span className="text-lg font-black w-8 text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-1 hover:text-emerald-600"><Plus className="w-5 h-5" /></button>
            </div>
            <button 
              onClick={() => addItem(product, quantity)}
              className="flex-grow bg-black text-white py-5 rounded-2xl font-bold hover:bg-emerald-500 transition-all duration-300 flex items-center justify-center gap-3 group"
            >
              <ShoppingCart className="w-5 h-5" /> ADD TO CART
            </button>
            <button className="p-5 bg-gray-50 text-gray-400 hover:text-red-500 rounded-2xl border border-gray-100 transition-all">
              <Heart className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Truck className="w-5 h-5" /></div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Free Shipping</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Shield className="w-5 h-5" /></div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Secure Payment</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><RefreshCw className="w-5 h-5" /></div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Easy Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-emerald-500 text-xs font-bold uppercase tracking-widest">You might also like</span>
              <h2 className="text-4xl font-black tracking-tighter text-gray-900 mt-2 uppercase">RELATED PRODUCTS</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
