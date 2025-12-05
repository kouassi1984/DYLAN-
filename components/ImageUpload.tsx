import React, { ChangeEvent, useState, useRef, useEffect } from 'react';
import { Upload, X, Camera, RefreshCw } from 'lucide-react';

interface ImageUploadProps {
  label: string;
  onImageSelect: (base64: string, mimeType: string) => void;
  selectedImage: string | null;
  onClear: () => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ label, onImageSelect, selectedImage, onClear }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Extract base64 and mime type
      const match = result.match(/^data:(.*);base64,(.*)$/);
      if (match) {
        onImageSelect(match[2], match[1]); // Content, MimeType
      }
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setIsCameraOpen(true);
      // Wait for React to render the video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      let msg = "Could not access camera.";
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = "Camera permission denied. Please allow access in your browser settings.";
      } else if (err.name === 'NotFoundError') {
        msg = "No camera device found.";
      }
      setCameraError(msg);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && videoRef.current.readyState === 4) {
      const canvas = document.createElement('canvas');
      // Set canvas size to match video stream resolution
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        
        const dataUrl = canvas.toDataURL('image/jpeg');
        const match = dataUrl.match(/^data:(.*);base64,(.*)$/);
        if (match) {
          onImageSelect(match[2], match[1]);
          stopCamera();
        }
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
       if (streamRef.current) {
         streamRef.current.getTracks().forEach(track => track.stop());
       }
    };
  }, []);

  // Construct valid source for preview
  // If selectedImage is already a data URL, use it. If it's just base64, prepend jpeg header.
  const imageSrc = selectedImage?.startsWith('data:') 
    ? selectedImage 
    : `data:image/jpeg;base64,${selectedImage}`;

  return (
    <div className="flex flex-col gap-2 w-full">
      <span className="text-sm font-medium text-gray-300 uppercase tracking-wider">{label}</span>
      
      {selectedImage ? (
        <div className="relative group w-full aspect-[3/4] bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-lg">
          <img 
            src={imageSrc} 
            alt="Uploaded preview" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              onClick={onClear}
              className="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full backdrop-blur-sm transition-transform hover:scale-110"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ) : isCameraOpen && !cameraError ? (
        <div className="relative w-full aspect-[3/4] bg-black rounded-xl overflow-hidden border border-slate-700 flex flex-col items-center justify-center">
             <video 
               ref={videoRef} 
               autoPlay 
               playsInline 
               muted 
               className="w-full h-full object-cover" 
             />
             <div className="absolute bottom-4 flex items-center gap-4 z-10">
               <button 
                 onClick={stopCamera}
                 className="p-3 bg-red-500/80 hover:bg-red-600 text-white rounded-full backdrop-blur-sm transition-transform hover:scale-110"
                 title="Cancel"
               >
                 <X size={24} />
               </button>
               <button 
                 onClick={capturePhoto}
                 className="p-4 bg-white hover:bg-slate-200 text-black rounded-full shadow-lg transition-transform hover:scale-105 border-4 border-slate-300/50"
                 title="Take Photo"
               >
                 <Camera size={32} />
               </button>
             </div>
        </div>
      ) : (
        <label 
          className={`
            relative w-full aspect-[3/4] flex flex-col items-center justify-center 
            rounded-xl border-2 border-dashed transition-all cursor-pointer
            ${isDragging ? 'border-orange-500 bg-orange-500/10' : 'border-slate-700 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800'}
          `}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files?.[0]) {
              processFile(e.dataTransfer.files[0]);
            }
          }}
        >
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="hidden" 
          />
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <div className="p-4 rounded-full bg-slate-800 shadow-inner mb-2">
              <Upload size={24} />
            </div>
            <p className="text-sm font-medium">Click or Drop Image</p>
            
            <div className="flex items-center gap-2 w-full px-12 opacity-40 my-1">
               <div className="h-px bg-slate-500 flex-1"></div>
               <span className="text-[10px] uppercase font-bold text-slate-500">OR</span>
               <div className="h-px bg-slate-500 flex-1"></div>
            </div>

            <button
               onClick={(e) => {
                 e.preventDefault();
                 e.stopPropagation();
                 startCamera();
               }}
               className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-600 z-10"
            >
              <Camera size={18} />
              <span className="text-xs font-bold uppercase">Use Camera</span>
            </button>
            {cameraError && (
              <div className="flex flex-col items-center mt-2 gap-2 z-20">
                <p className="text-xs text-red-400 max-w-[200px] text-center px-2">{cameraError}</p>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    startCamera();
                  }}
                  className="flex items-center gap-1 text-[10px] bg-red-900/50 text-red-200 px-2 py-1 rounded hover:bg-red-900/80 transition"
                >
                  <RefreshCw size={10} /> Retry
                </button>
              </div>
            )}
          </div>
        </label>
      )}
    </div>
  );
};