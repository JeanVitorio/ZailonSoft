// components/help/VideoModal.tsx
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { HelpVideo } from "@/data/helpVideos";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  video: HelpVideo | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VideoModal = ({ video, isOpen, onClose }: Props) => {
  if (!video) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="modal-fullscreen p-0">
        {/* BOTÃO X NO CANTO */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-4 top-4 z-50 h-12 w-12 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm"
        >
          <X className="h-8 w-8" />
        </Button>

        {/* VÍDEO PURINHO – TELA INTEIRA */}
        <video
          key={video.id}
          src={video.videoUrl}
          controls
          autoPlay
          playsInline
          preload="auto"
          poster={video.thumbnailUrl}
          className="w-full h-dvh object-contain bg-black"
        >
          Seu navegador não suporta vídeo.
        </video>
      </DialogContent>
    </Dialog>
  );
};