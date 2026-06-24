import { motion } from 'motion/react';
import { ArrowLeft, MapPin, Sliders, Focus, Compass, ChevronLeft, ChevronRight, Share2, Calendar } from 'lucide-react';
import { PhotographyItem } from '../types';

interface PhotographyDetailPageProps {
  photo: PhotographyItem;
  allPhotos: PhotographyItem[];
  onBack: () => void;
  onNavigateToPhoto: (id: string) => void;
}

export default function PhotographyDetailPage({
  photo,
  allPhotos,
  onBack,
  onNavigateToPhoto
}: PhotographyDetailPageProps) {
  // Find index of current photo to enable prev/next navigation
  const currentIndex = allPhotos.findIndex(p => p.id === photo.id);
  const prevPhoto = currentIndex > 0 ? allPhotos[currentIndex - 1] : allPhotos[allPhotos.length - 1];
  const nextPhoto = currentIndex < allPhotos.length - 1 ? allPhotos[currentIndex + 1] : allPhotos[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 relative overflow-hidden"
    >
      {/* Deep blurred backdrop mesh of the photo itself for cinematic atmospheric immersion */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-25">
        <img
          src={photo.imageUrl}
          alt="Atmospheric backdrop blur"
          className="w-full h-full object-cover blur-[150px] scale-150"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-slate-950/85" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 pt-10">
        
        {/* Navigation bar header */}
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-purple-500/35 transition-all text-xs font-mono font-bold group shadow-lg"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            BACK TO GALLERY
          </button>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 font-mono text-[10px] tracking-wider uppercase">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            CINEMATIC ARCHIVE / FRAME {currentIndex + 1}
          </div>
        </div>

        {/* Primary Photographic Split Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT: Visual Showcase Image */}
          <div className="lg:col-span-7 relative flex items-center justify-center">
            {/* Ambient visual shadow bezel background */}
            <div className="absolute inset-2 bg-gradient-to-tr from-purple-500/10 to-blue-500/10 rounded-3xl blur-3xl opacity-60 pointer-events-none" />
            
            <div className="w-full rounded-2xl sm:rounded-3xl border border-slate-800/80 bg-slate-900/40 p-2 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.85)]">
              <div className="relative aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-950">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover select-none transition-transform duration-700 ease-out hover:scale-103"
                />
                {/* Glare glass reflection filter */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
              </div>
            </div>
          </div>

          {/* RIGHT: Floating dynamic metadata card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md shadow-2xl relative space-y-6">
              
              {/* Photo Frame count badge */}
              <div className="absolute -top-3.5 -right-3.5 w-11 h-11 rounded-2xl bg-purple-500/15 border border-purple-500/25 text-purple-400 flex items-center justify-center font-mono text-xs font-bold shadow-md">
                0{currentIndex + 1}
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-sans tracking-tight font-extrabold text-white mb-3">
                  {photo.title}
                </h1>
                
                <p className="text-slate-350 text-xs sm:text-sm leading-relaxed font-normal">
                  {photo.description}
                </p>
              </div>

              {/* Specs & EXIF parameters */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-800/80 pt-5 text-[11px] font-mono">
                <div className="space-y-1">
                  <span className="text-slate-500 uppercase tracking-wider block">Location</span>
                  <span className="text-slate-200 font-semibold flex items-center gap-1.5 break-all">
                    <MapPin size={11} className="text-pink-500 shrink-0" />
                    {photo.location || "Unknown"}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 uppercase tracking-wider block">EXIF Setup</span>
                  <span className="text-slate-200 font-semibold flex items-center gap-1.5 break-all">
                    <Sliders size={11} className="text-purple-400 shrink-0" />
                    {photo.cameraSettings || "f/2.8 | Auto | ISO"}
                  </span>
                </div>
              </div>

              {/* Dynamic lens state indicators */}
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-800/60 text-[10.5px] font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Focus size={13} className="text-amber-500 animate-pulse" />
                  <span>LENS: OPTICAL PRIME</span>
                </div>
                <div className="hidden sm:inline-block w-1.5 h-1.5 bg-slate-800 rounded-full" />
                <div className="flex items-center gap-1.5">
                  <Compass size={13} className="text-blue-400" />
                  <span>STABILIZED ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Quick Next/Prev slide anchors */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-900 bg-slate-900/30 backdrop-blur-sm">
              <span className="text-xs font-mono text-slate-500">QUICK SLIDE</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => prevPhoto.id && onNavigateToPhoto(prevPhoto.id)}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 hover:border-purple-500/20 text-slate-400 hover:text-white transition-all shadow-md flex items-center gap-1 text-[10px] font-mono font-bold"
                  title="Previous Photo"
                >
                  <ChevronLeft size={13} />
                  PREV
                </button>
                <button
                  onClick={() => nextPhoto.id && onNavigateToPhoto(nextPhoto.id)}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 hover:border-purple-500/20 text-slate-400 hover:text-white transition-all shadow-md flex items-center gap-1 text-[10px] font-mono font-bold"
                  title="Next Photo"
                >
                  NEXT
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Story and SEO analysis block */}
        {photo.articleContent && (
          <div className="mt-16 w-full max-w-5xl mx-auto bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 md:p-10 backdrop-blur-md relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500" />
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
              
              {/* Analysis Spec list column */}
              <div className="w-full md:w-1/3 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/60 space-y-3">
                  <h4 className="text-xs font-mono font-bold tracking-widest text-purple-400 uppercase flex items-center gap-2">
                    <Sliders size={12} />
                    TECHNICAL EXIF SPECS
                  </h4>
                  
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between border-b border-slate-950 pb-1.5">
                      <span className="text-slate-500">Aperture:</span>
                      <span className="text-slate-300 font-semibold">{photo.cameraSettings?.split('|')[0]?.trim() || 'f/2.8'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-950 pb-1.5">
                      <span className="text-slate-500">Exposure/Speed:</span>
                      <span className="text-slate-300 font-semibold">{photo.cameraSettings?.split('|')[1]?.trim() || 'Auto'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-950 pb-1.5">
                      <span className="text-slate-500">ISO Rating:</span>
                      <span className="text-slate-300 font-semibold">{photo.cameraSettings?.split('|')[2]?.trim() || 'ISO 100'}</span>
                    </div>
                    {photo.cameraSettings?.split('|')[3] && (
                      <div className="flex justify-between border-b border-slate-950 pb-1.5">
                        <span className="text-slate-500">Focal Length:</span>
                        <span className="text-slate-300 font-semibold">{photo.cameraSettings?.split('|')[3]?.trim()}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-1 text-[10.5px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Calendar size={11} /> DATE CAPTURED:
                      </span>
                      <span className="text-purple-400 font-semibold">
                        {photo.createdAt ? new Date(photo.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SEO-optimized Tags */}
                <div className="p-4 rounded-2xl bg-slate-950/20 border border-slate-900/60 space-y-2">
                  <h5 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">SEO Optimized Meta Tags</h5>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">#OpticalArchive</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">#VisualStorytelling</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">#EXIFMetadata</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">#{photo.title?.replace(/\s+/g, '')}</span>
                  </div>
                </div>
              </div>

              {/* Story Content Column */}
              <div className="w-full md:w-2/3 space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono text-purple-400 tracking-widest uppercase">
                  <span className="inline-block w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  PHOTO ANALYSIS & STORY
                </div>
                
                <h3 className="text-xl sm:text-2xl font-sans font-bold text-white tracking-tight leading-snug">
                  {photo.title}: Camera Settings & Analysis
                </h3>

                <div className="text-slate-300 text-sm sm:text-base leading-relaxed font-sans whitespace-pre-wrap space-y-3 border-t border-slate-800/60 pt-4">
                  {photo.articleContent}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
