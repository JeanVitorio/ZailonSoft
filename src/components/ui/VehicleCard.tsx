import { motion } from 'framer-motion';
import { Calendar, Gauge } from 'lucide-react';
import { Link } from 'react-router-dom';

interface VehicleCardProps {
  vehicle: any;
  index: number;
  catalogMode?: boolean;
}

export function VehicleCard({ vehicle, index, catalogMode }: VehicleCardProps) {
  const formatPrice = (price: any) => {
    // Accept numbers or localized strings like "R$ 12.000,00"
    const parsePrice = (p: any) => {
      if (typeof p === 'number') return p;
      if (typeof p === 'string') {
        const cleaned = p.replace(/R\$\s?/gi, '').replace(/\./g, '').replace(/,/, '.');
        const v = parseFloat(cleaned);
        return Number.isFinite(v) ? v : 0;
      }
      return 0;
    };

    const num = parsePrice(price);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const formatMileage = (km: any) => {
    const num = typeof km === 'number' ? km : parseInt(String(km || 0), 10);
    return new Intl.NumberFormat('pt-BR').format(num) + ' km';
  };

  const nome = vehicle.nome || vehicle.name || 'Veículo';
  const marca = vehicle.marca || (vehicle as any).brand || '';
  const ano = vehicle.ano || (vehicle as any).year || '';
  const preco = vehicle.preco || (vehicle as any).price || 0;
  const quilometragem = (vehicle as any).quilometragem || (vehicle as any).mileage || 0;
  const mainImage = (vehicle.imagens || (vehicle as any).images || [])[0] || 'https://placehold.co/400x300/333/666?text=Sem+Foto';

  const linkTo = catalogMode ? `/veiculo/${vehicle.id}` : `/sistema/veiculo/${vehicle.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link to={linkTo}>
        <div className="glass-card rounded-xl overflow-hidden group cursor-pointer card-hover">
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={mainImage}
              alt={nome}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                VEÍCULO
              </span>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{marca}</p>
              <h3 className="text-lg font-semibold text-slate-50 truncate">{nome}</h3>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{ano}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Gauge className="w-4 h-4" />
                <span>{formatMileage(quilometragem)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <p className="text-xl font-bold text-amber-400">{formatPrice(preco)}</p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default VehicleCard;
