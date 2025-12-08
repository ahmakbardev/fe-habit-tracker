"use client";

import { useEffect, useState } from "react";

export default function GeoPermissionGate({
  children,
}: {
  children: ((geoAllowed: boolean) => React.ReactNode) | React.ReactNode;
}) {
  const [status, setStatus] = useState<
    "loading" | "granted" | "denied" | "prompt"
  >("loading");

  const [showPopup, setShowPopup] = useState(false);

  // ---- BODY LOCK ----
  useEffect(() => {
    document.body.style.overflow = showPopup ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showPopup]);

  // ---- PERMISSION CHECK ----
  async function checkPermission() {
    try {
      if (!navigator.permissions) {
        requestGeo();
        return;
      }

      const perm = await navigator.permissions.query({ name: "geolocation" });

      if (perm.state === "granted") {
        setStatus("granted");
        setShowPopup(false);
      } else {
        setStatus(perm.state);
        setShowPopup(true);
        if (perm.state === "prompt") requestGeo();
      }

      perm.onchange = () => {
        const newState: PermissionState = perm.state;
        setStatus(newState);
        setShowPopup(newState !== "granted");
      };
    } catch {
      setStatus("prompt");
      setShowPopup(true);
      requestGeo();
    }
  }

  function requestGeo() {
    navigator.geolocation.getCurrentPosition(
      () => {
        setStatus("granted");
        setShowPopup(false);
      },
      () => {
        setStatus("denied");
        setShowPopup(true);
      }
    );
  }

  useEffect(() => {
    checkPermission();
  }, []);

  // ---- SAFE CHILD RENDERING ----
  const isFn = typeof children === "function";
  const renderedChildren = isFn ? children(status === "granted") : children;

  return (
    <>
      {renderedChildren}

      {showPopup && (
        <div className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center px-6">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full text-center border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">
              Enable Location Access
            </h2>

            <p className="text-sm text-slate-500 mb-5">
              We need your location for accurate weather, maps, and tracking.
            </p>

            <button
              onClick={requestGeo}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium active:scale-95 transition"
            >
              Allow Location
            </button>

            {status === "denied" && (
              <p className="text-xs text-red-500 mt-3">
                Location is blocked. Enable it in your browser settings.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
