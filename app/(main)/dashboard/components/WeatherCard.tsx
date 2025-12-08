"use client";

import { useEffect, useState } from "react";
import { CloudRain, Sun, Cloud, CloudSun } from "lucide-react";

type WeatherData = {
  weather_code: number;
  temperature_2m: number;
  wind_speed_10m: number;
  pressure_msl: number;
  relative_humidity_2m: number;
};

export default function WeatherCard({ geoAllowed }: { geoAllowed: boolean }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [locationName, setLocationName] = useState("Loading location…");
  const [loading, setLoading] = useState(true);

  const fallbackLat = -7.9824;
  const fallbackLon = 112.6304;

  function getIcon(code: number) {
    if (code === 0) return <Sun size={28} className="text-yellow-500" />;
    if ([1, 2].includes(code))
      return <CloudSun size={28} className="text-yellow-500" />;
    if (code >= 3 && code <= 48)
      return <Cloud size={28} className="text-slate-500" />;
    return <CloudRain size={28} className="text-blue-500" />;
  }

  function getBackgroundImage(code: number, hour: number) {
    const isNight = hour >= 18 || hour < 6;

    if (isNight) {
      if (code === 0) return "clear-night.png";
      if (code >= 1 && code <= 3) return "cloudy.png";
      if (code >= 45 && code <= 48) return "gloomy.png";
      if (code >= 51 && code <= 67) return "rain.png";
      if (code >= 80 && code <= 99) return "storm.png";
      return "clear-night.png";
    }

    if (hour >= 5 && hour < 7) return "sunrise.png";
    if (hour >= 17 && hour < 18) return "sunset.png";

    if (code === 0) return "sunny.png";
    if (code >= 1 && code <= 3) return "cloudy.png";
    if (code >= 45 && code <= 48) return "gloomy.png";
    if (code >= 51 && code <= 67) return "rain.png";
    if (code >= 80 && code <= 99) return "storm.png";

    return "windy.png";
  }

  useEffect(() => {
    if (!geoAllowed) return;

    async function fetchWeather() {
      setLoading(true);

      try {
        let lat = fallbackLat;
        let lon = fallbackLon;

        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              lat = pos.coords.latitude;
              lon = pos.coords.longitude;
              resolve();
            },
            () => resolve(),
            { timeout: 3000 }
          );
        });

        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
        );
        const geoData = await geoRes.json();
        const addr = geoData.address;

        const kelurahan =
          addr.neighbourhood ||
          addr.hamlet ||
          addr.village ||
          addr.suburb ||
          null;

        const kecamatan =
          addr.city_district || addr.district || addr.suburb || null;

        const kota =
          addr.city ||
          addr.town ||
          addr.county ||
          addr.state_district ||
          addr.state ||
          addr.country ||
          "Unknown";

        let finalLocation = kota;
        if (kelurahan && kecamatan)
          finalLocation = `${kelurahan}, ${kecamatan} — ${kota}`;
        else if (kelurahan) finalLocation = `${kelurahan} — ${kota}`;
        else if (kecamatan) finalLocation = `${kecamatan} — ${kota}`;

        setLocationName(finalLocation);

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,pressure_msl`;
        const res = await fetch(url);
        const data = await res.json();

        setWeather(data.current);
      } catch (err) {
        console.error("Weather fetch error:", err);
      }

      setLoading(false);
    }

    // FETCH langsung pertama kali
    fetchWeather();

    // INTERVAL real-time (setiap 1 menit)
    const interval = setInterval(fetchWeather, 60_000);

    return () => clearInterval(interval);
  }, [geoAllowed]);

  if (!geoAllowed) {
    return (
      <div className="rounded-2xl bg-yellow-100 p-5 shadow-sm text-center">
        Waiting for location permission…
      </div>
    );
  }

  if (loading || !weather) {
    return (
      <div className="rounded-2xl bg-yellow-100 p-5 shadow-sm text-center">
        Loading weather…
      </div>
    );
  }

  const hour = new Date().getHours();
  const bgImage = getBackgroundImage(weather.weather_code, hour);

  return (
    <div className="relative overflow-hidden rounded-2xl p-5 min-h-[20rem] shadow-sm">
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <img
          src={`/assets/images/dashboard/${bgImage}`}
          className="w-full h-full object-cover opacity-80"
        />
      </div>

      {/* CONTENT */}
      <div className="relative z-10">
        <p className="text-sm font-medium text-slate-700 mb-1">
          📍 {locationName}
        </p>

        <div className="flex items-start justify-between mb-6">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
            {getIcon(weather.weather_code)}
          </div>

          <h2 className="text-4xl font-bold text-slate-800">
            {Math.round(weather.temperature_2m)}°C
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm font-medium text-slate-700">
          <div>
            <p className="text-xs text-slate-500">Wind</p>
            <p className="font-bold">{weather.wind_speed_10m} km/h</p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Pressure</p>
            <p className="font-bold">{Math.round(weather.pressure_msl)} mb</p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Humidity</p>
            <p className="font-bold">{weather.relative_humidity_2m}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
