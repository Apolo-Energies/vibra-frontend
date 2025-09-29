import React from "react";

interface Props {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export const Slider = ({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className = "",
}: Props) => {
  const percentage = ((value[0] - min) / (max - min)) * 100;

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={(e) => onValueChange([Number(e.target.value)])}
      className={`w-full appearance-none h-2 rounded-full outline-none transition-colors bg-gray-200
        [&::-webkit-slider-thumb]:appearance-none
        [&::-webkit-slider-thumb]:w-4
        [&::-webkit-slider-thumb]:h-4
        [&::-webkit-slider-thumb]:rounded-full
        [&::-webkit-slider-thumb]:bg-blue-600
        [&::-webkit-slider-thumb]:cursor-pointer
        [&::-moz-range-thumb]:appearance-none
        [&::-moz-range-thumb]:w-4
        [&::-moz-range-thumb]:h-4
        [&::-moz-range-thumb]:rounded-full
        [&::-moz-range-thumb]:bg-blue-600
        [&::-moz-range-thumb]:cursor-pointer
        ${className}`}
      style={{
        background: `linear-gradient(to right, #2563eb ${percentage}%, #e5e7eb ${percentage}%)`,
      }}
    />
  );
};
