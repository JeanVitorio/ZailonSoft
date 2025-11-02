// components/help/VideoShelf.tsx
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { VideoCard } from "./VideoCard";
import { HelpVideo } from "@/data/helpVideos";
import { motion } from "framer-motion";

interface Props {
  title: string;
  videos: HelpVideo[];
  onVideoClick: (video: HelpVideo) => void;
}

export const VideoShelf = ({ title, videos, onVideoClick }: Props) => {
  return (
    <section className="space-y-5">
      <h2 className="px-4 text-2xl sm:text-3xl font-bold text-foreground">
        {title}
      </h2>

      <ScrollArea className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-8 -mx-4 px-4"
        >
          {videos.map((video, i) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex-none w-72 snap-center"
            >
              <VideoCard video={video} onClick={() => onVideoClick(video)} />
            </motion.div>
          ))}
        </motion.div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* ESPAÇO LIVRE ANTES DA PRÓXIMA SEÇÃO */}
      <div className="h-12 sm:h-16" />
    </section>
  );
};