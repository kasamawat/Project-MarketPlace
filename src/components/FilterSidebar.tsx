"use client";

import { useState } from "react";

type FilterSidebarProps = {
  category: string;
  filters: {
    categories: string[];
    tags: string[];
    types: string[];
  };
  onFilterChange: (filters: {
    category?: string;
    tag?: string;
    type?: string;
  }) => void;
};

export default function FilterSidebar({ category, filters, onFilterChange }: FilterSidebarProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleChange = (type: "category" | "tag" | "type", value: string) => {
    const update = { category: selectedCategory, tag: selectedTag, type: selectedType };

    if (type === "category") {
      setSelectedCategory(value);
      update.category = value;
    } else if (type === "tag") {
      setSelectedTag(value);
      update.tag = value;
    } else if (type === "type") {
      setSelectedType(value);
      update.type = value;
    }

    onFilterChange(update);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Categories</h3>
        <ul className="space-y-2 mt-2">
          {filters.categories.map((item) => (
            <li key={item}>
              <button
                onClick={() => handleChange("category", item)}
                className={`block text-left w-full ${
                  selectedCategory === item ? "text-blue-600 font-bold" : "text-gray-700"
                }`}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold">Tags</h3>
        <ul className="space-y-2 mt-2">
          {filters.tags.map((item) => (
            <li key={item}>
              <button
                onClick={() => handleChange("tag", item)}
                className={`block text-left w-full ${
                  selectedTag === item ? "text-blue-600 font-bold" : "text-gray-700"
                }`}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold">Type</h3>
        <ul className="space-y-2 mt-2">
          {filters.types.map((item) => (
            <li key={item}>
              <button
                onClick={() => handleChange("type", item)}
                className={`block text-left w-full ${
                  selectedType === item ? "text-blue-600 font-bold" : "text-gray-700"
                }`}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
