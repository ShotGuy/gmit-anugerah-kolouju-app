"use client";

import { CalendarDays, Clock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  formatDate,
  formatTime,
  getGreeting,
  getIndonesianTimezone,
} from "@/utils/common";

export default function HeaderDateTimeWidget({ locale = "id-ID" }) {
  const [now, setNow] = useState(new Date());
  const [timezoneLabel, setTimezoneLabel] = useState("WIB");
  const [mounted, setMounted] = useState(false);

  // Set mounted flag to true after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // realtime tick
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // detect timezone on mount
  useEffect(() => {
    setTimezoneLabel(getIndonesianTimezone());
  }, []);

  // Always call hooks - compute values even before mounting
  const dateStr = useMemo(() => formatDate(now, locale), [now, locale]);
  const timeStr = useMemo(() => formatTime(now, locale), [now, locale]);
  const { text: greet, Icon } = useMemo(
    () => getGreeting(now.getHours()),
    [now]
  );

  // Prevent hydration mismatch by not rendering time-sensitive content until mounted
  if (!mounted) {
    return (
      <div
        className="flex items-center gap-3 rounded-xl bg-white/70 px-3 py-2 backdrop-blur-md ring-1 ring-gray-200 text-gray-800 shadow-sm
                dark:bg-black/20 dark:ring-white/10 dark:text-white"
      >
        {/* Placeholder content to match layout */}
        <span className="hidden sm:flex items-center gap-1.5 rounded-lg bg-white/20 px-2 py-1 text-xs font-medium ring-1 ring-white/25">
          <Clock className="h-4 w-4" />
          <span>Loading...</span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm">
          <CalendarDays className="h-4 w-4 opacity-90" />
          <span className="font-medium">Loading...</span>
        </span>
        <span className="h-4 w-px bg-white/30 hidden sm:block" />
        <span className="inline-flex items-center gap-1.5 text-sm tabular-nums">
          <Clock className="h-4 w-4 opacity-90" />
          <span className="font-semibold">Loading...</span>
          <span className="text-white/80 text-xs">WIB</span>
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-3 rounded-xl bg-white/70 px-3 py-2 backdrop-blur-md ring-1 ring-gray-200 text-gray-800 shadow-sm
              dark:bg-black/20 dark:ring-white/10 dark:text-white"
    >
      {/* greet bubble (mobile-hide) */}
      <span className="hidden sm:flex items-center gap-1.5 rounded-lg bg-white/20 px-2 py-1 text-xs font-medium ring-1 ring-white/25">
        <Icon className="h-4 w-4" />
        <span>Selamat {greet}</span>
      </span>

      {/* date */}
      <span className="inline-flex items-center gap-1.5 text-sm">
        <CalendarDays className="h-4 w-4 opacity-90" />
        <span className="font-medium">{dateStr}</span>
      </span>

      {/* separator */}
      <span className="h-4 w-px bg-white/30 hidden sm:block" />

      {/* time */}
      <span className="inline-flex items-center gap-1.5 text-sm tabular-nums">
        <Clock className="h-4 w-4 opacity-90" />
        <span className="font-semibold">{timeStr}</span>
        <span className="text-white/80 text-xs">{timezoneLabel}</span>
      </span>
    </div>
  );
}
