import { useState } from 'react';
import type { Sweet } from '../types';

interface SweetCardProps {
  sweet: Sweet;
  onPurchase: (id: string) => Promise<void>;
}

export const SweetCard: React.FC<SweetCardProps> = ({ sweet, onPurchase }) => {
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      await onPurchase(sweet.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-bold text-gray-900 mb-2">{sweet.name}</h3>
      <p className="text-sm text-gray-600 mb-4">{sweet.category}</p>
      <div className="flex justify-between items-center mb-4">
        <span className="text-2xl font-bold text-blue-600">${sweet.price.toFixed(2)}</span>
        <span className={`text-sm font-medium ${sweet.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {sweet.quantity > 0 ? `${sweet.quantity} in stock` : 'Out of stock'}
        </span>
      </div>
      <button
        onClick={handlePurchase}
        disabled={sweet.quantity === 0 || loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Purchasing...' : sweet.quantity === 0 ? 'Out of Stock' : 'Purchase'}
      </button>
    </div>
  );
};
