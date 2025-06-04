import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Props, FormValues } from "../utils/types";

const FormInputs: React.FC<Props> = ({ darkMode, onChange }) => {
  const [values, setValues] = useState<FormValues>({
    clipCount: 4,
    maxDuration: 40,
    quality: 720,
    cache: true,
    highlightKeyword: "",
  });

  const baseInputClass = `w-full h-14 px-4 py-2 rounded-xl border focus:outline-none transition-all duration-200 ${
    darkMode
      ? "bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
      : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500"
  }`;

  useEffect(() => {
    onChange(values);
  }, [values, onChange]);

  const updateValue = <K extends keyof FormValues>(
    field: K,
    value: FormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`grid grid-cols-1 p-4 md:grid-cols-2 gap-4 w-full rounded-2xl shadow-md 
        ${darkMode ? "text-gray-50" : ""}`}
    >
      {/* Clip Count */}
      <div className="flex flex-col">
        <label className="mb-1 px-2 font-medium text-sm">
          Number of Clips (1-10)
        </label>
        <motion.input
          whileFocus={{ scale: 1.01 }}
          type="number"
          min={1}
          max={10}
          value={values.clipCount}
          onChange={(e) => updateValue("clipCount", Number(e.target.value))}
          className={baseInputClass}
        />
      </div>

      {/* Duration */}
      <div className="flex flex-col">
        <label className="mb-1 px-2 font-medium text-sm">
          Clip Duration (10-100)
        </label>
        <motion.input
          whileFocus={{ scale: 1.01 }}
          type="number"
          min={10}
          max={100}
          value={values.maxDuration}
          onChange={(e) => updateValue("maxDuration", Number(e.target.value))}
          className={baseInputClass}
        />
      </div>

      {/* Quality */}
      <div className="flex flex-col">
        <label className="mb-1 px-2 font-medium text-sm">Select Quality</label>
        <motion.select
          whileFocus={{ scale: 1.01 }}
          value={values.quality}
          onChange={(e) =>
            updateValue(
              "quality",
              Number(e.target.value) as 480 | 720 | 1080 | 1440
            )
          }
          className={`${baseInputClass} cursor-pointer`}
        >
          <option value={480}>480p</option>
          <option value={720}>720p</option>
          <option value={1080}>1080p</option>
          <option value={1440}>1440p / 2K</option>
        </motion.select>
      </div>

      {/* Highlight Keyword */}
      <div className="w-full flex flex-col justify-end">
        <label className="mb-1 px-2 font-medium text-sm">
          Keyword (optional)
        </label>
        <motion.input
          whileFocus={{ scale: 1.01 }}
          type="text"
          placeholder="e.g., funny, educational, motivational"
          value={values.highlightKeyword}
          onChange={(e) => updateValue("highlightKeyword", e.target.value)}
          className={baseInputClass}
        />
      </div>

      {/* Cache */}
      <div className="flex px-2 items-center space-x-3 md:col-span-2 pt-2">
        <input
          type="checkbox"
          checked={values.cache}
          onChange={(e) => updateValue("cache", e.target.checked)}
          className="w-5 h-5 cursor-pointer"
        />
        <label className="text-sm font-medium">
          Do you want cached result?
        </label>
      </div>
    </motion.div>
  );
};

export default FormInputs;
