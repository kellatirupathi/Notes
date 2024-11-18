import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, KeyRound, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import uuidv4 from 'uuid/dist/v4';
import toast from 'react-hot-toast';

export default function HomePage() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  interface Note {
    code: string;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
  }
  
  const [notes, setNotes] = useState<Note[]>([]); // Define the type of `notes`
  
  

  // Fetch notes and initialize user_id
  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    if (!storedUserId) {
      const newUserId = uuidv4();
      localStorage.setItem('user_id', newUserId);
    }
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const user_id = localStorage.getItem('user_id');
    if (!user_id) return;

    const { data, error } = await supabase
      .from('notes')
      .select('code, title, content, created_at, updated_at') // Include created_at
      .eq('user_id', user_id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to fetch notes.');
    } else {
      setNotes(data);
    }
  };

  const generateCode = async () => {
    const user_id = localStorage.getItem('user_id');
    if (!user_id) {
      toast.error('User ID not found. Please refresh the page.');
      return;
    }
  
    try {
      setIsCreating(true);
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      const now = new Date().toLocaleString(); // Get local time as string
  
      const { error } = await supabase
        .from('notes')
        .insert([
          {
            code,
            title: '',
            content: '',
            user_id,
            created_at: now, // Use local time
            updated_at: now, // Use local time
          },
        ]);
  
      if (error) throw error;
  
      fetchNotes();
      navigate(`/notes/${code}`);
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };
  

  const deleteNote = async (code: string) => {
    try {
      const { error } = await supabase.from('notes').delete().eq('code', code);

      if (error) throw error;

      toast.success('Note deleted successfully!');
      fetchNotes(); // Refresh the notes list
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete the note.');
    }
  };

  const accessCode = () => {
    navigate('/access');
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 sm:text-2xl md:text-4xl">Welcome to Notes</h2>
        <p className="text-gray-600 text-sm sm:text-base md:text-lg">Create or access shared notes with a 4-digit code</p>
      </div>

      {/* Buttons Section */}
      <div className="flex justify-center gap-4">
        <button
          onClick={generateCode}
          disabled={isCreating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 sm:text-sm md:text-base"
        >
          <PlusCircle size={18} />
          <span>{isCreating ? 'Creating...' : 'Create New Note'}</span>
        </button>

        <button
          onClick={accessCode}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors sm:text-sm md:text-base"
        >
          <KeyRound size={18} />
          <span>Access Shared Note</span>
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 sm:text-lg md:text-2xl">Your Notes</h2>
        {notes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2 sm:px-2 sm:py-1">Code</th>
                  <th className="border border-gray-300 px-4 py-2 sm:px-2 sm:py-1">Title/Content</th>
                  <th className="border border-gray-300 px-4 py-2 sm:px-2 sm:py-1">Created At</th>
                </tr>
              </thead>
              <tbody>
                {notes.map((note) => (
                  <tr key={note.code} className="hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-2 relative group cursor-pointer">
                      <span
                        onClick={() => navigate(`/notes/${note.code}`)}
                        className="text-blue-600 hover:underline"
                      >
                        {note.code}
                      </span>
                      {/* Hover delete icon */}
                      <button
                        onClick={() => deleteNote(note.code)}
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 hidden group-hover:inline-block text-red-500 hover:text-red-700"
                        title="Delete Note"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {note.title || note.content.slice(0, 50) || 'No content'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(note.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 text-sm sm:text-base">No notes created yet.</p>
        )}
      </div>
    </div>
  );
}
