import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Generator from './pages/Generator';
import Settings from './pages/Settings';
import PrivacyPolicy from './pages/PrivacyPolicy';
import { ViewState, type PinSuggestion, type PinterestUser } from './types';
import { Calendar as CalendarIcon, CheckCircle, AlertCircle } from 'lucide-react';

const ScheduleView = ({ pins }: { pins: PinSuggestion[] }) => {
  const scheduled = pins.filter(p => p.status === 'scheduled').sort((a, b) => new Date(a.scheduleDate!).getTime() - new Date(b.scheduleDate!).getTime());

  return (
    <div className="space-y-6">
       <div>
        <h2 className="text-3xl font-bold text-white mb-2">Publishing Schedule</h2>
        <p className="text-slate-400">Your upcoming content calendar.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {scheduled.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No pins scheduled yet.</div>
        ) : (
            <div className="divide-y divide-slate-800">
                {scheduled.map(pin => (
                    <div key={pin.id} className="p-4 flex items-center hover:bg-slate-800/50 transition-colors">
                        <div className="w-16 h-20 bg-slate-800 rounded overflow-hidden flex-shrink-0">
                            {pin.generatedImageBase64 && (
                                <img src={`data:image/png;base64,${pin.generatedImageBase64}`} className="w-full h-full object-cover" />
                            )}
                        </div>
                        <div className="ml-4 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <CalendarIcon size={14} className="text-purple-400" />
                                <span className="text-purple-400 text-sm font-medium">
                                    {new Date(pin.scheduleDate!).toLocaleString()}
                                </span>
                            </div>
                            <h4 className="text-white font-medium">{pin.title}</h4>
                            <p className="text-slate-500 text-sm truncate w-full max-w-md">{pin.description}</p>
                        </div>
                        <div className="hidden md:flex flex-wrap gap-2 max-w-xs justify-end">
                            {pin.tags.slice(0,3).map(t => (
                                <span key={t} className="text-[10px] px-2 py-1 bg-slate-800 text-slate-400 rounded-full">#{t}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  )
};

const App: React.FC = () => {
  // Check URL params OR Path for specific view
  const getInitialView = (): ViewState => {
     if (typeof window !== 'undefined') {
         // 1. Check Path (Preferred for Pinterest verification)
         const path = window.location.pathname.toLowerCase();
         // Matches: /privacy-policy-aesthetic-gaming-setups or just /privacy
         if (path.includes('aesthetic-gaming-setups') || path.includes('/privacy')) {
             return ViewState.PRIVACY;
         }

         // 2. Fallback to Query Params
         const params = new URLSearchParams(window.location.search);
         const viewParam = params.get('view');
         if (viewParam === 'privacy') {
             return ViewState.PRIVACY;
         }
     }
     return ViewState.DASHBOARD;
  };

  const [currentView, setCurrentView] = useState<ViewState>(getInitialView);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // User State with Safe Parsing
  const [user, setUser] = useState<PinterestUser | null>(() => {
    try {
        const saved = localStorage.getItem('gamingPinAi_user');
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        console.error("Failed to parse user data", e);
        return null;
    }
  });

  const [pins, setPins] = useState<PinSuggestion[]>(() => {
    try {
        const saved = localStorage.getItem('gamingPinAi_pins');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error("Failed to parse pins data", e);
        return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('gamingPinAi_pins', JSON.stringify(pins));
  }, [pins]);

  useEffect(() => {
    if (user) {
        localStorage.setItem('gamingPinAi_user', JSON.stringify(user));
    } else {
        localStorage.removeItem('gamingPinAi_user');
    }
  }, [user]);

  const handleSavePin = (updatedPin: PinSuggestion) => {
    setPins(prev => {
      const exists = prev.find(p => p.id === updatedPin.id);
      if (exists) {
        return prev.map(p => p.id === updatedPin.id ? updatedPin : p);
      }
      return [...prev, updatedPin];
    });
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <Layout 
        currentView={currentView} 
        setView={setCurrentView} 
        user={user}
        onLogout={() => setUser(null)}
    >
      {currentView === ViewState.DASHBOARD && (
        <Dashboard 
          pins={pins} 
          navigateToCreate={() => setCurrentView(ViewState.GENERATOR)} 
        />
      )}
      {currentView === ViewState.GENERATOR && (
        <Generator 
            onSavePin={handleSavePin} 
            isUserConnected={!!user}
            onShowNotification={showNotification}
            user={user}
        />
      )}
      {currentView === ViewState.SCHEDULE && (
        <ScheduleView pins={pins} />
      )}
      {currentView === ViewState.SETTINGS && (
        <Settings 
            user={user} 
            onConnect={setUser} 
            onDisconnect={() => setUser(null)} 
        />
      )}
      {currentView === ViewState.PRIVACY && (
        <PrivacyPolicy />
      )}

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
            <div className={`flex items-center space-x-3 px-6 py-4 rounded-xl shadow-2xl border ${
                notification.type === 'success' 
                    ? 'bg-slate-900 border-green-500/50 text-white' 
                    : 'bg-slate-900 border-red-500/50 text-white'
            }`}>
                {notification.type === 'success' ? (
                    <CheckCircle className="text-green-500" size={24} />
                ) : (
                    <AlertCircle className="text-red-500" size={24} />
                )}
                <div>
                    <p className="font-medium text-sm">{notification.message}</p>
                </div>
            </div>
        </div>
      )}
    </Layout>
  );
};

export default App;