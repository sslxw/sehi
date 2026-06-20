"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { format, isSameDay, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Circle,
  Dumbbell,
  Heart,
  Moon,
  Target,
  Zap,
} from "lucide-react";
import type { CalendarEvent } from "@/lib/whoop-data";
import { cn } from "@/lib/utils";
import "react-day-picker/style.css";

const typeConfig = {
  workout: { icon: Dumbbell, color: "#60A5FA", label: "Workout" },
  rest: { icon: Heart, color: "#34D399", label: "Rest" },
  sleep: { icon: Moon, color: "#A78BFA", label: "Sleep" },
  recovery: { icon: Zap, color: "#22D3EE", label: "Recovery" },
  goal: { icon: Target, color: "#FBBF24", label: "Goal" },
};

interface CalendarViewProps {
  events: CalendarEvent[];
}

export function CalendarView({ events }: CalendarViewProps) {
  const [selected, setSelected] = useState<Date>(new Date());

  const eventDates = events.map((e) => parseISO(e.date));
  const dayEvents = events.filter((e) => isSameDay(parseISO(e.date), selected));

  const modifiers = {
    hasEvent: eventDates,
  };

  const modifiersStyles = {
    hasEvent: {
      fontWeight: "600" as const,
      position: "relative" as const,
    },
  };

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-3 calendar-custom">
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={(day) => day && setSelected(day)}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          classNames={{
            root: "w-full",
            months: "w-full",
            month: "w-full",
            month_caption: "flex justify-center items-center h-10",
            caption_label: "text-sm font-semibold text-zinc-200",
            nav: "flex items-center gap-1",
            button_previous: "absolute left-3 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-zinc-400",
            button_next: "absolute right-3 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-zinc-400",
            month_grid: "w-full border-collapse",
            weekdays: "flex",
            weekday: "flex-1 text-center text-[10px] font-medium text-zinc-500 uppercase py-2",
            week: "flex w-full",
            day: "flex-1 text-center",
            day_button: "w-full aspect-square flex items-center justify-center text-sm rounded-xl hover:bg-white/5 transition-colors text-zinc-300",
            selected: "!bg-emerald-500/20 !text-emerald-300 font-semibold",
            today: "text-cyan-400 font-semibold",
            outside: "text-zinc-600",
          }}
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-300 mb-3 px-1">
          {format(selected, "EEEE, MMMM d")}
        </h3>
        <AnimatePresence mode="wait">
          {dayEvents.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass rounded-2xl p-6 text-center"
            >
              <p className="text-sm text-zinc-500">No events scheduled</p>
              <p className="text-xs text-zinc-600 mt-1">Rest day or add activities in Coach</p>
            </motion.div>
          ) : (
            <motion.div
              key={selected.toISOString()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              {dayEvents.map((event, i) => {
                const config = typeConfig[event.type];
                const Icon = config.icon;

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "glass rounded-2xl p-4",
                      event.completed && "opacity-60"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${config.color}15` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: config.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-zinc-100">
                            {event.title}
                          </h4>
                          {event.completed ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Circle className="w-4 h-4 text-zinc-600" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {event.time && (
                            <span className="text-xs text-zinc-500">{event.time}</span>
                          )}
                          {event.duration && (
                            <span className="text-xs text-zinc-600">· {event.duration}</span>
                          )}
                          {event.intensity && (
                            <span
                              className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                              style={{
                                color: config.color,
                                backgroundColor: `${config.color}10`,
                              }}
                            >
                              {event.intensity}
                            </span>
                          )}
                        </div>
                        {event.actionable && (
                          <p className="text-xs text-cyan-400/80 mt-2 leading-relaxed">
                            {event.actionable}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
