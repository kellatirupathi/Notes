import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function AccessCode() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 4) {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('id')
        .eq('code', code)
        .single();

      setLoading(false);
      
      if (error || !data) {
        toast.error('Note not found with this code');
        return;
      }
      
      navigate(`/notes/${code}`);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <button
        onClick={() => navigate('/')}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={20} className="mr-1" />
        Back
      </button>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Access Shared Note</h2>
          <p className="mt-2 text-gray-600">Enter the 4-digit code to access the shared note</p>
        </div>

        <div>
          <label htmlFor="code" className="sr-only">
            4-digit code
          </label>
          <input
            type="text"
            id="code"
            maxLength={4}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
            className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-center text-3xl tracking-widest focus:border-blue-500 focus:ring-blue-500"
            placeholder="0000"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={code.length !== 4 || loading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Access Note'}
        </button>
      </form>
    </div>
  );
}