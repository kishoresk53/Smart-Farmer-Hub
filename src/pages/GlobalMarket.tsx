import React, { useState, useEffect } from 'react';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBasket, Dog, Search, MapPin, Phone, Tag, Filter } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

type MarketItem = {
  id: string;
  type?: string; // for livestock
  name?: string; // for products
  category?: string;
  price: number;
  description: string;
  sellerName: string;
  sellerPhone: string;
  currency: string;
  images: string[];
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  createdAt: string;
  itemType: 'product' | 'livestock';
};

export default function GlobalMarket() {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'product' | 'livestock'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let products: MarketItem[] = [];
    let livestock: MarketItem[] = [];

    const qProducts = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const qLivestock = query(collection(db, 'livestock'), orderBy('createdAt', 'desc'));

    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
      products = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(), 
        itemType: 'product' 
      })) as MarketItem[];
      combineAndSort();
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    const unsubLivestock = onSnapshot(qLivestock, (snapshot) => {
      livestock = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(), 
        itemType: 'livestock' 
      })) as MarketItem[];
      combineAndSort();
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'livestock');
    });

    const combineAndSort = () => {
      const combined = [...products, ...livestock].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setItems(combined);
      setLoading(false);
    };

    return () => {
      unsubProducts();
      unsubLivestock();
    };
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = (item.name || item.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || item.itemType === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingBasket className="w-8 h-8 text-green-600" />
            Global Marketplace
          </h1>
          <p className="text-stone-500">Everything from crops to livestock in one place</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search anything..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 rounded-2xl border border-stone-200 w-full md:w-64 outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <div className="flex bg-stone-100 p-1 rounded-2xl">
            {(['all', 'product', 'livestock'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filter === f 
                    ? 'bg-white text-stone-900 shadow-sm' 
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}s
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">Loading global market...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-stone-100 relative">
                  {item.images?.[0] ? (
                    <img 
                      src={item.images[0]} 
                      alt={item.name || item.type} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                      {item.itemType === 'product' ? <ShoppingBasket className="w-12 h-12" /> : <Dog className="w-12 h-12" />}
                    </div>
                  )}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                    item.itemType === 'product' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                  }`}>
                    {item.itemType === 'product' ? (item.category || 'Product') : (item.type || 'Livestock')}
                  </div>
                </div>
                
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg leading-tight">{item.name || item.type}</h3>
                    <span className={`${item.itemType === 'product' ? 'text-green-600' : 'text-blue-600'} font-bold`}>
                      {formatCurrency(item.price, item.currency)}
                    </span>
                  </div>
                  <p className="text-stone-500 text-sm line-clamp-2">{item.description}</p>
                  
                  <div className="pt-3 border-t border-stone-50 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <MapPin className="w-3 h-3" />
                      <span>{item.location?.address || 'Location unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <Tag className="w-3 h-3" />
                      <span>Seller: {item.sellerName}</span>
                    </div>
                    <a 
                      href={`tel:${item.sellerPhone}`}
                      className={`flex items-center gap-2 text-sm font-bold hover:underline ${
                        item.itemType === 'product' ? 'text-green-600' : 'text-blue-600'
                      }`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{item.sellerPhone}</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {filteredItems.length === 0 && !loading && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-200">
          <Search className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500">No items found matching your search.</p>
        </div>
      )}
    </div>
  );
}
