import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { FileText } from 'lucide-react';
import HomePage from './components/HomePage';
import AccessCode from './components/AccessCode';
import NoteEditor from './components/NoteEditor';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <a href="/" className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <h1 className="ml-2 text-xl font-bold text-gray-900 ">Notes</h1>
              </a>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-3 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/access" element={<AccessCode />} />
            <Route path="/notes/:code" element={<NotePage />} />.w-full
          </Routes>
        </main>

        <Toaster position="bottom-right" />
      </div>
    </Router>
  );
}

function NotePage() {
  const code = window.location.pathname.split('/').pop() || '';
  return <NoteEditor code={code} />;
}

export default App;