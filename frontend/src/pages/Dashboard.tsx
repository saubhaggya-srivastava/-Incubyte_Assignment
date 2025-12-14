import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sweetAPI } from '../services/api';
import { SweetCard } from '../components/SweetCard';
import { SearchBar } from '../components/SearchBar';
import { useAuth } from '../contexts/AuthContext';
import type { Sweet, SearchCriteria } from '../types';

export const Dashboard = () => {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { logout, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const fetchSweets = async (criteria?: SearchCriteria) => {
    setLoading(true);
    setError('');
    try {
      const data = criteria && Object.keys(criteria).length > 0
        ? await sweetAPI.search(criteria)
        : await sweetAPI.getAll();
      setSweets(data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load sweets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSweets();
  }, []);

  const handlePurchase = async (id: string) => {
    try {
      await sweetAPI.purchase(id);
      fetchSweets();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Purchase failed');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Sweet Shop</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user?.email}</span>
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Admin Panel
              </button>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <SearchBar onSearch={fetchSweets} />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading sweets...</p>
          </div>
        ) : sweets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No sweets found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sweets.map((sweet) => (
              <SweetCard key={sweet.id} sweet={sweet} onPurchase={handlePurchase} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
