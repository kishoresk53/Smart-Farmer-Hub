import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { User, Phone, MapPin, Globe, Coins, Save, Navigation } from 'lucide-react';
import { cn } from '../lib/utils';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icon in Leaflet
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

function MapEvents({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function Profile() {
  const { user, profile } = useAuth();
  const [detecting, setDetecting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'Farmer',
    country: 'India',
    state: '',
    district: '',
    language: 'English',
    currency: 'INR',
    location: { lat: 0, lng: 0 }
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        role: profile.role || 'Farmer',
        country: profile.country || 'India',
        state: profile.state || '',
        district: profile.district || '',
        language: profile.language || 'English',
        currency: profile.currency || 'INR',
        location: profile.location || { lat: 0, lng: 0 }
      });
    } else if (user) {
      setFormData(prev => ({ ...prev, name: user.displayName || '' }));
    }
  }, [profile, user]);

  const detectLocation = () => {
    setDetecting(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
          setDetecting(false);
          alert("GPS Location detected successfully!");
        },
        (error) => {
          console.error("Error detecting location:", error);
          setDetecting(false);
          alert("Failed to detect location. Please ensure GPS is enabled.");
        }
      );
    } else {
      setDetecting(false);
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...formData,
        uid: user.uid,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      alert("Profile updated successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white p-8 rounded-3xl shadow-lg border border-stone-100"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <User className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">User Profile</h1>
            <p className="text-stone-500">Manage your account and preferences</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                <User className="w-4 h-4" /> Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                <Phone className="w-4 h-4" /> Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-stone-700">I am a...</label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 outline-none transition-all"
              >
                <option value="Farmer">Farmer</option>
                <option value="Buyer">Buyer</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                <Globe className="w-4 h-4" /> Language
              </label>
              <select
                value={formData.language}
                onChange={e => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 outline-none transition-all"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Tamil">Tamil</option>
                <option value="Telugu">Telugu</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" /> Location Details
              </h3>
              <button
                type="button"
                onClick={detectLocation}
                disabled={detecting}
                className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 hover:bg-green-100 transition-colors"
              >
                <Navigation className={cn("w-3 h-3", detecting && "animate-pulse")} />
                {detecting ? "Detecting..." : "Detect My GPS"}
              </button>
            </div>
            {formData.location.lat !== 0 && (
              <p className="text-[10px] text-stone-400">
                GPS: {formData.location.lat.toFixed(4)}, {formData.location.lng.toFixed(4)}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                placeholder="Country"
                value={formData.country}
                onChange={e => setFormData({ ...formData, country: e.target.value })}
                className="px-4 py-3 rounded-xl border border-stone-200 outline-none"
              />
              <input
                placeholder="State"
                value={formData.state}
                onChange={e => setFormData({ ...formData, state: e.target.value })}
                className="px-4 py-3 rounded-xl border border-stone-200 outline-none"
              />
              <input
                placeholder="District"
                value={formData.district}
                onChange={e => setFormData({ ...formData, district: e.target.value })}
                className="px-4 py-3 rounded-xl border border-stone-200 outline-none"
              />
            </div>

            {/* Interactive Map */}
            <div className="h-64 w-full rounded-2xl overflow-hidden border border-stone-200 z-0">
              <MapContainer 
                center={[formData.location.lat || 20.5937, formData.location.lng || 78.9629]} 
                zoom={formData.location.lat !== 0 ? 13 : 4} 
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapEvents onLocationSelect={(lat, lng) => setFormData(prev => ({ ...prev, location: { lat, lng } }))} />
                {formData.location.lat !== 0 && (
                  <>
                    <Marker position={[formData.location.lat, formData.location.lng]} />
                    <ChangeView center={[formData.location.lat, formData.location.lng]} />
                  </>
                )}
              </MapContainer>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
              <Coins className="w-4 h-4" /> Preferred Currency
            </label>
            <select
              value={formData.currency}
              onChange={e => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 outline-none transition-all"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-100"
          >
            <Save className="w-5 h-5" /> Save Profile
          </button>
        </form>
      </motion.div>
    </div>
  );
}
