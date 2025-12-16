import React, { useState } from 'react';
import InputSection from '../components/InputSection';
import PinEditor from '../components/PinEditor';
import type { BlogPostInput, PinSuggestion, PinterestUser } from '../types';
import { generatePinStrategy } from '../services/geminiService';

const simpleId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

interface GeneratorProps {
  onSavePin: (pin: PinSuggestion) => void;
  isUserConnected: boolean;
  onShowNotification: (message: string, type: 'success' | 'error') => void;
  user?: PinterestUser | null; // Add user prop
}

const Generator: React.FC<GeneratorProps> = ({ onSavePin, isUserConnected, onShowNotification, user }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPins, setGeneratedPins] = useState<PinSuggestion[]>([]);

  const handleGenerate = async (input: BlogPostInput) => {
    setIsLoading(true);
    setGeneratedPins([]); // Clear previous
    try {
      const strategies = await generatePinStrategy(input.title, input.summary);
      
      const newPins: PinSuggestion[] = strategies.map(s => ({
        ...s,
        id: simpleId(),
        status: 'draft',
        destinationLink: input.url,
        boardName: input.boardName || 'Gaming Aesthetic', // Default fallback
      }));

      setGeneratedPins(newPins);
      // Automatically save drafts to global state
      newPins.forEach(p => onSavePin(p));
    } catch (error) {
      alert("Failed to generate pin strategies. Check API Key or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePin = (id: string, updates: Partial<PinSuggestion>) => {
    setGeneratedPins(prev => prev.map(p => {
        if (p.id === id) {
            const updated = { ...p, ...updates };
            onSavePin(updated); // Sync with global state
            return updated;
        }
        return p;
    }));
  };

  const handleSchedulePin = (id: string, date: string) => {
      handleUpdatePin(id, { scheduleDate: date, status: 'scheduled' });
      onShowNotification("Pin scheduled successfully!", "success");
  };
  
  const handlePublishPin = (id: string) => {
      handleUpdatePin(id, { status: 'published' });
  };

  return (
    <div className="space-y-10 pb-20">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Create New Pins</h2>
        <p className="text-slate-400">Generate aesthetic pin ideas and images for your latest blog post.</p>
      </div>

      <InputSection onGenerate={handleGenerate} isLoading={isLoading} />

      {generatedPins.length > 0 && (
        <div className="space-y-6 animate-fade-in-up">
           <div className="flex items-center justify-between border-b border-slate-800 pb-4">
             <h3 className="text-xl font-bold text-white">Generated Concepts</h3>
             <span className="text-sm text-slate-500">{generatedPins.length} variations</span>
           </div>
           
           <div className="grid grid-cols-1 gap-8">
             {generatedPins.map(pin => (
               <PinEditor 
                 key={pin.id} 
                 pin={pin} 
                 onUpdate={handleUpdatePin} 
                 onSchedule={handleSchedulePin}
                 onPublish={handlePublishPin}
                 isUserConnected={isUserConnected}
                 onShowNotification={onShowNotification}
                 user={user} // Pass user down
               />
             ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default Generator;