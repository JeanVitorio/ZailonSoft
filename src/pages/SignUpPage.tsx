// src/pages/SignUpPage.tsx

import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function SignUpPage() {
    const [fullName, setFullName] = useState('');
    const [storeName, setStoreName] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password.length < 6) {
            setError("A senha deve ter no mínimo 6 caracteres.");
            setLoading(false);
            return;
        }

        try {
            const { data, error: functionError } = await supabase.functions.invoke('start-subscription', {
                body: { fullName, storeName, whatsapp, email, password },
            });

            if (functionError) throw functionError;
            
            if (data?.checkoutUrl) {
                window.location.href = data.checkoutUrl;
            } else {
                // Pega a mensagem de erro específica retornada pela nossa função
                setError(data?.error || "Não foi possível iniciar o processo de assinatura. Tente novamente.");
            }
        } catch (e: any) {
            setError(e.message || "Ocorreu um erro desconhecido.");
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 font-poppins">
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <motion.div 
                    className="mx-auto grid w-[400px] gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="grid gap-2 text-center">
                        <div className="flex justify-center items-center gap-4 mb-4">
                            <div className="w-14 h-14 rounded-lg bg-amber-500 flex items-center justify-center">
                                <UserPlus className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-zinc-900">ZailonSoft</h1>
                                <p className="text-balance text-zinc-600">CRM Automotivo</p>
                            </div>
                        </div>
                         <p className="text-balance text-zinc-600">
                            Crie sua conta para começar a vender mais, hoje mesmo.
                        </p>
                    </div>
                    <form onSubmit={handleSignUp} className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="fullName" className="text-zinc-600">Seu Nome</Label>
                                <Input id="fullName" placeholder="Ex: João Silva" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="focus-visible:ring-amber-500/20" />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="storeName" className="text-zinc-600">Nome da Loja</Label>
                                <Input id="storeName" placeholder="Ex: Silva Veículos" value={storeName} onChange={(e) => setStoreName(e.target.value)} required className="focus-visible:ring-amber-500/20" />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="whatsapp" className="text-zinc-600">WhatsApp da Loja</Label>
                            <Input id="whatsapp" placeholder="Ex: 5511988888888" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} required className="focus-visible:ring-amber-500/20" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-zinc-600">E-mail de Acesso</Label>
                            <Input id="email" type="email" placeholder="usado para login" value={email} onChange={(e) => setEmail(e.target.value)} required className="focus-visible:ring-amber-500/20" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-zinc-600">Crie uma Senha</Label>
                            <Input id="password" type="password" placeholder="Mínimo de 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required className="focus-visible:ring-amber-500/20" />
                        </div>
                        {error && <p className="text-sm font-medium text-red-600 bg-red-500/10 p-3 rounded-md">{error}</p>}
                        
                        <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white" disabled={loading}>
                            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...</> : <><UserPlus className="mr-2 h-4 w-4" /> Criar Conta e Assinar</>}
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        Já tem uma conta?{' '}
                        <Link to="/login" className="underline text-amber-600 font-semibold hover:text-amber-700">
                            Faça login
                        </Link>
                    </div>
                </motion.div>
            </div>
            <div className="hidden bg-zinc-100 lg:block">
                <img
                    src="/CamaroBranco.png"
                    alt="Imagem de uma pessoa assinando um contrato de um carro"
                    className="h-full w-full object-cover"
                />
            </div>
        </div>
    );
}