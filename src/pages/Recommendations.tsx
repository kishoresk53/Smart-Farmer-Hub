import React, { useState } from 'react';
import { getFarmingRecommendations } from '../services/geminiService';
import { motion } from 'motion/react';
import { Leaf, Sprout, Droplets, FlaskConical, Stethoscope, ChevronRight } from 'lucide-react';

export default function Recommendations() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    country: 'India',
    state: '',
    district: '',
    soilType: 'Alluvial',
    landSize: 5,
    season: 'Summer'
  });

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const data = await getFarmingRecommendations(formData);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Failed to get recommendations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Leaf className="w-8 h-8 text-green-600" />
          Smart Recommendation System
        </h1>
        <p className="text-stone-500">Get AI-powered advice based on your land and climate</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-stone-100 h-fit space-y-6">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Sprout className="w-5 h-5 text-green-600" /> Land Details
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-500 uppercase">Soil Type</label>
              <select 
                value={formData.soilType}
                onChange={e => setFormData({...formData, soilType: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-green-500"
              >
                <option>Alluvial</option>
                <option>Black Soil</option>
                <option>Red Soil</option>
                <option>Laterite</option>
                <option>Desert</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-500 uppercase">Land Size (Acres)</label>
              <input 
                type="number"
                value={formData.landSize}
                onChange={e => setFormData({...formData, landSize: Number(e.target.value)})}
                className="w-full px-4 py-2 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-500 uppercase">Current Season</label>
              <select 
                value={formData.season}
                onChange={e => setFormData({...formData, season: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-green-500"
              >
                <option>Summer</option>
                <option>Monsoon</option>
                <option>Winter</option>
                <option>Spring</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-500 uppercase">District</label>
              <input 
                type="text"
                placeholder="Enter your district"
                value={formData.district}
                onChange={e => setFormData({...formData, district: e.target.value})}
                className="w-full px-4 py-2 rounded-xl border border-stone-200 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <button
            onClick={fetchRecommendations}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2"
          >
            {loading ? "Generating..." : "Get Recommendations"}
          </button>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {result ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
                <h3 className="font-bold text-green-700 mb-4 flex items-center gap-2">
                  <Leaf className="w-5 h-5" /> Suggested Crops
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.crops?.map((c: string) => (
                    <span key={c} className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">{c}</span>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
                <h3 className="font-bold text-blue-700 mb-4 flex items-center gap-2">
                  <Droplets className="w-5 h-5" /> Livestock Options
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.livestock?.map((l: string) => (
                    <span key={l} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">{l}</span>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="md:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
                <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-amber-500" /> Farming Strategies
                </h3>
                <div className="space-y-3">
                  {result.strategies?.map((s: string, i: number) => (
                    <div key={i} className="flex gap-3 text-sm text-stone-600 bg-stone-50 p-4 rounded-2xl">
                      <ChevronRight className="w-4 h-4 text-green-600 shrink-0" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="md:col-span-2 bg-green-50 p-6 rounded-3xl border border-green-100">
                <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" /> Guidance & Care
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-green-600 uppercase">Fertilizers</h4>
                    <p className="text-xs text-stone-600">{result.guidance?.fertilizers?.[0]}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-green-600 uppercase">Water Levels</h4>
                    <p className="text-xs text-stone-600">{result.guidance?.water?.[0]}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-green-600 uppercase">Medicines</h4>
                    <p className="text-xs text-stone-600">{result.guidance?.medicine?.[0]}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-stone-50 rounded-3xl border border-dashed border-stone-200 p-12 text-center">
              <Sprout className="w-16 h-16 text-stone-200 mb-4" />
              <h3 className="font-bold text-stone-400">No Recommendations Yet</h3>
              <p className="text-stone-400 text-sm">Fill in your land details and click the button to get AI-powered farming advice.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
