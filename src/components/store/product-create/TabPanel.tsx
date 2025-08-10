import React from "react";

interface TabPanelProps {
  tabs: { key: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function TabPanel({
  tabs,
  value,
  onChange,
  className = "",
}: TabPanelProps) {
  return (
    <div className={`flex border-b mb-8 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={`px-4 py-2 transition-colors duration-200 outline-none
            ${
              value === tab.key
                ? "border-b-2 border-indigo-500 text-indigo-600 font-bold"
                : "text-gray-500 hover:text-indigo-600"
            }`}
          onClick={() => onChange(tab.key)}
          tabIndex={0}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
