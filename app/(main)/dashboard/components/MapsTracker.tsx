"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";

const LeafletWrapper = dynamic(() => import("./_LeafletWrapper"), {
  ssr: false,
});
const TileLayer = dynamic(
  () => import("./_LeafletWrapper").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("./_LeafletWrapper").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("./_LeafletWrapper").then((m) => m.Popup), {
  ssr: false,
});

export default function MapsTracker({ geoAllowed }: { geoAllowed: boolean }) {
  const [pos, setPos] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!geoAllowed) return; // ⛔ Jangan load apa pun jika user belum allow

    navigator.geolocation.getCurrentPosition(
      (loc) => setPos([loc.coords.latitude, loc.coords.longitude]),
      () => setPos([-7.9824, 112.6304]) // fallback Malang
    );
  }, [geoAllowed]);

  return (
    <div className="mt-6 p-4 bg-white rounded-2xl  border border-slate-100 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800 mb-3">
        Running Competition
      </h2>

      {/* Clip-path definition */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id="map-clip" clipPathUnits="objectBoundingBox">
            <path
              transform="scale(0.00269, 0.00383)"
              d="
                M270.423 0.5H20.5C9.42424 0.5 0.457533 9.50128 0.500132 20.5769
                L1.34629 240.577C1.38865 251.593 10.3305 260.5 21.3461 260.5
                H350.423C361.469 260.5 370.423 251.546 370.423 240.5
                V98.5C370.423 87.4543 365.727 78.5 354.681 78.5
                H334.923C294.923 78.5 288.59 46.1667 290.423 30
                V20.5C290.423 9.45431 281.469 0.5 270.423 0.5
                Z"
            />
          </clipPath>
        </defs>
      </svg>

      {/* RESPONSIVE RULES */}
      <style jsx>{`
        .map-clip {
          clip-path: url(#map-clip);
        }
      `}</style>

      <div className="relative w-full rounded-xl overflow-visible shadow-sm h-48">
        {/* MAP ONLY CLIPPED */}
        <div className="absolute inset-0 overflow-hidden map-clip z-[1]">
          {geoAllowed && pos && (
            <LeafletWrapper
              center={pos}
              zoom={15}
              scrollWheelZoom
              dragging
              doubleClickZoom
              zoomControl={false}
              className="w-full h-full"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={pos}>
                <Popup>You are here</Popup>
              </Marker>
            </LeafletWrapper>
          )}

          {/* Jika user belum allow → tampilkan placeholder */}
          {!geoAllowed && (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
              Waiting for location permission…
            </div>
          )}
        </div>

        {/* OVERLAY UI */}
        <div className="absolute left-3 top-3 z-[5] bg-white text-slate-700 text-xs font-medium px-3 py-1 rounded-full shadow">
          Your Location
        </div>

        <button className="absolute right-0 md:right-3 top-0 w-10 h-10 z-[5] rounded-full bg-orange-300 flex items-center justify-center shadow-md active:scale-95 transition">
          <ArrowUpRight size={20} className="text-white" />
        </button>
      </div>
    </div>
  );
}
