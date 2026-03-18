"use client";

import { useEffect, useState } from "react";
import {
  CloudRain,
  Sun,
  Cloud,
  CloudSun,
  MapPin,
  ShieldAlert,
  Navigation,
  RefreshCw,
} from "lucide-react";

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
  const [geoMode, setGeoMode] = useState<"gps" | "fallback">("gps");
  const [refreshTick, setRefreshTick] = useState(0);

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

  // UI helpers
  const shimmer =
    "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.4s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent";
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _shimmerKeyframes = `
    @keyframes shimmer {
      100% { transform: translateX(100%); }
    }
  `;

  function SkeletonLine({ w = "w-full" }: { w?: string }) {
    return <div className={`${shimmer} ${w} h-3 rounded-full bg-white/50`} />;
  }

  function LoaderDots() {
    return (
      <div className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-slate-400/70 animate-bounce [animation-delay:-0.2s]" />
        <span className="h-2 w-2 rounded-full bg-slate-400/70 animate-bounce [animation-delay:-0.1s]" />
        <span className="h-2 w-2 rounded-full bg-slate-400/70 animate-bounce" />
      </div>
    );
  }

  async function resolveCoords(): Promise<{
    lat: number;
    lon: number;
    used: "gps" | "fallback";
  }> {
    let lat = fallbackLat;
    let lon = fallbackLon;

    if (geoMode === "fallback") {
      return { lat, lon, used: "fallback" };
    }

    const got = await new Promise<boolean>((resolve) => {
      if (!navigator.geolocation) return resolve(false);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          lat = pos.coords.latitude;
          lon = pos.coords.longitude;
          resolve(true);
        },
        () => resolve(false),
        { timeout: 3000 }
      );
    });

    return { lat, lon, used: got ? "gps" : "fallback" };
  }

  async function fetchWeatherOnce() {
    setLoading(true);

    try {
      const { lat, lon, used } = await resolveCoords();

      // IMPORTANT: ini aman walau dipanggil berkali-kali
      setGeoMode(used);

      // reverse geocode
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const geoData = await geoRes.json();
      const addr = geoData?.address ?? {};

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

  useEffect(() => {
    if (!geoAllowed) return;

    fetchWeatherOnce();
    const interval = setInterval(fetchWeatherOnce, 60_000);

    return () => clearInterval(interval);
    // geoMode sengaja gak masuk deps supaya gak kepancing rerun pas setGeoMode() di fetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoAllowed, refreshTick]);

  // =========================
  //  STATE: Permission Needed
  // =========================
  if (!geoAllowed) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 via-white to-slate-50" />

        <div className="relative z-10 flex items-start gap-4">
          <div className="shrink-0 w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center">
            <ShieldAlert className="text-yellow-700" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">
              Location permission needed
            </p>
            <p className="text-sm text-slate-600 mt-1">
              Biar cuaca & lokasi lebih akurat. Kalau gak mau, kamu masih bisa
              pakai lokasi default.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setRefreshTick((x) => x + 1)}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Navigation size={16} />
                Try enable location
              </button>

              <button
                onClick={() => {
                  setGeoMode("fallback");
                  setRefreshTick((x) => x + 1);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <MapPin size={16} />
                Use default location
              </button>
            </div>

            <div className="mt-3 text-xs text-slate-500">
              Tip: kalau browser sempat “blocked”, cek icon 🔒 di address bar.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  //  STATE: Loading / Skeleton
  // =========================
  if (loading || !weather) {
    return (
      <div className="relative overflow-hidden rounded-2xl p-5 min-h-[20rem] shadow-sm border border-slate-200 bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`${shimmer} w-12 h-12 rounded-2xl bg-slate-200`}
              />
              <div className="min-w-0 w-52 max-w-[70%]">
                <SkeletonLine w="w-48" />
                <div className="mt-2">
                  <SkeletonLine w="w-32" />
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className={`${shimmer} w-20 h-10 rounded-xl bg-slate-200`} />
              <div className="mt-2 flex justify-end items-center gap-2 text-xs text-slate-500">
                <RefreshCw size={14} className="animate-spin" />
                <span>Syncing</span>
                <LoaderDots />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white/60 p-3">
              <SkeletonLine w="w-16" />
              <div className="mt-2">
                <SkeletonLine w="w-20" />
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/60 p-3">
              <SkeletonLine w="w-20" />
              <div className="mt-2">
                <SkeletonLine w="w-24" />
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/60 p-3">
              <SkeletonLine w="w-16" />
              <div className="mt-2">
                <SkeletonLine w="w-14" />
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
            <span>Fetching weather data…</span>
            <button
              onClick={() => setRefreshTick((x) => x + 1)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>

        <style jsx>{`
          @keyframes shimmer {
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
      </div>
    );
  }

  // =========================
  //  NORMAL STATE
  // =========================
  // NOTE: jangan pakai useMemo di sini karena render lain return lebih awal → hook order berubah
  const hour = new Date().getHours();
  const bgImage = getBackgroundImage(weather.weather_code, hour);

  return (
    <div className="relative overflow-hidden rounded-2xl p-5 min-h-[20rem] shadow-sm">
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <img
          src={`/assets/images/dashboard/${bgImage}`}
          className="w-full h-full object-cover opacity-80"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/20 to-white/40" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-slate-700">
            📍 {locationName}
            <span className="ml-2 text-xs text-slate-500">
              ({geoMode === "gps" ? "GPS" : "Default"})
            </span>
          </p>

          <button
            onClick={() => setRefreshTick((x) => x + 1)}
            className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        <div className="flex items-start justify-between mb-6">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
            {getIcon(weather.weather_code)}
          </div>

          <h2 className="text-4xl font-bold text-slate-800">
            {Math.round(weather.temperature_2m)}°C
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm font-medium text-slate-700">
          <div className="rounded-xl bg-white/70 p-3">
            <p className="text-xs text-slate-500">Wind</p>
            <p className="font-bold">{weather.wind_speed_10m} km/h</p>
          </div>

          <div className="rounded-xl bg-white/70 p-3">
            <p className="text-xs text-slate-500">Pressure</p>
            <p className="font-bold">{Math.round(weather.pressure_msl)} mb</p>
          </div>

          <div className="rounded-xl bg-white/70 p-3">
            <p className="text-xs text-slate-500">Humidity</p>
            <p className="font-bold">{weather.relative_humidity_2m}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
