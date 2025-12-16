import React, { useState } from 'react';
import type { PinterestUser } from '../types';
import { Check, ShieldCheck, User, Hash, Save, LogOut, Key, Server, ExternalLink, HelpCircle, Copy } from 'lucide-react';

interface SettingsProps {
  user: PinterestUser | null;
  onConnect: (user: PinterestUser) => void;
  onDisconnect: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onConnect, onDisconnect }) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isLoadingBoards, setIsLoadingBoards] = useState(false);
  const [boardsFound, setBoardsFound] = useState<{id: string, name: string}[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const appPurposeText = "This application is a content management tool for 'Aesthetic Gaming Setups'. It uses AI to generate pin titles, descriptions, and images based on our blog posts. The app uses the Pinterest API to read boards and create new pins directly to our account, streamlining the workflow.";

  const handleCopyPurpose = () => {
    navigator.clipboard.writeText(appPurposeText);
    setStatusMsg("Purpose text copied to clipboard!");
    setTimeout(() => setStatusMsg(""), 3000);
  };

  // Step 1: Verify Token and Get Boards
  const handleVerifyToken = async () => {
      if (!accessToken) return;
      setIsLoadingBoards(true);
      setStatusMsg('');
      
      try {
          const res = await fetch('/api/pinterest', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ action: 'get_boards', accessToken })
          });
          
          const data = await res.json();
          if (res.ok && data.items) {
              setBoardsFound(data.items);
              if (data.items.length > 0) setSelectedBoardId(data.items[0].id);
              setStatusMsg('Token valid! Select a board below.');
          } else {
              console.error("API Error Details:", data);
              setStatusMsg(`Error ${res.status}: ${data.error || res.statusText || 'Unknown API Error'}`);
          }
      } catch (e: any) {
          console.error("Network/Fetch Error:", e);
          setStatusMsg(`Connection Failed: ${e.message || 'Unknown error'}`);
      } finally {
          setIsLoadingBoards(false);
      }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput || !accessToken || !selectedBoardId) return;

    onConnect({
      username: usernameInput,
      avatarUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${usernameInput}`,
      boards: boardsFound.map(b => b.name),
      autoPublish: true, // Now we can auto publish!
      accessToken: accessToken,
      boardId: selectedBoardId
    });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div>
        <h2 className="text-3xl font-bold text-white">Settings</h2>
        <p className="text-slate-400 mt-1">Configure Pinterest API Integration.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN: Connection Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <div className="p-4 bg-red-600/20 rounded-full text-red-500">
                        <Server size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">API Connection</h3>
                        <p className="text-slate-400 text-sm">Connect using Developer Token.</p>
                    </div>
                </div>
                {user?.accessToken && <span className="px-3 py-1 bg-green-900/30 text-green-400 text-sm font-medium rounded-full border border-green-500/20">Connected</span>}
            </div>

            {user ? (
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <div className="flex items-center space-x-4 mb-6">
                        <img src={user.avatarUrl} alt="User" className="w-16 h-16 rounded-full border-2 border-slate-600" />
                        <div>
                            <h4 className="text-white font-bold text-lg">{user.username}</h4>
                            <p className="text-slate-400 text-sm">Auto-Publishing Enabled</p>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 mb-6">
                        <p className="text-xs text-slate-500 uppercase mb-1">Target Board ID</p>
                        <code className="text-green-400 font-mono">{user.boardId}</code>
                    </div>

                    <button 
                        onClick={onDisconnect}
                        className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-red-900/30 text-slate-400 hover:text-red-400 rounded-lg transition-colors border border-slate-700 hover:border-red-500/50"
                    >
                        <LogOut size={16} />
                        <span>Disconnect & Reset</span>
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSaveProfile} className="bg-slate-800/30 rounded-xl p-6 border border-slate-700 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">1. Your Pinterest Username</label>
                        <div className="relative">
                            <User size={18} className="absolute left-3 top-3 text-slate-500" />
                            <input 
                                type="text"
                                required
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                placeholder="e.g. GamingSetupPro"
                                value={usernameInput}
                                onChange={(e) => setUsernameInput(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">2. Pinterest Access Token</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Key size={18} className="absolute left-3 top-3 text-slate-500" />
                                <input 
                                    type="password"
                                    required
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                    placeholder="pina_..."
                                    value={accessToken}
                                    onChange={(e) => setAccessToken(e.target.value)}
                                />
                            </div>
                            <button 
                                type="button"
                                onClick={handleVerifyToken}
                                disabled={!accessToken || isLoadingBoards}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors border border-slate-600 hover:border-slate-500"
                            >
                                {isLoadingBoards ? 'Checking...' : 'Check'}
                            </button>
                        </div>
                    </div>

                    {boardsFound.length > 0 && (
                        <div className="animate-fade-in pt-4 border-t border-slate-700">
                            <label className="block text-sm font-medium text-slate-300 mb-2">3. Select Target Board</label>
                            <div className="relative">
                                <Hash size={18} className="absolute left-3 top-3 text-slate-500" />
                                <select 
                                    className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none appearance-none cursor-pointer"
                                    value={selectedBoardId}
                                    onChange={(e) => setSelectedBoardId(e.target.value)}
                                >
                                    {boardsFound.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 mt-4">
                        <button
                            type="submit"
                            disabled={!selectedBoardId}
                            className={`w-full px-6 py-3 font-bold rounded-xl transition-all flex items-center justify-center space-x-2 ${
                                selectedBoardId 
                                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-900/20' 
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                        >
                            <Save size={20} />
                            <span>Save & Enable</span>
                        </button>
                    </div>
                </form>
            )}
          </div>

          {/* RIGHT COLUMN: Instructions & Verification Info */}
          <div className="space-y-6">
             {/* Instructions */}
            <div className="bg-blue-900/10 border border-blue-500/20 rounded-xl p-5 text-sm text-blue-100">
                <div className="flex items-center space-x-2 mb-3 text-blue-400 font-bold">
                    <HelpCircle size={18} />
                    <h4>How to get Access Token</h4>
                </div>
                <ol className="list-decimal list-inside space-y-3 text-blue-200/80">
                    <li className="pl-2">
                        Go to <a href="https://developers.pinterest.com/tools/api-explorer/" target="_blank" className="text-blue-400 hover:underline font-bold">Pinterest API Explorer <ExternalLink size={12} className="inline"/></a>.
                    </li>
                    <li className="pl-2">Check these Scopes: <br/><code>boards:read</code>, <code>pins:read</code>, <code>pins:read_write</code></li>
                    <li className="pl-2">Click <strong>Generate Access Token</strong> and paste it to the left.</li>
                </ol>
            </div>

            {/* App Verification Helper */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                <div className="flex items-center space-x-2 mb-4 text-white font-bold">
                    <ShieldCheck size={18} className="text-green-500"/>
                    <h4>App Verification Helper</h4>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                    Copy these details for the Pinterest verification form.
                </p>

                <div className="mb-4">
                    <label className="text-xs font-semibold text-slate-500 uppercase">App Purpose (Copy this)</label>
                    <div className="bg-slate-900 rounded p-3 mt-1 text-slate-300 text-xs leading-relaxed relative group">
                        {appPurposeText}
                        <button 
                            onClick={handleCopyPurpose}
                            className="absolute top-2 right-2 p-1.5 bg-slate-700 hover:bg-slate-600 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Copy to clipboard"
                        >
                            <Copy size={12} />
                        </button>
                    </div>
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Privacy Policy URL</label>
                    <div className="bg-slate-900 rounded p-3 mt-1 text-slate-300 text-xs font-mono break-all border border-slate-700/50">
                        {window.location.origin}/privacy-policy-aesthetic-gaming-setups
                    </div>
                    <p className="text-[10px] text-green-400 mt-1">
                        ✓ Clean URL format
                    </p>
                </div>
            </div>
            
             {statusMsg && (
                <div className={`text-sm mt-3 flex items-center gap-2 p-3 rounded-lg animate-fade-in ${statusMsg.includes('Error') ? 'bg-red-900/20 text-red-400 border border-red-500/20' : 'bg-green-900/20 text-green-400 border border-green-500/20'}`}>
                    {statusMsg.includes('Error') ? <ShieldCheck size={16}/> : <Check size={16}/>}
                    <span>{statusMsg}</span>
                </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default Settings;