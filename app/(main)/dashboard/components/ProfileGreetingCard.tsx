"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export default function ProfileGreetingCard() {
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 11) setGreeting("Good Morning");
    else if (hour < 16) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const userName = "Akbar"; // nanti dari auth

  const workStart = "09:00 am";
  const workEnd = "05:00 pm";

  return (
    <div
      className="
        rounded-2xl 
        bg-white 
        p-5 
        shadow-sm 
        border border-slate-100 
        flex flex-col gap-4
      "
    >
      {/* TOP AREA */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center">
          <Image
            src="/images/avatar.jpg"
            alt="User Avatar"
            width={56}
            height={56}
            className="object-cover w-full h-full"
          />
        </div>

        <div>
          <p className="text-sm text-slate-500">{greeting},</p>
          <h2 className="text-xl font-semibold text-slate-800">
            {userName} 👋
          </h2>
        </div>
      </div>

      {/* SUBTEXT */}
      <p className="text-sm text-slate-500 leading-relaxed -mt-2">
        Hope you’re having a productive day. Stay consistent with your habits!
      </p>

      {/* WORK HOURS CARD — COMPACT VERSION */}
      <div className="rounded-2xl p-3 bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-sm">
        <h3 className="text-xs font-semibold mb-3 flex items-center gap-2 tracking-wide">
          <Clock size={14} /> Working Hours
        </h3>

        {/* Inner box */}
        <div className="bg-white rounded-xl p-3 flex items-center justify-between shadow-sm text-slate-700">
          {/* START */}
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-slate-500">
              Start
            </span>
            <span className="text-[18px] font-semibold leading-none">
              09:00 AM
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-10 bg-slate-200 mx-3" />

          {/* END */}
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-medium text-slate-500">End</span>
            <span className="text-[18px] font-semibold leading-none">
              05:00 PM
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
