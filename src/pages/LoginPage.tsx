import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart3, LogIn } from 'lucide-react';

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            // Lógica de erro melhorada para dar feedback mais claro
            if (error.message.includes('Invalid login credentials')) {
                setError('E-mail ou senha inválidos.');
            } else if (error.message.includes('Email not confirmed')) {
                setError('Por favor, confirme o seu e-mail antes de fazer o login.');
            } else {
                // Captura outros erros, como senhas muito curtas (erro 400)
                setError('Ocorreu um erro. Verifique os seus dados e tente novamente.');
            }
        } else {
            navigate('/'); // Redireciona para o dashboard após login
        }
        setLoading(false);
    };

    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto grid w-[350px] gap-6 animate-fade-in-up">
                    <div className="grid gap-2 text-center">
                        <div className="flex justify-center items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                                <BarChart3 className="w-7 h-7 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">ZailonSoft</h1>
                                <p className="text-balance text-muted-foreground">CRM Automotivo</p>
                            </div>
                        </div>
                        <p className="text-balance text-muted-foreground">
                            Insira as suas credenciais para aceder ao seu painel.
                        </p>
                    </div>
                    <form onSubmit={handleLogin} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Senha</Label>
                                <Link
                                    to="/forgot-password" // Link para uma futura página de recuperação de senha
                                    className="ml-auto inline-block text-sm underline"
                                >
                                    Esqueceu a sua senha?
                                </Link>
                            </div>
                            <Input 
                                id="password" 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                        </div>
                        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'A entrar...' : <><LogIn className="mr-2 h-4 w-4" /> Entrar no Painel</>}
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        Não tem uma conta?{' '}
                        <Link to="/signup" className="underline text-primary font-semibold">
                            Crie uma agora
                        </Link>
                    </div>
                </div>
            </div>
            <div className="hidden bg-muted lg:block">
                <img
                    src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop"
                    alt="Imagem de um carro desportivo amarelo"
                    className="h-full w-full object-cover"
                />
            </div>
        </div>
    );
}

