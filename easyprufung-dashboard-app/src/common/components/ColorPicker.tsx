import React from "react";

export const ColorPicker = ({ value, onChange }) => (
    <div className="relative w-full">
        {/* Color display with better styling */}
        <div
            className="w-full h-12 p-2 flex items-center justify-between bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
        >
            {/* Color preview box */}
            <div
                className="w-10 h-10 rounded-xl border-2 dark:border-gray-500"
                style={{ backgroundColor: value }}
            />

            {/* Color value display */}
            <span className="ml-3 text-sm font-medium text-gray-700 dark:text-white">
                {value}
            </span>

            {/* Hidden color input */}
            <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
            />
        </div>
    </div>
);
