import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Settings, LogOut, Shield, Pencil, X, Camera, ImagePlus, Sparkles, Crown } from 'lucide-react';
import { Profile, AVATAR_OPTIONS } from '@/types/zailon';
import { useUpdateProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfilePageProps {
  profile: Profile;
}

export default function ProfilePage({ profile }: ProfilePageProps) {
  const { signOut, user } = useAuth();
  const updateProfile = useUpdateProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [nome, setNome] = useState(profile.nome);
  const [bio, setBio] = useState(profile.bio);
  const [username, setUsername] = useState(profile.username ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande (max 5MB)');
      return;
    }

    if (isSupabaseConfigured && supabase && user) {
      setUploading(true);
      try {
        const ext = file.name.split('.').pop();
        const path = `${user.id}/avatar.${ext}`;
        const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
        if (error) throw error;
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
        setAvatarUrl(`${urlData.publicUrl}?t=${Date.now()}`);
        toast.success('Foto enviada!');
      } catch (err) {
        console.error(err);
        toast.error('Erro ao enviar foto');
      } finally {
        setUploading(false);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatarUrl(ev.target?.result as string);
        toast.success('Foto atualizada!');
      };
      reader.readAsDataURL(file);
    }
    setShowAvatarPicker(false);
  };

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        nome: nome.trim(), bio: bio.trim(),
        username: username.trim() || null, avatar_url: avatarUrl,
      });
      toast.success('Perfil atualizado!');
      setEditing(false);
    } catch { toast.error('Erro ao salvar perfil'); }
  };

  const isEmoji = (str: string) => str.length <= 4 && /\p{Emoji}/u.test(str);

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-40 glass-card-strong px-4 pt-[env(safe-area-inset-top)] pb-3">
        <div className="flex items-center justify-between pt-3">
          <h1 className="text-xl font-black tracking-tight text-foreground">Perfil</h1>
          <div className="flex items-center gap-2">
            {editing ? (
              <button onClick={() => setEditing(false)} className="p-2.5 rounded-full glass-card hover:bg-secondary transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            ) : (
              <button onClick={() => setEditing(true)} className="p-2.5 rounded-full glass-card hover:bg-secondary transition-colors">
                <Pencil className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pt-6 max-w-lg mx-auto space-y-5">
        {/* Profile hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative glass-card rounded-3xl p-6 card-shadow-lg overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary/8 blur-[60px]" />
            <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-level/6 blur-[60px]" />
          </div>

          <div className="flex flex-col items-center relative z-10">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/30 to-level/20 flex items-center justify-center text-5xl border-4 border-primary/30 overflow-hidden shadow-xl">
                {isEmoji(avatarUrl) ? avatarUrl : avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : '🦁'}
              </div>
              {editing && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="absolute bottom-0 right-0 w-9 h-9 rounded-full gradient-cta flex items-center justify-center shadow-lg shadow-accent/30"
                >
                  <Camera className="w-4 h-4 text-accent-foreground" />
                </motion.button>
              )}
              {/* Level badge */}
              <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full gradient-purple flex items-center justify-center shadow-lg">
                <span className="text-[10px] font-black text-accent-foreground">{profile.level}</span>
              </div>
            </div>

            {!editing && (
              <>
                <h2 className="text-2xl font-black text-foreground mt-4 tracking-tight">{profile.nome}</h2>
                {profile.username && <p className="text-xs text-primary font-semibold mt-0.5">@{profile.username}</p>}
                <p className="text-sm text-muted-foreground text-center mt-1">{profile.bio || 'Construindo hábitos sólidos'}</p>

                <div className="flex items-center gap-5 mt-5">
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-black text-foreground">{profile.xp}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold">XP</span>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-black text-streak">🔥 {profile.streak}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold">Streak</span>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-black text-clan">💎 {profile.essencia}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold">Essência</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {editing && showAvatarPicker && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl p-4 card-shadow">
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="w-full mb-3 py-3.5 rounded-xl bg-accent/10 border-2 border-dashed border-accent/30 flex items-center justify-center gap-2 text-sm font-bold text-accent disabled:opacity-50 hover:bg-accent/15 transition-colors">
              <ImagePlus className="w-5 h-5" />
              {uploading ? 'Enviando...' : 'Subir foto do celular'}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <p className="text-xs font-bold text-muted-foreground mb-2">Ou escolha um emoji:</p>
            <div className="grid grid-cols-8 gap-2">
              {AVATAR_OPTIONS.map(emoji => (
                <button key={emoji} onClick={() => { setAvatarUrl(emoji); setShowAvatarPicker(false); }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                    avatarUrl === emoji ? 'bg-primary/20 ring-2 ring-primary' : 'bg-secondary hover:bg-primary/10'
                  }`}>{emoji}</button>
              ))}
            </div>
          </motion.div>
        )}

        {editing && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground ml-1">Nome</label>
              <input value={nome} onChange={e => setNome(e.target.value)}
                className="w-full mt-1.5 px-4 py-3 rounded-2xl glass-card text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground ml-1">Username</label>
              <input value={username} onChange={e => setUsername(e.target.value)} placeholder="@seuuser"
                className="w-full mt-1.5 px-4 py-3 rounded-2xl glass-card text-foreground text-sm font-semibold placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground ml-1">Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Conta sobre você..." rows={2}
                className="w-full mt-1.5 px-4 py-3 rounded-2xl glass-card text-foreground text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={updateProfile.isPending}
              className="w-full py-3.5 rounded-2xl gradient-cta text-accent-foreground font-bold text-sm disabled:opacity-40 shadow-xl shadow-accent/20">
              {updateProfile.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </motion.button>
          </motion.div>
        )}

        {/* Badges */}
        {!editing && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-5 card-shadow">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-4 h-4 text-badge" />
              <h3 className="text-sm font-bold text-foreground">Conquistas</h3>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {['Consistência', 'Streak 7', 'Disciplina', 'Foco Total'].map((badge, i) => (
                <motion.div key={badge}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1, type: 'spring' }}
                  className="shrink-0 w-18 h-18 rounded-2xl gradient-badge flex flex-col items-center justify-center p-3 shadow-lg shadow-badge/20"
                >
                  <span className="text-xl">{['⚡', '🔥', '🎯', '💎'][i]}</span>
                  <span className="text-[8px] font-bold text-primary-foreground mt-1">{badge}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {!editing && (
          <div className="space-y-2.5">
            {[
              { icon: Shield, label: 'Privacidade', sub: 'Controle quem vê seus dados' },
              { icon: LogOut, label: 'Sair', sub: 'Logout da conta', danger: true, action: signOut },
            ].map((item, i) => (
              <motion.button key={item.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }} onClick={item.action}
                className="w-full flex items-center gap-3 p-4 glass-card rounded-2xl card-shadow text-left hover-lift transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.danger ? 'bg-destructive/10' : 'bg-secondary'}`}>
                  <item.icon className={`w-5 h-5 ${item.danger ? 'text-destructive' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className={`text-sm font-bold ${item.danger ? 'text-destructive' : 'text-foreground'}`}>{item.label}</p>
                  <p className="text-[11px] text-muted-foreground">{item.sub}</p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
