import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { motion } from 'motion/react';
import { CloudSun, Wind, Droplets, Thermometer, Calendar, Navigation } from 'lucide-react';

export default function Weather() {
  const { profile } = useAuth();
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Geolocation denied or error:", error);
          // Fallback to profile location if available
          if (profile?.location?.lat) {
            setCoords(profile.location);
          }
        }
      );
    }
  }, [profile]);

  useEffect(() => {
    // Mocking weather data
    const mockWeather = {
      temp: 32,
      humidity: 65,
      wind: 12,
      rain: 10,
      condition: 'Partly Cloudy',
      forecast: [
        { day: 'Tomorrow', temp: 33, condition: 'Sunny' },
        { day: 'Sat', temp: 31, condition: 'Rainy' },
        { day: 'Sun', temp: 30, condition: 'Cloudy' },
        { day: 'Mon', temp: 32, condition: 'Sunny' },
      ]
    };

    const fetchWeather = async () => {
      setLoading(true);
      // In a real app, we would fetch from OpenWeatherMap:
      // const url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lng}&appid=YOUR_API_KEY`;
      
      setTimeout(() => {
        setWeather(mockWeather);
        setLoading(false);
      }, 1000);
    };

    fetchWeather();
  }, [coords]);

  if (loading) return <div className="text-center py-20">Loading weather data...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CloudSun className="w-8 h-8 text-amber-500" />
            Weather Forecast
          </h1>
          <div className="flex items-center gap-2 text-stone-500">
            <p>Real-time updates for {profile?.district || 'your location'}</p>
            {coords && (
              <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Navigation className="w-2 h-2" />
                GPS Active
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-stone-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="md:col-span-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden"
        >
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <h2 className="text-6xl font-bold mb-2">{weather.temp}°C</h2>
              <p className="text-xl opacity-90">{weather.condition}</p>
            </div>
            <CloudSun className="w-32 h-32 opacity-20 absolute -right-4 -top-4" />
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-12 relative z-10">
            <div className="bg-white/10 backdrop-blur p-4 rounded-2xl flex flex-col items-center">
              <Droplets className="w-5 h-5 mb-2" />
              <span className="text-xs opacity-70">Humidity</span>
              <span className="font-bold">{weather.humidity}%</span>
            </div>
            <div className="bg-white/10 backdrop-blur p-4 rounded-2xl flex flex-col items-center">
              <Wind className="w-5 h-5 mb-2" />
              <span className="text-xs opacity-70">Wind</span>
              <span className="font-bold">{weather.wind} km/h</span>
            </div>
            <div className="bg-white/10 backdrop-blur p-4 rounded-2xl flex flex-col items-center">
              <Droplets className="w-5 h-5 mb-2" />
              <span className="text-xs opacity-70">Rain</span>
              <span className="font-bold">{weather.rain}%</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 border border-stone-100 shadow-lg"
        >
          <h3 className="font-bold mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" /> 4-Day Forecast
          </h3>
          <div className="space-y-6">
            {weather.forecast.map((f: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-stone-500 font-medium w-20">{f.day}</span>
                <div className="flex items-center gap-2">
                  <CloudSun className="w-5 h-5 text-amber-500" />
                  <span className="text-xs text-stone-400">{f.condition}</span>
                </div>
                <span className="font-bold">{f.temp}°C</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex gap-4 items-start">
        <div className="bg-amber-100 p-3 rounded-2xl">
          <Thermometer className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h4 className="font-bold text-amber-900">Farming Alert</h4>
          <p className="text-amber-800 text-sm">High temperature expected tomorrow. Ensure adequate irrigation for your crops and provide extra water for livestock.</p>
        </div>
      </div>
    </div>
  );
}
