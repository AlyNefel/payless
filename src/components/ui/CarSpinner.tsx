"use client";

import React from "react";
import { Car } from "lucide-react";
import { motion } from "framer-motion";

interface CarSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  label?: string;
  color?: string;
}

const SIZE_CONFIGS = {
  sm: {
    container: "w-8 h-8",
    car: "w-3.5 h-3.5",
    track: "border-[2px]",
    pulse: "w-6 h-6",
    text: "text-xs",
  },
  md: {
    container: "w-12 h-12",
    car: "w-5 h-5",
    track: "border-[2.5px]",
    pulse: "w-9 h-9",
    text: "text-xs",
  },
  lg: {
    container: "w-16 h-16",
    car: "w-7 h-7",
    track: "border-[3px]",
    pulse: "w-12 h-12",
    text: "text-sm",
  },
  xl: {
    container: "w-24 h-24",
    car: "w-10 h-10",
    track: "border-[3.5px]",
    pulse: "w-18 h-18",
    text: "text-base",
  },
};

export function CarSpinner({
  size = "md",
  className = "",
  label,
  color,
}: CarSpinnerProps) {
  const config = SIZE_CONFIGS[size] || SIZE_CONFIGS.md;

  return (
    <div className={`inline-flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className={`relative flex items-center justify-center ${config.container}`}>
        {/* Outer glowing pulsed wave */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute rounded-full bg-blue-500/15 dark:bg-blue-400/20 blur-sm ${config.container}`}
        />

        {/* Outer continuous spinning track */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "linear",
          }}
          className={`absolute inset-0 rounded-full border-dashed ${config.track} border-transparent border-t-blue-600 border-r-amber-400 dark:border-t-blue-400 dark:border-r-amber-400`}
        />

        {/* Inner reverse spin ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
          className={`absolute inset-1 rounded-full ${config.track} border-slate-200/50 dark:border-slate-800/80 border-b-blue-500/80`}
        />

        {/* Center Car Icon with acceleration bounce */}
        <motion.div
          animate={{
            x: [-1.5, 1.5, -1.5],
            y: [-0.5, 0.5, -0.5],
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative z-10 text-blue-600 dark:text-blue-400 flex items-center justify-center drop-shadow-sm"
          style={color ? { color } : undefined}
        >
          <Car className={`${config.car} stroke-[2.2]`} />
        </motion.div>
      </div>

      {label && (
        <span className={`font-semibold text-slate-600 dark:text-slate-300 tracking-wide animate-pulse ${config.text}`}>
          {label}
        </span>
      )}
    </div>
  );
}

export default CarSpinner;

