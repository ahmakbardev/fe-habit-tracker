"use client"; // ← FIX PALING PENTING

import GeoPermissionGate from "./GeoPermissionGate";
import MapsTracker from "./MapsTracker";
import MiniCalendar from "./MiniCalendar";
import NotesList from "./NotesList";
import NotificationsCard from "./NotificationsCard";
import ProfileGreetingCard from "./ProfileGreetingCard";
import SuggestedHabitList from "./SuggestedHabitList";
import TodayActivityTimeline from "./TodayActivityTimeline";
import TodayHeader from "./TodayHeader";
import TodayTodos from "./TodayTodos";
import WeatherCard from "./WeatherCard";

export default function HomePage() {
  return (
    <GeoPermissionGate>
      {(geoAllowed) => (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* LEFT COLUMN */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
              <TodayHeader />
              <MiniCalendar />
            </div>

            <div className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm">
              <WeatherCard geoAllowed={geoAllowed} />
              <SuggestedHabitList />
            </div>

            <NotesList />
          </div>

          {/* RIGHT COLUMN */}
          <div className="h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-4">
              <div className="xl:col-span-3 space-y-2">
                <TodayTodos />
                <MapsTracker geoAllowed={geoAllowed} />
              </div>

              <div className="xl:col-span-2 space-y-4">
                <ProfileGreetingCard />
                <NotificationsCard />
              </div>
            </div>

            <div className="my-4">
              <TodayActivityTimeline />
            </div>
          </div>
        </div>
      )}
    </GeoPermissionGate>
  );
}
