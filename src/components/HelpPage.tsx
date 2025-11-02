// app/help/page.tsx
import { useState } from "react";
import { helpVideos, HelpVideo } from "@/components/data/helpVideos";
import { VideoShelf } from "@/components/help/VideoShelf";
import { VideoModal } from "@/components/help/VideoModal";
import { HelpCircle } from "lucide-react";

export default function HelpPage() {
  const [selectedVideo, setSelectedVideo] = useState<HelpVideo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = Array.from(new Set(helpVideos.map(v => v.category)));

  const handleVideoClick = (video: HelpVideo) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const getRelatedVideos = (current: HelpVideo) =>
    helpVideos.filter(v => v.category === current.category && v.id !== current.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <section className="relative h-[50vh] min-h-80 max-h-96 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/20 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />

        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500/10 border-2 border-amber-500/20 mb-4">
            <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500" />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight">
            Central de Ajuda
          </h1>
          <p className="mt-3 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Tutoriais e guias completos para você dominar o sistema
          </p>
        </div>
      </section>

      {/* SHELVES — ESPAÇAMENTO FIXO */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-20 sm:space-y-28">
          {categories.map(category => {
            const categoryVideos = helpVideos.filter(v => v.category === category);
            return (
              <VideoShelf
                key={category}
                title={category}
                videos={categoryVideos}
                onVideoClick={handleVideoClick}
              />
            );
          })}
        </div>
      </section>

      {/* MODAL */}
      <VideoModal
        video={selectedVideo}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        relatedVideos={selectedVideo ? getRelatedVideos(selectedVideo) : []}
        onVideoClick={handleVideoClick}
      />
    </div>
  );
}