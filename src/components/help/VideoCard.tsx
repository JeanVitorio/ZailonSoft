// components/help/VideoCard.tsx
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { HelpVideo } from "@/data/helpVideos";

interface Props {
  video: HelpVideo;
  onClick: () => void;
}

export const VideoCard = ({ video, onClick }: Props) => {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className="group focus:outline-none focus:ring-4 focus:ring-primary/30 rounded-xl"
      onClick={onClick}
    >
      <div className="relative w-full h-40 sm:h-44 rounded-xl overflow-hidden bg-card shadow-lg border border-border/50">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <span className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold text-white">
          {video.duration}
        </span>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-2xl">
            <Play className="w-7 h-7 text-primary-foreground fill-current ml-1" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-white font-bold text-sm line-clamp-2 [text-shadow:0_2px_4px_rgb(0_0_0/60%)] group-hover:text-primary">
            {video.title}
          </h3>
        </div>
      </div>
    </motion.button>
  );
};