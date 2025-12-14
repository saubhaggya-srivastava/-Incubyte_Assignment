import { useState } from 'react';
import type { SearchCriteria } from '../types';

interface SearchBarProps {
  onSearch: (criteria: SearchCriteria) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const criteria: SearchCriteria = {};
    if (name) criteria.name = name;
    if (category) criteria.category = category;
    if (minPrice) criteria.minPrice = parseFloat(minPrice);
    if (maxPrice) criteria.maxPrice = parseFloat(maxPrice);
    onSearch(criteria);
  };

  const handleClear = () => {
    setName('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    onSearch({});
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Category..."
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Min price..."
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          step="0.01"
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Max price..."
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          step="0.01"
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          Clear
        </button>
      </div>
    </form>
  );
};
