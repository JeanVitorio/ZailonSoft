import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart3, UserPlus } from 'lucide-react';

export function SignUpPage() {
    // Estados para todos os dados do formulário
    const [fullName, setFullName] = useState('');
    const [storeName, setStoreName] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage('');

        // Passo 1: Registar o utilizador, enviando os dados extra no campo 'options.data'
        const { data: authData, error: authError } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
                data: {
                    full_name: fullName, // Estes dados vão para 'raw_user_meta_data'
                    phone: whatsapp,
                }
            }
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        if (!authData.user) {
            setError("Não foi possível criar o utilizador. Tente novamente.");
            setLoading(false);
            return;
        }
        
        // Passo 2: O trigger já criou a loja com os dados básicos.
        // Agora, atualizamos a loja com o nome correto que o utilizador inseriu.
        const { error: storeError } = await supabase
            .from('lojas')
            .update({
                nome: storeName,
            })
            .eq('user_id', authData.user.id);

        if (storeError) {
            setError(`A sua conta foi criada, mas houve um erro ao registar a loja: ${storeError.message}`);
        } else {
            setMessage('Conta criada com sucesso! A redirecionar para o login...');
            setTimeout(() => navigate('/login'), 3000); 
        }
        
        setLoading(false);
    };

    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
             <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto grid w-[380px] gap-6 animate-fade-in-up">
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
                            Crie a sua conta para começar a gerir a sua loja hoje.
                        </p>
                    </div>
                    <form onSubmit={handleSignUp} className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="fullName">O seu Nome</Label>
                                <Input id="fullName" placeholder="Ex: João Silva" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="storeName">Nome da Loja</Label>
                                <Input id="storeName" placeholder="Ex: Auto Premium" value={storeName} onChange={(e) => setStoreName(e.target.value)} required />
                            </div>
                        </div>
                         <div className="grid gap-2">
                            <Label htmlFor="whatsapp">WhatsApp da Loja</Label>
                            <Input id="whatsapp" placeholder="Ex: 5511988888888" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">E-mail de Acesso</Label>
                            <Input id="email" type="email" placeholder="usado para login" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Crie uma Senha</Label>
                            <Input id="password" type="password" placeholder="Mínimo de 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                        {message && <p className="text-sm font-medium text-emerald-600 bg-emerald-50 p-3 rounded-md">{message}</p>}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'A registar...' : <><UserPlus className="mr-2 h-4 w-4" /> Criar Conta</>}
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        Já tem uma conta?{' '}
                        <Link to="/login" className="underline text-primary font-semibold">
                            Faça login
                        </Link>
                    </div>
                </div>
            </div>
            <div className="hidden bg-muted lg:block">
                <img
                    src="https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=2072&auto=format&fit=crop"
                    alt="Imagem de vários carros numa concessionária"
                    className="h-full w-full object-cover"
                />
            </div>
        </div>
    );
}

