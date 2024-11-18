import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, Save, Clipboard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface NoteEditorProps {
  code: string;
}

export default function NoteEditor({ code }: NoteEditorProps) {
  const [title, setTitle] = useState(''); // Title state
  const [content, setContent] = useState(''); // Content state
  const [saving, setSaving] = useState(false); // Saving indicator
  const [lastSaved, setLastSaved] = useState<Date | null>(null); // Last saved timestamp
  const navigate = useNavigate(); // For navigation
  const previousTitle = useRef(''); // To track previous title
  const previousContent = useRef(''); // To track previous content

  // Save Note Function (Handles both Title and Content)
  const saveNote = useCallback(
    async (newTitle: string, newContent: string) => {
      if (!code) return;

      setSaving(true);
      try {
        // Check if the note exists
        const { data: existingNote, error: fetchError } = await supabase
          .from('notes')
          .select('id')
          .eq('code', code)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching note:', fetchError);
          throw fetchError;
        }

        // Insert or update the note
        const { error } = await supabase
          .from('notes')
          .upsert({
            id: existingNote?.id || undefined, // Avoid duplicate conflicts
            code,
            title: newTitle, // Save title
            content: newContent, // Save content
            updated_at: new Date().toISOString(), // Update timestamp
          });

        if (error) {
          console.error('Save error:', error);
          throw error;
        }

        // Update lastSaved timestamp only on successful save
        setLastSaved(new Date());
        // Update previous values to the new ones after successful save
        previousTitle.current = newTitle;
        previousContent.current = newContent;

        toast.success('Note saved successfully!');
      } catch (error) {
        console.error('Failed to save note:', error);
        toast.error('Failed to save note');
      } finally {
        setSaving(false);
      }
    },
    [code]
  );

  // Auto-save Title and Content
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        title !== previousTitle.current || // Check if title has changed
        content !== previousContent.current // Check if content has changed
      ) {
        saveNote(title, content);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [title, content, saveNote]);

  // Load Note from Supabase
  useEffect(() => {
    const loadNote = async () => {
      try {
        const { data, error } = await supabase
          .from('notes')
          .select('title, content, updated_at')
          .eq('code', code)
          .single();

        if (error) {
          console.error('Load error:', error);
          throw error;
        }

        if (data) {
          setTitle(data.title || ''); // Set title
          setContent(data.content || ''); // Set content
          setLastSaved(new Date(data.updated_at)); // Set last saved timestamp
          previousTitle.current = data.title || ''; // Initialize previous title
          previousContent.current = data.content || ''; // Initialize previous content
        }
      } catch (error) {
        console.error('Failed to load note:', error);
        toast.error('Failed to load note');
      }
    };

    if (code) {
      loadNote();
    }
  }, [code]);

  // Handle Share
  const handleShare = () => {
    const url = `${window.location.origin}/access`;
    navigator.clipboard.writeText(url);
    toast.success(`Code copied: ${code}. Share this code with others to collaborate!`);
  };

  // Handle Copy Code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code); // Copy code to clipboard
    toast.success('Code copied to clipboard');
  };

  // Handle Manual Save
  const handleManualSave = () => {
    if (title !== previousTitle.current || content !== previousContent.current) {
      saveNote(title, content);
    }
  };

  return (
    <div className="w-full max-w-10xl mx-auto p-4.5">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Note Header */}
        <div className="flex items-center p-4 border-b border-gray-200 gap-4">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900"
            title="Back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
  
          {/* Title Input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for your note"
            className="text-lg font-semibold text-gray-800 focus:outline-none flex-1 md:text-xl"
          />
  
          {/* Buttons Section */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleManualSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm md:text-base"
              disabled={saving}
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm md:text-base"
            >
              <Share2 size={18} />
              Share
            </button>
            <div className="flex items-center gap-1 text-sm md:text-base">
              <span className="text-gray-800">code: {code}</span>
              <button
                onClick={handleCopyCode}
                className="text-blue-500 hover:text-blue-700"
                title="Copy Code"
              >
                <Clipboard size={18} />
              </button>
            </div>
          </div>
        </div>
  
        {/* Note Content */}
        <textarea
  value={content}
  onChange={(e) => setContent(e.target.value)}
  className="w-full h-[calc(100vh-220px)] p-4 text-sm text-gray-800 bg-gray-100 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 md:text-base"
  placeholder="Start typing your note... It will auto-save as you type."
/>  
        {/* Last Saved Info */}
        {lastSaved && (
          <div className="p-4 text-gray-600 text-sm">
            Last saved: {lastSaved.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
  

}
