import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBasket, Dog, BrainCircuit, CloudSun, User, Leaf } from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/buy', icon: ShoppingBasket, label: 'Market' },
  { path: '/livestock', icon: Dog, label: 'Livestock' },
  { path: '/ai-analysis', icon: BrainCircuit, label: 'AI Detect' },
  { path: '/recommendations', icon: Leaf, label: 'Advise' },
  { path: '/weather', icon: CloudSun, label: 'Weather' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden md:flex items-center justify-between bg-white border-b border-stone-200 px-8 py-4 sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2 text-green-700 font-bold text-xl">
          <Leaf className="w-8 h-8" />
          <span>Smart Farmer Hub</span>
        </Link>
        <div className="flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors hover:text-green-600",
                location.pathname === item.path ? "text-green-700" : "text-stone-500"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 flex justify-around items-center py-3 px-2 z-50">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              location.pathname === item.path ? "text-green-700" : "text-stone-400"
            )}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
