import React, { useState } from 'react';
import type { BlogPostInput } from '../types';
import { Wand2, Link as LinkIcon, Hash } from 'lucide-react';

interface InputSectionProps {
  onGenerate: (data: BlogPostInput) => void;
  isLoading: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ onGenerate, isLoading }) => {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [url, setUrl] = useState('');
  const [boardName, setBoardName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && summary) {
      onGenerate({ title, summary, url, boardName });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">1. Analyze Blog Post</h2>
        <p className="text-slate-400 text-sm">
          Provide details about your blog post. The AI will generate optimized Pin strategies and images.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Blog Post Title</label>
          <input
            type="text"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder-slate-500"
            placeholder="e.g., Top 10 White Gaming Setups for 2024"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Content Summary / Key Points</label>
          <textarea
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder-slate-500 h-32 resize-none"
            placeholder="Paste your intro or describe the main points of the post..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Post URL (Destination)</label>
              <div className="relative">
                 <LinkIcon size={16} className="absolute left-3 top-3.5 text-slate-500" />
                <input
                    type="url"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder-slate-500"
                    placeholder="https://yourblog.com/post..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Pinterest Board Name</label>
              <div className="relative">
                 <Hash size={16} className="absolute left-3 top-3.5 text-slate-500" />
                <input
                    type="text"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder-slate-500"
                    placeholder="e.g. Gaming Setups"
                    value={boardName}
                    onChange={(e) => setBoardName(e.target.value)}
                />
              </div>
            </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !title || !summary}
          className={`w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-purple-900/30 ${
            (isLoading || !title || !summary) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Analyzing with Gemini...</span>
            </>
          ) : (
            <>
              <Wand2 size={20} />
              <span>Generate Pin Concepts</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default InputSection;