import React from "react";

export const DecimalSlider = ({ value, onChange, min, max }) => (
    <input
        type="range"
        min={min}
        max={max}
        value={value}
        step={0.01}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer"
    />
);
