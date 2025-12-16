import React from 'react';
import type { PinSuggestion } from '../types';
import { TrendingUp, Clock, CheckCircle } from 'lucide-react';

interface DashboardProps {
  pins: PinSuggestion[];
  navigateToCreate: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ pins, navigateToCreate }) => {
  const scheduledCount = pins.filter(p => p.status === 'scheduled').length;
  const draftCount = pins.filter(p => p.status === 'draft').length;
  
  // Sort scheduled pins by date
  const upcomingPins = pins
    .filter(p => p.status === 'scheduled' && p.scheduleDate)
    .sort((a, b) => new Date(a.scheduleDate!).getTime() - new Date(b.scheduleDate!).getTime())
    .slice(0, 3);

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
        <div className={`p-2 rounded-lg bg-${color}-900/20 text-${color}-400`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Dashboard</h2>
          <p className="text-slate-400 mt-1">Overview of your Pinterest automation</p>
        </div>
        <button 
          onClick={navigateToCreate}
          className="bg-white text-slate-900 px-6 py-2.5 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
        >
          Create New Pins
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Scheduled Pins" value={scheduledCount} icon={Clock} color="purple" />
        <StatCard title="Drafts" value={draftCount} icon={TrendingUp} color="blue" />
        <StatCard title="Total Generated" value={pins.length} icon={CheckCircle} color="green" />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Upcoming Schedule</h3>
        {upcomingPins.length > 0 ? (
          <div className="space-y-4">
            {upcomingPins.map(pin => (
              <div key={pin.id} className="flex items-center p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                 <div className="h-12 w-12 rounded-lg bg-slate-700 overflow-hidden flex-shrink-0">
                    {pin.generatedImageBase64 ? (
                        <img src={`data:image/png;base64,${pin.generatedImageBase64}`} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">No Img</div>
                    )}
                 </div>
                 <div className="ml-4 flex-1">
                    <h4 className="text-white font-medium truncate">{pin.title}</h4>
                    <p className="text-slate-400 text-sm">
                        {new Date(pin.scheduleDate!).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                    </p>
                 </div>
                 <span className="px-3 py-1 bg-green-900/30 text-green-400 text-xs rounded-full border border-green-500/20">
                    Ready
                 </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <p>No pins scheduled yet.</p>
            <button onClick={navigateToCreate} className="text-purple-400 hover:text-purple-300 text-sm mt-2">Start creating</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;