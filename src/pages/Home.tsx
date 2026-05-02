import React from 'react';
import { useAuth } from '../AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ShoppingBasket, 
  Dog, 
  BrainCircuit, 
  Leaf, 
  CloudSun, 
  ArrowRight,
  TrendingUp,
  Users,
  Sprout,
  Plus
} from 'lucide-react';

export default function Home() {
  const { profile } = useAuth();

  const features = [
    { title: 'Marketplace', icon: ShoppingBasket, color: 'bg-green-500', path: '/marketplace', desc: 'Sell your crops directly' },
    { title: 'Livestock', icon: Dog, color: 'bg-blue-500', path: '/livestock', desc: 'Buy & sell animals' },
    { title: 'AI Detection', icon: BrainCircuit, color: 'bg-purple-500', path: '/ai-analysis', desc: 'Identify crop diseases' },
    { title: 'Smart Advice', icon: Leaf, color: 'bg-emerald-500', path: '/recommendations', desc: 'Crop recommendations' },
  ];

  return (
    <div className="space-y-10">
      <section className="bg-green-700 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-green-100">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Welcome back, {profile?.name || 'Farmer'}!
          </h1>
          <p className="text-green-100 text-lg mb-8 opacity-90">
            Your smart companion for better yields and direct market access. 
            Check your personalized recommendations for this season.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/recommendations" 
              className="inline-flex items-center gap-2 bg-white text-green-700 px-6 py-3 rounded-full font-bold hover:bg-green-50 transition-colors"
            >
              Get Smart Advice <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              to="/buy" 
              className="inline-flex items-center gap-2 bg-blue-600 border border-blue-500 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-500 transition-colors"
            >
              Buy Products <ShoppingBasket className="w-4 h-4" />
            </Link>
            {profile?.role === 'Farmer' && (
              <Link 
                to="/marketplace" 
                className="inline-flex items-center gap-2 bg-green-600 border border-green-500 text-white px-6 py-3 rounded-full font-bold hover:bg-green-500 transition-colors"
              >
                Sell Something <Plus className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
        <Sprout className="absolute -right-10 -bottom-10 w-64 h-64 text-white/10 rotate-12" />
      </section>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link 
              to={feature.path}
              className="group bg-white p-6 rounded-3xl border border-stone-100 shadow-sm hover:shadow-xl transition-all flex flex-col h-full"
            >
              <div className={`${feature.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg shadow-${feature.color.split('-')[1]}-100`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
              <p className="text-stone-400 text-xs mb-4 flex-grow">{feature.desc}</p>
              <div className="text-green-600 group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-5 h-5" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Market Trends
            </h2>
            <Link to="/marketplace" className="text-sm text-green-600 font-bold">View All</Link>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Wheat', price: '₹2,400/qtl', trend: '+5%' },
              { name: 'Rice', price: '₹3,100/qtl', trend: '+2%' },
              { name: 'Tomato', price: '₹40/kg', trend: '-12%' },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl">
                <span className="font-medium">{item.name}</span>
                <div className="flex items-center gap-4">
                  <span className="font-bold">{item.price}</span>
                  <span className={item.trend.startsWith('+') ? 'text-green-600 text-xs font-bold' : 'text-red-500 text-xs font-bold'}>
                    {item.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Community Updates
            </h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-stone-50 rounded-2xl">
              <p className="text-sm text-stone-600">New cooperative forming in {profile?.district || 'your area'} for organic fertilizers.</p>
              <span className="text-[10px] text-stone-400 mt-2 block">2 hours ago</span>
            </div>
            <div className="p-4 bg-stone-50 rounded-2xl">
              <p className="text-sm text-stone-600">Government subsidy announced for solar pump installations.</p>
              <span className="text-[10px] text-stone-400 mt-2 block">Yesterday</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
