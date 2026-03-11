import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, Coupon } from '../types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  total: number;
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  itemCount: number;
  appliedCoupon: Coupon | null;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  applyCoupon: async () => ({ success: false, message: '' }),
  removeCoupon: () => {},
  total: 0,
  subtotal: 0,
  discount: 0,
  tax: 0,
  shipping: 0,
  itemCount: 0,
  appliedCoupon: null,
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
    
    // Re-validate coupon if items change
    if (appliedCoupon && appliedCoupon.minPurchase) {
      const currentSubtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
      if (currentSubtotal < appliedCoupon.minPurchase) {
        setAppliedCoupon(null);
      }
    }
  }, [items, appliedCoupon]);

  const addItem = (product: Product, quantity: number = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i => 
          i.productId === product.id 
            ? { ...i, quantity: i.quantity + quantity } 
            : i
        );
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.images[0]
      }];
    });
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(prev => prev.map(i => 
      i.productId === productId ? { ...i, quantity } : i
    ));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = async (code: string) => {
    try {
      const q = query(collection(db, 'coupons'), where('code', '==', code.toUpperCase()), where('isActive', '==', true));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        return { success: false, message: 'Invalid or expired coupon code.' };
      }

      const coupon = { id: snap.docs[0].id, ...snap.docs[0].data() } as Coupon;
      
      // Check expiry
      if (new Date(coupon.expiryDate) < new Date()) {
        return { success: false, message: 'This coupon has expired.' };
      }

      // Check min purchase
      const currentSubtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
      if (coupon.minPurchase && currentSubtotal < coupon.minPurchase) {
        return { success: false, message: `Minimum purchase of $${coupon.minPurchase} required.` };
      }

      // Check usage limit
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return { success: false, message: 'This coupon has reached its usage limit.' };
      }

      setAppliedCoupon(coupon);
      return { success: true, message: 'Coupon applied successfully!' };
    } catch (err) {
      return { success: false, message: 'Error applying coupon.' };
    }
  };

  const removeCoupon = () => setAppliedCoupon(null);

  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);
  
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discount = subtotal * (appliedCoupon.value / 100);
    } else {
      discount = appliedCoupon.value;
    }
  }

  const finalDiscount = Math.min(discount, subtotal);
  const tax = subtotal * 0.05;
  const shipping = items.length > 0 ? 50 : 0;
  const total = Math.max(0, subtotal - finalDiscount + tax + shipping);

  return (
    <CartContext.Provider value={{ 
      items, addItem, removeItem, updateQuantity, clearCart, 
      applyCoupon, removeCoupon, total, subtotal, discount: finalDiscount, tax, shipping, itemCount, appliedCoupon 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
