import React from 'react';
import { ViewState, type PinterestUser } from '../types';
import { LayoutDashboard, PenTool, Calendar, Zap, Settings, LogOut, Shield } from 'lucide-react';

interface LayoutProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  user: PinterestUser | null;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, setView, user, onLogout, children }) => {
  
  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => (
    <button
      onClick={() => setView(view)}
      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all duration-200 ${
        currentView === view 
          ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 fixed h-full bg-slate-900 border-r border-slate-800 hidden md:flex flex-col p-6">
        <div className="flex items-center space-x-2 mb-10 text-purple-400">
          <Zap size={28} className="text-purple-500" />
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            PinAI
          </h1>
        </div>

        <nav className="space-y-2 flex-1">
          <NavItem view={ViewState.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
          <NavItem view={ViewState.GENERATOR} icon={PenTool} label="Create Pins" />
          <NavItem view={ViewState.SCHEDULE} icon={Calendar} label="Schedule" />
          <NavItem view={ViewState.SETTINGS} icon={Settings} label="Settings" />
        </nav>

        <div className="pt-6 border-t border-slate-800 space-y-4">
          <button 
             onClick={() => setView(ViewState.PRIVACY)}
             className={`flex items-center space-x-2 text-xs hover:text-white transition-colors ${currentView === ViewState.PRIVACY ? 'text-white' : 'text-slate-600'}`}
          >
             <Shield size={12} />
             <span>Privacy Policy</span>
          </button>

          {user ? (
            <div className="flex items-center space-x-3 bg-slate-800/50 p-3 rounded-xl">
              <img src={user.avatarUrl} alt={user.username} className="w-10 h-10 rounded-full border border-slate-600" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.username}</p>
                <p className="text-xs text-green-400">Connected</p>
              </div>
              <button onClick={onLogout} className="text-slate-500 hover:text-red-400">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-500">
              <p>Not connected to Pinterest</p>
              <button onClick={() => setView(ViewState.SETTINGS)} className="text-purple-400 hover:text-purple-300 mt-1">Connect Account</button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Header (Visible only on small screens) */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 border-b border-slate-800 z-50 p-4 flex justify-between items-center">
         <div className="flex items-center space-x-2 text-purple-400">
          <Zap size={24} />
          <span className="font-bold">PinAI</span>
        </div>
        <div className="flex space-x-4">
             <button onClick={() => setView(ViewState.DASHBOARD)} className="text-slate-400"><LayoutDashboard size={20}/></button>
             <button onClick={() => setView(ViewState.GENERATOR)} className="text-slate-400"><PenTool size={20}/></button>
             <button onClick={() => setView(ViewState.SETTINGS)} className="text-slate-400"><Settings size={20}/></button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 md:p-12 mt-14 md:mt-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
            {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;