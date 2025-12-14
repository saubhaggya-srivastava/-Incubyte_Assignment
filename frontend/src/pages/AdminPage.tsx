import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sweetAPI } from '../services/api';
import { SweetForm } from '../components/SweetForm';
import type { Sweet, CreateSweetData } from '../types';

export const AdminPage = () => {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSweet, setEditingSweet] = useState<Sweet | undefined>();
  const [restockId, setRestockId] = useState<string | null>(null);
  const [restockQty, setRestockQty] = useState('');
  const navigate = useNavigate();

  const fetchSweets = async () => {
    setLoading(true);
    try {
      const data = await sweetAPI.getAll();
      setSweets(data);
    } catch (err) {
      alert('Failed to load sweets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSweets();
  }, []);

  const handleCreate = async (data: CreateSweetData) => {
    await sweetAPI.create(data);
    setShowForm(false);
    fetchSweets();
  };

  const handleUpdate = async (data: CreateSweetData) => {
    if (editingSweet) {
      await sweetAPI.update(editingSweet.id, data);
      setEditingSweet(undefined);
      setShowForm(false);
      fetchSweets();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this sweet?')) {
      try {
        await sweetAPI.delete(id);
        fetchSweets();
      } catch (err) {
        alert('Failed to delete sweet');
      }
    }
  };

  const handleRestock = async (id: string) => {
    const qty = parseInt(restockQty);
    if (qty <= 0) {
      alert('Quantity must be positive');
      return;
    }
    try {
      await sweetAPI.restock(id, qty);
      setRestockId(null);
      setRestockQty('');
      fetchSweets();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Restock failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {!showForm && (
          <button
            onClick={() => {
              setEditingSweet(undefined);
              setShowForm(true);
            }}
            className="mb-6 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            + Add New Sweet
          </button>
        )}

        {showForm && (
          <div className="mb-6">
            <SweetForm
              sweet={editingSweet}
              onSubmit={editingSweet ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditingSweet(undefined);
              }}
            />
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sweets.map((sweet) => (
                  <tr key={sweet.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{sweet.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{sweet.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">${sweet.price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{sweet.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button
                        onClick={() => {
                          setEditingSweet(sweet);
                          setShowForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(sweet.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setRestockId(sweet.id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        Restock
                      </button>
                      {restockId === sweet.id && (
                        <div className="inline-flex items-center gap-2 ml-2">
                          <input
                            type="number"
                            value={restockQty}
                            onChange={(e) => setRestockQty(e.target.value)}
                            placeholder="Qty"
                            className="w-20 px-2 py-1 border rounded"
                          />
                          <button
                            onClick={() => handleRestock(sweet.id)}
                            className="px-2 py-1 bg-green-600 text-white rounded text-sm"
                          >
                            OK
                          </button>
                          <button
                            onClick={() => {
                              setRestockId(null);
                              setRestockQty('');
                            }}
                            className="px-2 py-1 bg-gray-300 rounded text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
