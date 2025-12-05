import React, { useState } from 'react';
import { Header } from './components/Header';
import { ImageUpload } from './components/ImageUpload';
import { fusionJersey } from './services/gemini';
import { Sparkles, Download, Loader2, Palette, Image as ImageIcon, Camera } from 'lucide-react';

const FILTERS = [
  { name: 'Original', style: 'none' },
  { name: 'Mono', style: 'grayscale(100%)' },
  { name: 'Sepia', style: 'sepia(100%)' },
  { name: 'Retro', style: 'sepia(50%) contrast(110%) saturate(80%)' },
  { name: 'Vivid', style: 'saturate(150%) contrast(110%)' },
  { name: 'Soft', style: 'brightness(110%) contrast(90%) saturate(90%)' },
  { name: 'Dramatic', style: 'contrast(140%) brightness(90%)' },
];

const SHOT_TYPES = [
  { id: 'original', name: 'Original Framing', prompt: 'Maintain the exact framing and composition of the original player image.' },
  { id: 'extreme_close_up', name: 'Extreme Close-Up', prompt: 'An extreme close-up focusing intensely on the jersey fabric texture, the badge, and the player\'s face.' },
  { id: 'close_up', name: 'Close-Up', prompt: 'A close-up shot focusing on the chest, shoulders and head, highlighting the jersey details and player expression.' },
  { id: 'portrait', name: 'Portrait (Head & Shoulders)', prompt: 'Standard portrait shot, focusing on the head and upper shoulders. High detail on the face and collar.' },
  { id: 'waist', name: 'Waist-Up (Medium Shot)', prompt: 'Medium shot, framing the player from the waist up to show the jersey clearly.' },
  { id: 'knee', name: 'Knee-Up (American Shot)', prompt: 'American shot (plan américain), framing the player from the knees up.' },
  { id: 'full', name: 'Full Body', prompt: 'Wide shot showing the full body of the player including legs and feet.' },
  { id: 'wide', name: 'Wide / Long Shot', prompt: 'A wide angle long shot capturing the player and a significant amount of the surrounding environment.' },
  { id: 'low_angle', name: 'Low Angle (Heroic)', prompt: 'Camera placed low looking up at the player, creating a heroic and imposing stature.' },
  { id: 'high_angle', name: 'High Angle', prompt: 'Camera placed high looking down, providing a unique perspective on the player and kit.' },
  { id: 'three_quarter', name: '3/4 Angle', prompt: 'A 3/4 angle view of the player, adding depth to the stance.' },
  { id: 'action', name: 'Dynamic Action', prompt: 'Dynamic action shot with motion blur, tilted angle, and an athletic pose.' },
];

const SCENES = [
  { id: 'original', name: 'Original Background', prompt: 'Keep the background exactly as it is in the player image.' },
  { id: 'stadium', name: 'Stadium Night', prompt: 'Blurred soccer stadium background at night with floodlights, lens flare, and atmospheric crowd.' },
  { id: 'training', name: 'Training Pitch', prompt: 'Sunny professional training ground, green natural grass, blue sky, depth of field.' },
  { id: 'street', name: 'Urban Street', prompt: 'Urban street football court, concrete surface, chain-link fence, graffiti, dramatic daylight.' },
  { id: 'locker', name: 'Locker Room', prompt: 'Professional stadium locker room context, benches, jerseys hanging, artificial indoor lighting.' },
  { id: 'studio_backlight', name: 'Studio Dark Mode', prompt: 'Professional photo studio setting with dramatic backlight and rim lighting. Dark moody atmosphere.' },
  { id: 'studio_neon', name: 'Neon / Cyberpunk', prompt: 'Futuristic studio lighting with vibrant pink and blue neon rim lights, high contrast.' },
  { id: 'studio_soft', name: 'Soft Studio White', prompt: 'High-key fashion photography style, soft even lighting, clean white or light grey background.' },
  { id: 'golden_hour', name: 'Golden Hour', prompt: 'Outdoor setting, warm sunset light (golden hour), artistic lens flare, soft background bokeh.' },
];

const App: React.FC = () => {
  const [playerImage, setPlayerImage] = useState<{ data: string; mime: string } | null>(null);
  const [jerseyImage, setJerseyImage] = useState<{ data: string; mime: string } | null>(null);
  // Default prompt based on user request in French
  const [prompt, setPrompt] = useState<string>("Make the player in the first image wear the jersey from the second image. The jersey is the orange Ivory Coast kit. Ensure the fit is realistic with wrinkles and lighting matching the player's scene. Also, change the player's shorts to be white.");
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('Original');
  const [selectedScene, setSelectedScene] = useState<string>(SCENES[0].id);
  const [selectedShot, setSelectedShot] = useState<string>(SHOT_TYPES[0].id);

  const handleGenerate = async () => {
    if (!playerImage || !jerseyImage) return;

    setLoading(true);
    setError(null);
    setResultImage(null);
    setActiveFilter('Original'); // Reset filter on new generation

    try {
      const sceneInstruction = SCENES.find(s => s.id === selectedScene)?.prompt || '';
      const shotInstruction = SHOT_TYPES.find(s => s.id === selectedShot)?.prompt || '';
      
      const fullPrompt = `${prompt} \n\nFraming/Shot Instruction: ${shotInstruction} \n\nBackground/Scene Instruction: ${sceneInstruction}`;

      const result = await fusionJersey(
        playerImage.data,
        jerseyImage.data,
        fullPrompt,
        playerImage.mime,
        jerseyImage.mime
      );
      setResultImage(result);
    } catch (err: any) {
      setError(err.message || "Something went wrong during generation.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      if (ctx) {
        // Apply the active CSS filter to the canvas context
        const filterStyle = FILTERS.find(f => f.name === activeFilter)?.style || 'none';
        ctx.filter = filterStyle;
        
        ctx.drawImage(img, 0, 0);
        
        const link = document.createElement('a');
        link.download = `jersey-fusion-${activeFilter.toLowerCase()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    };
    img.src = resultImage;
  };

  const isReady = playerImage && jerseyImage && prompt.length > 0;
  const currentFilterStyle = FILTERS.find(f => f.name === activeFilter)?.style || 'none';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow w-full max-w-6xl mx-auto px-6 py-8">
        
        {/* Top Section: Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-9 gap-8 items-start mb-12">
          
          {/* Player Input */}
          <div className="lg:col-span-3">
            <ImageUpload 
              label="1. Player Image" 
              selectedImage={playerImage?.data ? `data:${playerImage.mime};base64,${playerImage.data}` : null} 
              onImageSelect={(data, mime) => setPlayerImage({ data, mime })}
              onClear={() => setPlayerImage(null)}
            />
             <p className="mt-2 text-xs text-slate-500 text-center">The person to dress up</p>
          </div>

          {/* Arrow / Plus */}
          <div className="hidden lg:flex lg:col-span-1 h-[200px] flex-col items-center justify-center text-slate-600">
             <div className="w-px h-full bg-slate-800 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 p-2 rounded-full border border-slate-700">
                    <span className="text-2xl font-light text-slate-400">+</span>
                </div>
             </div>
          </div>

          {/* Jersey Input */}
          <div className="lg:col-span-3">
            <ImageUpload 
              label="2. Jersey / Kit Image" 
              selectedImage={jerseyImage?.data}
              onImageSelect={(data, mime) => setJerseyImage({ data, mime })}
              onClear={() => setJerseyImage(null)}
            />
            <p className="mt-2 text-xs text-slate-500 text-center">The kit to apply</p>
          </div>

          {/* Controls */}
          <div className="lg:col-span-2 flex flex-col justify-start gap-4 pt-8 lg:pt-0 h-full">
             
             {/* Shot Selection */}
             <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2 mb-3 text-slate-400">
                    <Camera size={16} />
                    <span className="text-xs font-semibold uppercase tracking-wider">Framing / Shot</span>
                </div>
                <div className="space-y-1 max-h-[150px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
                    {SHOT_TYPES.map(shot => (
                        <button
                            key={shot.id}
                            onClick={() => setSelectedShot(shot.id)}
                            className={`
                                w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between
                                ${selectedShot === shot.id 
                                    ? 'bg-blue-500/20 text-blue-200 border border-blue-500/50' 
                                    : 'bg-slate-900/50 text-slate-400 hover:bg-slate-700 border border-transparent'}
                            `}
                        >
                            <span className="truncate">{shot.name}</span>
                            {selectedShot === shot.id && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />}
                        </button>
                    ))}
                </div>
             </div>

             {/* Scene Selection */}
             <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2 mb-3 text-slate-400">
                    <ImageIcon size={16} />
                    <span className="text-xs font-semibold uppercase tracking-wider">Scene / Background</span>
                </div>
                <div className="space-y-1 max-h-[150px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
                    {SCENES.map(scene => (
                        <button
                            key={scene.id}
                            onClick={() => setSelectedScene(scene.id)}
                            className={`
                                w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between
                                ${selectedScene === scene.id 
                                    ? 'bg-orange-500/20 text-orange-200 border border-orange-500/50' 
                                    : 'bg-slate-900/50 text-slate-400 hover:bg-slate-700 border border-transparent'}
                            `}
                        >
                            <span className="truncate">{scene.name}</span>
                            {selectedScene === scene.id && <div className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />}
                        </button>
                    ))}
                </div>
             </div>

             <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Custom Prompt
                </label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full h-20 bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none"
                  placeholder="Describe how to merge..."
                />
             </div>
             
             <button 
                onClick={handleGenerate}
                disabled={!isReady || loading}
                className={`
                  w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg
                  ${isReady && !loading
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white shadow-orange-900/20 hover:scale-[1.02]' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}
                `}
             >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Fusing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>Generate Fusion</span>
                  </>
                )}
             </button>
          </div>
        </div>

        {/* Results Section */}
        {error && (
            <div className="mb-8 p-4 bg-red-900/20 border border-red-800 rounded-xl text-red-200 text-center text-sm">
                {error}
            </div>
        )}

        <div className="relative border-t border-slate-800 pt-12 min-h-[400px]">
            <h2 className="text-center text-xl font-semibold text-white mb-8">Result</h2>
            
            <div className="flex flex-col items-center">
                {resultImage ? (
                   <div className="w-full max-w-2xl flex flex-col items-center animate-in fade-in duration-700">
                      <div className="relative group w-full mb-6">
                          <img 
                            src={resultImage} 
                            alt="Generated Result" 
                            style={{ filter: currentFilterStyle }}
                            className="w-full rounded-2xl shadow-2xl border border-slate-700 transition-all duration-300"
                          />
                          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                                onClick={handleDownload}
                                className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-lg border border-white/20 transition-all shadow-lg hover:scale-105"
                                title="Download with Filter"
                             >
                                <Download size={20} />
                             </button>
                          </div>
                      </div>

                      {/* Filter Controls */}
                      <div className="w-full bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3 text-slate-400 text-sm font-medium">
                            <Palette size={16} />
                            <span>Apply Filters</span>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                            {FILTERS.map((filter) => (
                                <button
                                    key={filter.name}
                                    onClick={() => setActiveFilter(filter.name)}
                                    className={`
                                        px-4 py-2 rounded-lg text-sm font-medium transition-all
                                        ${activeFilter === filter.name 
                                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25 scale-105' 
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'}
                                    `}
                                >
                                    {filter.name}
                                </button>
                            ))}
                        </div>
                      </div>
                   </div>
                ) : (
                    <div className="w-full max-w-lg aspect-square rounded-2xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-600 bg-slate-900/30">
                        {loading ? (
                           <div className="text-center animate-pulse">
                              <div className="w-16 h-16 rounded-full bg-slate-700 mx-auto mb-4"></div>
                              <p>Analyzing morphology...</p>
                              <p className="text-xs mt-2 text-slate-500">Processing pixels</p>
                           </div>
                        ) : (
                           <>
                             <div className="p-6 bg-slate-800/50 rounded-full mb-4">
                               <Sparkles size={32} className="text-slate-700" />
                             </div>
                             <p>Your creation will appear here</p>
                           </>
                        )}
                    </div>
                )}
            </div>
        </div>

      </main>
    </div>
  );
};

export default App;