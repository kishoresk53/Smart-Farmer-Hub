import React, { useState } from 'react';
import { detectDisease } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Upload, BrainCircuit, AlertCircle, CheckCircle2, Info } from 'lucide-react';

export default function AIAnalysis() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const base64 = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];
      const data = await detectDisease(base64, mimeType);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <BrainCircuit className="w-8 h-8 text-green-600" />
          AI Disease Detection
        </h1>
        <p className="text-stone-500">Upload a photo of your crop or livestock to detect diseases</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="aspect-video bg-white rounded-3xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center overflow-hidden relative group">
            {image ? (
              <>
                <img src={image} alt="Upload" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer bg-white px-4 py-2 rounded-full font-bold text-sm">Change Photo</label>
                </div>
              </>
            ) : (
              <div className="text-center p-8">
                <Camera className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <p className="text-stone-500 mb-4">No image selected</p>
                <label className="cursor-pointer bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors inline-flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Upload Image
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" id="change-photo" onChange={handleImageUpload} />
          </div>

          <button
            onClick={analyzeImage}
            disabled={!image || loading}
            className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <BrainCircuit className="w-5 h-5" /> Analyze Now
              </>
            )}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-8 rounded-3xl shadow-xl border border-stone-100 space-y-6"
            >
              <div className="flex items-center gap-3">
                {result.identified ? (
                  <AlertCircle className="w-8 h-8 text-amber-500" />
                ) : (
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                )}
                <div>
                  <h2 className="text-xl font-bold">{result.problem}</h2>
                  <p className="text-sm text-stone-500">Confidence: {Math.round(result.confidence * 100)}%</p>
                </div>
              </div>

              <div className="space-y-4">
                <section>
                  <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-green-600" /> Causes
                  </h3>
                  <ul className="list-disc list-inside text-stone-600 text-sm space-y-1">
                    {result.causes?.map((c: string, i: number) => <li key={i}>{c}</li>)}
                  </ul>
                </section>

                <section>
                  <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" /> Treatment Steps
                  </h3>
                  <div className="space-y-2">
                    {result.treatment?.map((t: string, i: number) => (
                      <div key={i} className="flex gap-3 text-sm text-stone-600 bg-stone-50 p-3 rounded-xl">
                        <span className="font-bold text-green-600">{i + 1}.</span>
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-green-600" /> Prevention
                  </h3>
                  <ul className="list-disc list-inside text-stone-600 text-sm space-y-1">
                    {result.prevention?.map((p: string, i: number) => <li key={i}>{p}</li>)}
                  </ul>
                </section>
              </div>
            </motion.div>
          ) : (
            <div className="bg-stone-50 rounded-3xl flex flex-col items-center justify-center p-12 text-center border border-dashed border-stone-200">
              <BrainCircuit className="w-16 h-16 text-stone-200 mb-4" />
              <h3 className="font-bold text-stone-400">Analysis Result</h3>
              <p className="text-stone-400 text-sm">Upload an image and click analyze to see AI results here.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
