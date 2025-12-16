import React, { useState } from 'react';
import type { PinSuggestion, PinterestUser } from '../types';
import { generatePinImage } from '../services/geminiService';
import { Image as ImageIcon, Copy, Calendar as CalendarIcon, Download, RefreshCw, Check, Link as LinkIcon, Hash, ExternalLink, CloudLightning } from 'lucide-react';

interface PinEditorProps {
  pin: PinSuggestion;
  onUpdate: (id: string, updates: Partial<PinSuggestion>) => void;
  onSchedule: (id: string, date: string) => void;
  onPublish: (id: string) => void;
  isUserConnected: boolean;
  onShowNotification: (message: string, type: 'success' | 'error') => void;
  user?: PinterestUser | null; // Pass user to access token
}

const PinEditor: React.FC<PinEditorProps> = ({ pin, onUpdate, onSchedule, onPublish, isUserConnected, onShowNotification, user }) => {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(pin.scheduleDate || '');

  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    try {
      const base64 = await generatePinImage(pin.imagePrompt);
      onUpdate(pin.id, { generatedImageBase64: base64 });
    } catch (error) {
      onShowNotification("Failed to generate image.", "error");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSchedule = () => {
    if (scheduleDate) {
      onSchedule(pin.id, scheduleDate);
    }
  };

  const handleSmartPublish = async () => {
      if (!pin.generatedImageBase64) {
          onShowNotification("Please generate an image first.", "error");
          return;
      }

      setIsPublishing(true);

      // Check if we have an API token (Real Integration)
      if (user?.accessToken && user?.boardId) {
          try {
              onShowNotification("Uploading to Pinterest API...", "success");
              
              const res = await fetch('/api/pinterest', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      action: 'create_pin',
                      accessToken: user.accessToken,
                      boardId: user.boardId,
                      pinData: {
                          title: pin.title,
                          description: pin.description,
                          link: pin.destinationLink || 'https://gamingsetupaesthetic.blogspot.com',
                          imageBase64: pin.generatedImageBase64
                      }
                  })
              });

              const data = await res.json();

              if (!res.ok) throw new Error(data.error || "Upload failed");

              onShowNotification("Successfully Published via API!", "success");
              onPublish(pin.id);

          } catch (err: any) {
              console.error("API Publish Error:", err);
              onShowNotification(`API Error: ${err.message}. Switching to Manual.`, "error");
              // Fallback to manual if API fails
              setTimeout(() => handleManualPublish(), 2000);
          } finally {
              setIsPublishing(false);
          }
      } else {
          // Fallback to Manual Flow
          handleManualPublish();
      }
  };

  const handleManualPublish = async () => {
      try {
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${pin.generatedImageBase64}`;
        link.download = `pin-${pin.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        const textToCopy = `${pin.title}\n\n${pin.description}`;
        await navigator.clipboard.writeText(textToCopy);

        onPublish(pin.id);
        onShowNotification("Image downloaded. Opening Pinterest...", "success");
        setIsPublishing(false);

        setTimeout(() => {
            window.open('https://www.pinterest.com/pin-builder/', '_blank');
        }, 1000);

      } catch (err) {
        onShowNotification("Error starting publish flow", "error");
        setIsPublishing(false);
      }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    onShowNotification("Copied to clipboard", "success");
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-lg mb-8 transition-all hover:border-slate-700">
      {/* Left: Image Section */}
      <div className="w-full md:w-1/3 bg-slate-950 relative flex items-center justify-center min-h-[300px] border-b md:border-b-0 md:border-r border-slate-800">
        {pin.generatedImageBase64 ? (
          <div className="relative group w-full h-full">
            <img 
              src={`data:image/png;base64,${pin.generatedImageBase64}`} 
              alt="Generated Pin" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
              <a 
                href={`data:image/png;base64,${pin.generatedImageBase64}`} 
                download={`pin-${pin.id}.png`}
                className="p-3 bg-white text-slate-900 rounded-full hover:bg-slate-200 transition-colors"
                title="Download Image"
              >
                <Download size={20} />
              </a>
              <button 
                onClick={handleGenerateImage}
                className="p-3 bg-white text-slate-900 rounded-full hover:bg-slate-200 transition-colors"
                title="Regenerate"
              >
                <RefreshCw size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
             <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                <ImageIcon size={32} />
             </div>
             <p className="text-slate-400 text-sm mb-4">No image generated yet</p>
             <button
               onClick={handleGenerateImage}
               disabled={isGeneratingImage}
               className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center mx-auto space-x-2"
             >
               {isGeneratingImage ? (
                 <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></span>
               ) : (
                 <RefreshCw size={16} />
               )}
               <span>{isGeneratingImage ? 'Creating...' : 'Generate Image (Nano Banana)'}</span>
             </button>
          </div>
        )}
      </div>

      {/* Right: Content Section */}
      <div className="flex-1 p-6 flex flex-col">
        <div className="flex justify-between items-start mb-4">
           <div className="w-full">
             <input 
                type="text" 
                value={pin.title}
                onChange={(e) => onUpdate(pin.id, { title: e.target.value })}
                className="bg-transparent text-lg font-bold text-white border-b border-transparent hover:border-slate-700 focus:border-purple-500 outline-none w-full pb-1 transition-colors"
             />
             <div className="flex items-center gap-2 mt-2">
                 <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                   pin.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' : 
                   pin.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
                 }`}>
                   {pin.status.toUpperCase()}
                 </span>
                 {pin.boardName && (
                     <span className="text-xs text-slate-500 flex items-center gap-1">
                         to <span className="text-slate-400 font-medium">{pin.boardName}</span>
                     </span>
                 )}
             </div>
           </div>
        </div>

        <div className="space-y-4 flex-1">
          {/* Description */}
          <div className="group relative">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</label>
            <textarea
              value={pin.description}
              onChange={(e) => onUpdate(pin.id, { description: e.target.value })}
              className="w-full bg-slate-800/50 text-slate-300 text-sm mt-1 p-2 rounded border border-transparent focus:border-purple-500 outline-none resize-none h-20"
            />
            <button 
              onClick={() => copyToClipboard(pin.description)}
              className="absolute top-0 right-0 p-1 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Copy size={14} />
            </button>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tags</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {pin.tags.map((tag, idx) => (
                <span key={idx} className="text-xs text-purple-300 bg-purple-900/30 px-2 py-1 rounded-md border border-purple-500/20">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Publishing Settings */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Board</label>
                 <div className="relative">
                    <Hash size={12} className="absolute left-2 top-2.5 text-slate-500"/>
                    <input 
                        type="text" 
                        value={pin.boardName || ''}
                        onChange={(e) => onUpdate(pin.id, { boardName: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded text-xs text-white pl-7 pr-2 py-2 focus:ring-1 focus:ring-purple-500 outline-none"
                        placeholder="Board Name"
                    />
                 </div>
            </div>
            <div>
                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Dest. Link</label>
                 <div className="relative">
                    <LinkIcon size={12} className="absolute left-2 top-2.5 text-slate-500"/>
                    <input 
                        type="text" 
                        value={pin.destinationLink || ''}
                        onChange={(e) => onUpdate(pin.id, { destinationLink: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded text-xs text-white pl-7 pr-2 py-2 focus:ring-1 focus:ring-purple-500 outline-none"
                        placeholder="https://..."
                    />
                 </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-end gap-3">
          <div className="flex-1 w-full md:w-auto">
            <label className="block text-xs text-slate-500 mb-1">Schedule Publishing</label>
            <input 
              type="datetime-local" 
              className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:ring-1 focus:ring-purple-500 outline-none"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              disabled={pin.status === 'published'}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
              <button 
                onClick={handleSchedule}
                disabled={!scheduleDate || pin.status === 'published'}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center space-x-2 transition-all ${
                !scheduleDate || pin.status === 'published'
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
            >
                <CalendarIcon size={16} />
                <span>Save</span>
            </button>
            
            {isUserConnected && pin.status !== 'published' && (
                <button
                    onClick={handleSmartPublish}
                    disabled={isPublishing}
                    className={`flex-1 md:flex-none px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center space-x-2 text-white shadow-lg transition-all ${
                        user?.accessToken 
                            ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/20' 
                            : 'bg-red-600 hover:bg-red-500 shadow-red-900/20'
                    }`}
                >
                    {isPublishing ? (
                        <RefreshCw className="animate-spin" size={16}/>
                    ) : user?.accessToken ? (
                        <CloudLightning size={16}/> 
                    ) : (
                        <ExternalLink size={16}/>
                    )}
                    <span>{user?.accessToken ? 'Auto Publish' : 'Publish Now'}</span>
                </button>
            )}
            
             {pin.status === 'published' && (
                <div className="flex items-center space-x-2 px-4 py-2 bg-green-900/20 text-green-400 rounded-lg text-sm font-medium border border-green-500/20 cursor-default">
                    <Check size={16}/>
                    <span>Published</span>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PinEditor;