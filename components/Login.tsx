import React from 'react';
import { Music, AlertCircle } from 'lucide-react';
import { GOOGLE_CLIENT_ID } from '../services/googleService';

interface LoginProps {
  onLogin: () => void;
  isLoading: boolean;
  error: string | null;
}

export const Login: React.FC<LoginProps> = ({ onLogin, isLoading, error }) => {
  
  const isMisconfigured = GOOGLE_CLIENT_ID === 'YOUR_CLIENT_ID_HERE';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
            <Music className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Study Play</h1>
          <p className="text-slate-400 text-center">
            Your distraction-free, ad-free music player for Google Drive.
          </p>
        </div>

        <div className="space-y-4">
          {isMisconfigured && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <p className="text-sm text-yellow-200 font-semibold mb-1">Configuration Needed</p>
              <p className="text-xs text-yellow-100/80">
                Please open <code>services/googleService.ts</code> and replace 
                <code>YOUR_CLIENT_ID_HERE</code> with your actual Google Client ID.
              </p>
            </div>
          )}

          {error && (
             <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-3">
               <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
               <p className="text-sm text-red-200">{error}</p>
             </div>
          )}

          <button
            onClick={onLogin}
            disabled={isLoading || isMisconfigured}
            className={`w-full py-3.5 px-4 rounded-xl font-semibold text-white transition-all shadow-lg
              ${isLoading || isMisconfigured
                ? 'bg-slate-700 cursor-not-allowed opacity-70' 
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/25 active:scale-95'}`}
          >
            {isLoading ? 'Connecting...' : 'Sign in with Google'}
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500">
            This app runs entirely in your browser. <br/>
            Only accesses the <code>/SchoolMusic</code> folder.
          </p>
        </div>
      </div>
    </div>
  );
};