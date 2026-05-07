import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Plus, Search, RefreshCw, Trash2, KeyRound, Save, ShieldCheck, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/services/supabaseClient';
import { toast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';

interface LojaRow {
  id: string;
  slug: string;
  nome: string;
  email: string | null;
  telefone_principal: string | null;
  user_id: string | null;
  logo_url: string | null;
  created_at: string;
  subscription: { status: string; current_period_end: string | null; plan: string | null } | null;
}

const LS_KEY = 'ac-admin-key';

const callAdmin = async (key: string, body: any) => {
  const { data, error } = await supabase.functions.invoke('admin-stores', {
    body,
    headers: { 'x-admin-key': key },
  });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data;
};

const AdminMaster: React.FC = () => {
  const [adminKey, setAdminKey] = useState<string>(() => localStorage.getItem(LS_KEY) || '');
  const [authed, setAuthed] = useState<boolean>(!!localStorage.getItem(LS_KEY));
  const [keyInput, setKeyInput] = useState('');

  const [lojas, setLojas] = useState<LojaRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<LojaRow | null>(null);

  const load = async () => {
    if (!adminKey) return;
    setLoading(true);
    try {
      const data = await callAdmin(adminKey, { action: 'list' });
      setLojas(data.lojas || []);
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
      if (e.message?.toLowerCase().includes('autoriz')) {
        localStorage.removeItem(LS_KEY);
        setAuthed(false);
        setAdminKey('');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed && adminKey) load();
    // eslint-disable-next-line
  }, [authed]);

  const filtered = useMemo(
    () =>
      lojas.filter(
        (l) =>
          !search ||
          l.nome?.toLowerCase().includes(search.toLowerCase()) ||
          l.email?.toLowerCase().includes(search.toLowerCase()) ||
          l.slug?.toLowerCase().includes(search.toLowerCase()),
      ),
    [lojas, search],
  );

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md glass-card rounded-3xl p-8"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground text-center mb-2">Painel Master</h1>
          <p className="text-muted-foreground text-center mb-6 text-sm">
            Acesso restrito. Informe a chave de administrador.
          </p>
          <div className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Chave de admin"
                className="pl-11"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && keyInput) {
                    localStorage.setItem(LS_KEY, keyInput);
                    setAdminKey(keyInput);
                    setAuthed(true);
                  }
                }}
              />
            </div>
            <Button
              variant="premium"
              className="w-full"
              disabled={!keyInput}
              onClick={() => {
                localStorage.setItem(LS_KEY, keyInput);
                setAdminKey(keyInput);
                setAuthed(true);
              }}
            >
              Entrar
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-amber-400" /> Painel Master
            </h1>
            <p className="text-sm text-muted-foreground">Gestão de lojas e assinaturas</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Atualizar
            </Button>
            <Button variant="premium" size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4" /> Nova Loja
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                localStorage.removeItem(LS_KEY);
                setAuthed(false);
                setAdminKey('');
              }}
            >
              Sair
            </Button>
          </div>
        </header>

        <div className="glass-card rounded-2xl p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, slug ou email…"
              className="pl-11"
            />
          </div>
        </div>

        <div className="grid gap-3">
          {filtered.map((l) => {
            const status = l.subscription?.status || 'sem_assinatura';
            const statusColor =
              status === 'active'
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : status === 'pending_payment'
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                : 'bg-red-500/15 text-red-400 border-red-500/30';
            return (
              <motion.div
                key={l.id}
                layout
                className="glass-card rounded-2xl p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground truncate">{l.nome}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor}`}>
                      {status}
                    </span>
                    {l.subscription?.plan && (
                      <span className="text-xs px-2 py-0.5 rounded-full border border-white/10 text-muted-foreground">
                        {l.subscription.plan}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    /{l.slug} · {l.email || 'sem email'} · {l.telefone_principal || 'sem tel'}
                  </p>
                  {l.subscription?.current_period_end && (
                    <p className="text-xs text-muted-foreground">
                      Expira em: {new Date(l.subscription.current_period_end).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <a href={`/loja/${l.slug}`} target="_blank" rel="noreferrer">
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                  <Button variant="outline" size="sm" onClick={() => setEditing(l)}>
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      if (!confirm(`Excluir loja "${l.nome}"? Isso remove dados e usuário.`)) return;
                      try {
                        await callAdmin(adminKey, { action: 'delete', loja_id: l.id, user_id: l.user_id });
                        toast({ title: 'Loja excluída' });
                        load();
                      } catch (e: any) {
                        toast({ title: 'Erro', description: e.message, variant: 'destructive' });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
          {!loading && filtered.length === 0 && (
            <div className="glass-card rounded-2xl p-8 text-center text-muted-foreground">
              Nenhuma loja encontrada.
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <CreateStoreModal
          adminKey={adminKey}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}
      {editing && (
        <EditStoreModal
          adminKey={adminKey}
          loja={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
};

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
    {children}
  </div>
);

const CreateStoreModal: React.FC<{
  adminKey: string;
  onClose: () => void;
  onCreated: () => void;
}> = ({ adminKey, onClose, onCreated }) => {
  const [form, setForm] = useState({
    store_name: '',
    slug: '',
    email: '',
    password: '',
    phone: '',
    owner_name: '',
    access_days: '7',
    status: 'active',
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      await callAdmin(adminKey, { action: 'create', ...form });
      toast({ title: 'Loja criada com sucesso!' });
      onCreated();
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Nova Loja</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Nome da Loja *">
            <Input value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} />
          </Field>
          <Field label="Slug (opcional, gerado automaticamente)">
            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="ex: minha-loja" />
          </Field>
          <Field label="Email de login *">
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Senha *">
            <Input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="mínimo 6 caracteres" />
          </Field>
          <Field label="Telefone">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Proprietário">
            <Input value={form.owner_name} onChange={(e) => setForm({ ...form, owner_name: e.target.value })} />
          </Field>
          <Field label="Período de acesso">
            <select
              value={form.access_days}
              onChange={(e) => setForm({ ...form, access_days: e.target.value })}
              className="w-full h-12 px-4 rounded-xl bg-card border border-border text-foreground"
            >
              <option value="3">3 dias</option>
              <option value="7">7 dias</option>
              <option value="15">15 dias</option>
              <option value="30">30 dias (1 mês)</option>
              <option value="90">90 dias (3 meses)</option>
              <option value="365">365 dias (1 ano)</option>
              <option value="full">Full (sem expiração)</option>
            </select>
          </Field>
          <Field label="Status da assinatura">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full h-12 px-4 rounded-xl bg-card border border-border text-foreground"
            >
              <option value="active">Ativo (pago)</option>
              <option value="pending_payment">Pendente</option>
              <option value="canceled">Cancelado</option>
            </select>
          </Field>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="premium" disabled={saving || !form.store_name || !form.email || !form.password} onClick={submit}>
            <Save className="w-4 h-4" />
            {saving ? 'Criando…' : 'Criar Loja'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

const EditStoreModal: React.FC<{
  adminKey: string;
  loja: LojaRow;
  onClose: () => void;
  onSaved: () => void;
}> = ({ adminKey, loja, onClose, onSaved }) => {
  const [form, setForm] = useState({
    nome: loja.nome,
    slug: loja.slug,
    email: loja.email || '',
    telefone_principal: loja.telefone_principal || '',
  });
  const [sub, setSub] = useState({
    status: loja.subscription?.status || 'active',
    access_days: 'full',
  });
  const [newPwd, setNewPwd] = useState('');

  const saveLoja = async () => {
    try {
      await callAdmin(adminKey, { action: 'update_loja', loja: { id: loja.id, ...form } });
      toast({ title: 'Loja atualizada' });
      onSaved();
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    }
  };

  const saveSub = async () => {
    if (!loja.user_id) return;
    try {
      await callAdmin(adminKey, {
        action: 'update_subscription',
        user_id: loja.user_id,
        status: sub.status,
        access_days: sub.access_days,
      });
      toast({ title: 'Assinatura atualizada' });
      onSaved();
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    }
  };

  const resetPwd = async () => {
    if (!loja.user_id || !newPwd) return;
    try {
      await callAdmin(adminKey, { action: 'reset_password', user_id: loja.user_id, new_password: newPwd });
      toast({ title: 'Senha redefinida' });
      setNewPwd('');
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Editar Loja</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-sm font-semibold text-foreground mb-2">Dados da loja</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <Field label="Nome">
            <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </Field>
          <Field label="Slug">
            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </Field>
          <Field label="Email">
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Telefone">
            <Input
              value={form.telefone_principal}
              onChange={(e) => setForm({ ...form, telefone_principal: e.target.value })}
            />
          </Field>
        </div>
        <Button variant="premium" size="sm" onClick={saveLoja}>
          <Save className="w-4 h-4" /> Salvar dados
        </Button>

        <div className="h-px bg-border my-6" />

        <h3 className="text-sm font-semibold text-foreground mb-2">Assinatura / acesso</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <Field label="Status">
            <select
              value={sub.status}
              onChange={(e) => setSub({ ...sub, status: e.target.value })}
              className="w-full h-12 px-4 rounded-xl bg-card border border-border text-foreground"
            >
              <option value="active">Ativo</option>
              <option value="pending_payment">Pendente</option>
              <option value="canceled">Cancelado</option>
            </select>
          </Field>
          <Field label="Renovar acesso por">
            <select
              value={sub.access_days}
              onChange={(e) => setSub({ ...sub, access_days: e.target.value })}
              className="w-full h-12 px-4 rounded-xl bg-card border border-border text-foreground"
            >
              <option value="3">3 dias</option>
              <option value="7">7 dias</option>
              <option value="15">15 dias</option>
              <option value="30">30 dias</option>
              <option value="90">90 dias</option>
              <option value="365">365 dias</option>
              <option value="full">Full (sem expiração)</option>
            </select>
          </Field>
        </div>
        <Button variant="success" size="sm" onClick={saveSub}>
          <ShieldCheck className="w-4 h-4" /> Atualizar assinatura
        </Button>

        <div className="h-px bg-border my-6" />

        <h3 className="text-sm font-semibold text-foreground mb-2">Redefinir senha</h3>
        <div className="flex gap-2">
          <Input
            type="text"
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
            placeholder="Nova senha"
          />
          <Button variant="outline" onClick={resetPwd} disabled={!newPwd}>
            <KeyRound className="w-4 h-4" /> Redefinir
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminMaster;
