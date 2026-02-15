import React, { useRef } from 'react';
import { Upload, Library, ListMusic, Plus, Loader2 } from 'lucide-react';
import { Song } from '../types';

interface SidebarProps {
  onUpload: (files: FileList) => void;
  isUploading: boolean;
  libraryCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ onUpload, isUploading, libraryCount }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0">
      <div className="p-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-8">
          <span className="bg-indigo-500 w-8 h-8 rounded-lg flex items-center justify-center">
            <Library className="w-5 h-5 text-white" />
          </span>
          Study Play
        </h2>

        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-500/10 text-indigo-400 rounded-lg font-medium transition-colors">
            <ListMusic className="w-5 h-5" />
            Library
            <span className="ml-auto text-xs bg-indigo-500/20 px-2 py-0.5 rounded-full">
              {libraryCount}
            </span>
          </button>
        </div>
      </div>

      <div className="mt-auto p-6 border-t border-slate-800">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="audio/mpeg, audio/mp3"
          multiple
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-dashed border-slate-600 hover:border-indigo-500 hover:text-indigo-400 hover:bg-slate-800 transition-all text-slate-400
            ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
        >
          {isUploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
          <span className="font-medium">{isUploading ? 'Uploading...' : 'Add Music'}</span>
        </button>
        <p className="text-xs text-slate-500 text-center mt-3">
          Upload MP3s to your private <br/> /SchoolMusic folder.
        </p>
      </div>
    </aside>
  );
};