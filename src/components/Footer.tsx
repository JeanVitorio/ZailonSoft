import { whatsappLink } from "./WhatsappFloat";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/30 py-12">
      <div className="container-wide">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <a href="#top" className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="JVS Logo"
                className="h-8 w-8 rounded-md object-cover"
              />
              <span className="font-display text-lg">
                JVS<span className="text-primary"> Soluções</span>
              </span>
            </a>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Sites e sistemas sob medida focados em conversão. Construímos
              máquinas que vendem todos os dias.
            </p>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Navegação
            </div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><a href="#servicos" className="hover:text-primary">Serviços</a></li>
              <li><a href="#processo" className="hover:text-primary">Processo</a></li>
              <li><a href="#cases" className="hover:text-primary">Cases</a></li>
              <li><a href="#faq" className="hover:text-primary">FAQ</a></li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Contato
            </div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  WhatsApp · (46) 99116-3405
                </a>
              </li>
              <li>Atendimento online · Brasil</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 md:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} JVS Soluções. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            Sites e sistemas que vendem.
          </p>
        </div>
      </div>
    </footer>
  );
};
