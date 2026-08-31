import { AlertTriangle } from 'lucide-react';

const DomainUnavailable = ({ message }: { message?: string }) => (
  <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
    <div className="glass-card rounded-2xl p-8 max-w-md text-center">
      <AlertTriangle className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-white mb-2">Loja indisponível</h1>
      <p className="text-muted-foreground">
        {message || 'Este domínio ainda não está configurado. Entre em contato com a loja.'}
      </p>
    </div>
  </div>
);

export default DomainUnavailable;
