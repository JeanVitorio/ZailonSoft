import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, LogOut, Shield, Crown, Pencil, X, Camera } from 'lucide-react';
import { Profile, AVATAR_OPTIONS } from '@/types/zailon';
import { useUpdateProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import crownBadge from '@/assets/crown-badge.png';
import streakFire from '@/assets/streak-fire.png';
import { toast } from 'sonner';

interface ProfilePageProps {
  profile: Profile;
}

export default function ProfilePage({ profile }: ProfilePageProps) {
  const { signOut } = useAuth();
  const updateProfile = useUpdateProfile();
  const [editing, setEditing] = useState(false);
  const [nome, setNome] = useState(profile.nome);
  const [bio, setBio] = useState(profile.bio);
  const [username, setUsername] = useState(profile.username ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        nome: nome.trim(),
        bio: bio.trim(),
        username: username.trim() || null,
        avatar_url: avatarUrl,
      });
      toast.success('Perfil atualizado! ✨');
      setEditing(false);
    } catch {
      toast.error('Erro ao salvar perfil');
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const isEmoji = (str: string) => str.length <= 4 && /\p{Emoji}/u.test(str);

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 pt-[env(safe-area-inset-top)] pb-3">
        <div className="flex items-center justify-between pt-3">
          <h1 className="text-xl font-extrabold text-foreground">Perfil</h1>
          <div className="flex items-center gap-2">
            {editing ? (
              <button onClick={() => setEditing(false)} className="p-2 rounded-full bg-secondary">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            ) : (
              <button onClick={() => setEditing(true)} className="p-2 rounded-full bg-secondary">
                <Pencil className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
            <button className="p-2 rounded-full bg-secondary">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 pt-6 max-w-lg mx-auto space-y-5">
        {/* Avatar + info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-xp/30 flex items-center justify-center text-5xl border-4 border-xp animate-pulse-glow overflow-hidden">
              {isEmoji(avatarUrl) ? (
                avatarUrl
              ) : avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                '🦁'
              )}
            </div>
            {editing && (
              <button
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-cta flex items-center justify-center"
              >
                <Camera className="w-4 h-4 text-accent-foreground" />
              </button>
            )}
          </div>

          {/* Avatar picker */}
          {editing && showAvatarPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-3 p-3 bg-card rounded-xl card-shadow border border-border"
            >
              <p className="text-xs font-bold text-muted-foreground mb-2">Escolha seu avatar:</p>
              <div className="grid grid-cols-8 gap-2">
                {AVATAR_OPTIONS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => { setAvatarUrl(emoji); setShowAvatarPicker(false); }}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
                      avatarUrl === emoji ? 'bg-xp/30 ring-2 ring-cta' : 'bg-secondary hover:bg-xp/10'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="mt-2">
                <input
                  type="url"
                  placeholder="Ou cole URL da imagem..."
                  value={isEmoji(avatarUrl) ? '' : avatarUrl}
                  onChange={e => setAvatarUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-cta/30"
                />
              </div>
            </motion.div>
          )}

          {editing ? (
            <div className="w-full mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground">Nome</label>
                <input
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-cta/30"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Username</label>
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="@seuuser"
                  className="w-full mt-1 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm font-semibold placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-cta/30"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground">Bio</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Conta sobre você..."
                  rows={2}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-cta/30 resize-none"
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={updateProfile.isPending}
                className="w-full py-3 rounded-xl gradient-cta text-accent-foreground font-bold text-sm disabled:opacity-40"
              >
                {updateProfile.isPending ? 'Salvando...' : 'Salvar Alterações ✨'}
              </motion.button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-extrabold text-foreground mt-3">{profile.nome}</h2>
              {profile.username && <p className="text-xs text-muted-foreground">@{profile.username}</p>}
              <p className="text-sm text-muted-foreground">{profile.bio || 'Guerreiro do Zailon'} · Nível {profile.level}</p>

              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1">
                  <img src={crownBadge} alt="XP" className="w-5 h-5" loading="lazy" width={20} height={20} />
                  <span className="text-sm font-bold text-foreground">{profile.xp} XP</span>
                </div>
                <div className="flex items-center gap-1">
                  <img src={streakFire} alt="Streak" className="w-5 h-5" loading="lazy" width={20} height={20} />
                  <span className="text-sm font-bold text-streak">{profile.streak} dias</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>💎</span>
                  <span className="text-sm font-bold text-clan">{profile.essencia}</span>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Badges */}
        {!editing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl p-4 card-shadow border border-border"
          >
            <h3 className="text-sm font-bold text-foreground mb-3">🏅 Badges</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {['Rei do Dia', 'Streak 7!', 'Primeiro Clã', 'Madrugador'].map((badge, i) => (
                <div
                  key={badge}
                  className="shrink-0 w-16 h-16 rounded-xl gradient-badge flex flex-col items-center justify-center"
                >
                  <span className="text-lg">{['👑', '🔥', '❤️', '🌅'][i]}</span>
                  <span className="text-[8px] font-bold text-navy mt-0.5">{badge}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Menu items */}
        {!editing && (
          <div className="space-y-2">
            {[
              { icon: Crown, label: 'Zailon Premium', sub: 'Desbloqueie tudo' },
              { icon: Shield, label: 'Privacidade', sub: 'Controle quem vê seus dados' },
              { icon: LogOut, label: 'Sair', sub: 'Logout da conta', danger: true, action: handleSignOut },
            ].map((item, i) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                onClick={item.action}
                className="w-full flex items-center gap-3 p-4 bg-card rounded-xl card-shadow border border-border text-left"
              >
                <item.icon className={`w-5 h-5 ${item.danger ? 'text-destructive' : 'text-muted-foreground'}`} />
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
