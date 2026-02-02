import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Eye, Play, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Vehicle } from '@/data/vehicles';
import { formatPrice } from '@/lib/formatters';

interface VehiclePostCardProps {
  vehicle: Vehicle;
  index?: number;
}

export const VehiclePostCard: React.FC<VehiclePostCardProps> = ({ vehicle, index = 0 }) => {
  const hasVideo = !!vehicle.videoUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.2, 0, 0, 1]
      }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group"
    >
      <Link to={`/veiculo/${vehicle.id}`}>
        <div className="post-card cursor-pointer">
          {/* Image/Video Container */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={vehicle.images[0]}
              alt={vehicle.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Video Icon */}
            {hasVideo && (
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:bg-amber-500/20 group-hover:border-amber-500/40 transition-all">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
            )}

            {/* Status Badge */}
            {vehicle.status !== 'available' && (
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  vehicle.status === 'reserved' 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {vehicle.status === 'reserved' ? 'Reservado' : 'Vendido'}
                </span>
              </div>
            )}

            {/* Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/70 font-medium">
                  {vehicle.brand} • {vehicle.year}
                </span>
                <div className="flex items-center gap-3 text-xs text-white/60">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {vehicle.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {vehicle.likes}
                  </span>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                {vehicle.name}
              </h3>
              
              <div className="flex items-center justify-between">
                <span className="price-tag text-sm">
                  {formatPrice(vehicle.price)}
                </span>
                <motion.div
                  initial={{ x: -5, opacity: 0 }}
                  whileHover={{ x: 0, opacity: 1 }}
                  className="flex items-center text-amber-400 text-sm font-medium"
                >
                  Ver detalhes
                  <ChevronRight className="w-4 h-4 ml-1" />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
