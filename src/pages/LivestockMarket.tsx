import React, { useState, useEffect, useRef } from 'react';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { collection, onSnapshot, query, orderBy, addDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Dog, Search, MapPin, Phone, Tag, Info, Plus, X, Camera, Upload, Trash2 } from 'lucide-react';
import { formatCurrency, cn, compressImage } from '../lib/utils';
import { useAuth } from '../AuthContext';
import { deleteDoc, doc } from 'firebase/firestore';

export default function LivestockMarket() {
  const { user, profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [animals, setAnimals] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [formData, setFormData] = useState({
    type: '',
    price: '',
    description: '',
    address: '',
    phone: '',
    image: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        phone: profile.phone || '',
        address: profile.district ? `${profile.district}, ${profile.state}` : ''
      }));
    }
  }, [profile]);

  useEffect(() => {
    const q = query(collection(db, 'livestock'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAnimals(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'livestock');
    });

    return () => unsubscribe();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4718592) { // 4.5MB limit
        setNotification({ type: 'error', message: 'Image is too large. Please select a photo under 4.5MB.' });
        setTimeout(() => setNotification(null), 3000);
        return;
      }
      
      try {
        setNotification({ type: 'success', message: 'Processing image...' });
        const compressed = await compressImage(file);
        setFormData({ ...formData, image: compressed });
        setNotification(null);
      } catch (error) {
        console.error("Compression error:", error);
        setNotification({ type: 'error', message: 'Failed to process image. Please try another one.' });
        setTimeout(() => setNotification(null), 3000);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setSubmitting(true);

    try {
      const price = Number(formData.price);
      if (isNaN(price) || price < 0) {
        setNotification({ type: 'error', message: 'Please enter a valid price' });
        setTimeout(() => setNotification(null), 3000);
        setSubmitting(false);
        return;
      }

      await addDoc(collection(db, 'livestock'), {
        type: formData.type,
        price: price,
        description: formData.description,
        sellerId: user.uid,
        sellerName: profile.name,
        sellerPhone: formData.phone,
        currency: profile.currency || 'INR',
        images: formData.image ? [formData.image] : [],
        location: {
          address: formData.address,
          lat: profile.location?.lat || 0,
          lng: profile.location?.lng || 0
        },
        createdAt: new Date().toISOString()
      });
      setIsModalOpen(false);
      setFormData({ ...formData, type: '', price: '', description: '', image: '' });
      setNotification({ type: 'success', message: 'Livestock listed successfully!' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error: any) {
      console.error("Error creating livestock:", error);
      let message = 'Failed to list livestock. Please try again.';
      if (error.message?.includes('quota')) message = 'Storage quota exceeded. Try a smaller image.';
      setNotification({ type: 'error', message });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (animalId: string) => {
    setDeletingId(animalId);
    try {
      await deleteDoc(doc(db, 'livestock', animalId));
      setNotification({ type: 'success', message: 'Livestock deleted successfully!' });
      setTimeout(() => setNotification(null), 3000);
      setDeleteConfirmId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `livestock/${animalId}`);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredAnimals = animals.filter(a => 
    a.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 relative">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-0 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-xl font-bold text-white ${
              notification.type === 'success' ? 'bg-blue-600' : 'bg-red-600'
            }`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Dog className="w-8 h-8 text-blue-600" />
            Livestock Marketplace
          </h1>
          <p className="text-stone-500">Buy and sell animals directly within the community</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search cows, goats, chickens..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 rounded-2xl border border-stone-200 w-full md:w-64 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {profile?.role === 'Farmer' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white p-3 md:px-6 md:py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden md:inline">Sell Livestock</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">Loading livestock...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAnimals.map((animal) => (
            <motion.div
              layout
              key={animal.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-stone-100 relative">
                {animal.images?.[0] ? (
                  <img 
                    src={animal.images[0]} 
                    alt={animal.type} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300">
                    <Dog className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                  {animal.type}
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg leading-tight">{animal.type}</h3>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-blue-600 font-bold">{formatCurrency(animal.price, animal.currency)}</span>
                    {user?.uid === animal.sellerId && (
                      <div className="flex items-center gap-1">
                        {deleteConfirmId === animal.id ? (
                          <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg">
                            <button
                              onClick={() => handleDelete(animal.id)}
                              disabled={deletingId === animal.id}
                              className="text-[10px] bg-red-600 text-white px-2 py-1 rounded-md font-bold hover:bg-red-700"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="text-[10px] bg-stone-200 text-stone-600 px-2 py-1 rounded-md font-bold hover:bg-stone-300"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(animal.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            title="Delete listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-stone-500 text-sm line-clamp-2">{animal.description}</p>
                
                <div className="pt-3 border-t border-stone-50 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <MapPin className="w-3 h-3" />
                    <span>{animal.location?.address || 'Location unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <Tag className="w-3 h-3" />
                    <span>Seller: {animal.sellerName}</span>
                  </div>
                  <a 
                    href={`tel:${animal.sellerPhone}`}
                    className="flex items-center gap-2 text-sm text-blue-600 font-bold hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{animal.sellerPhone}</span>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Sell Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 hover:bg-stone-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-stone-400" />
              </button>

              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Plus className="w-6 h-6 text-blue-600" />
                List Your Livestock
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-500 uppercase">Animal Type</label>
                  <input
                    required
                    type="text"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    placeholder="e.g. Jersey Cow, Boer Goat"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-500 uppercase">Price ({profile?.currency || 'INR'})</label>
                  <input
                    required
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-500 uppercase">Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the animal (age, health, etc.)..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-500 uppercase">Location</label>
                    <input
                      required
                      type="text"
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      placeholder="City, State"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-500 uppercase">Phone Number</label>
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Your contact number"
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-500 uppercase">Animal Photo</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-video bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center overflow-hidden relative group cursor-pointer hover:border-blue-500 transition-colors"
                  >
                    {formData.image ? (
                      <>
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="bg-white px-4 py-2 rounded-full font-bold text-sm">Change Photo</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-4">
                        <Camera className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                        <p className="text-stone-400 text-xs mb-2">Click to upload photo</p>
                        <div className="bg-stone-200 text-stone-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-stone-300 transition-colors inline-flex items-center gap-2">
                          <Upload className="w-3 h-3" /> Select File
                        </div>
                      </div>
                    )}
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload} 
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                >
                  {submitting ? "Listing Animal..." : "List Animal Now"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {filteredAnimals.length === 0 && !loading && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-200">
          <Dog className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500">No livestock found matching your search.</p>
        </div>
      )}
    </div>
  );
}
