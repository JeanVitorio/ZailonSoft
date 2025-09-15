// src/pages/LoginPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '@/components/ui/use-toast';

// Componentes da sua UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const { user, subscription, loading: authLoading } = useAuth();

    // --- NOVA LÓGICA DE REDIRECIONAMENTO E VERIFICAÇÃO ---
    useEffect(() => {
        if (!isChecking) return;
        console.log('[LoginPage Effect] Verificando status...', { authLoading, user: !!user, subscription });
        if (authLoading) return;

        if (user) {
            if (subscription?.status === 'active') {
                console.log('[LoginPage Effect] Assinatura ativa! Redirecionando para /sistema.');
                toast({ title: "Acesso liberado!", description: "Bem-vindo(a) de volta." });
                const from = location.state?.from?.pathname || '/sistema';
                navigate(from, { replace: true });
                return;
            }
            if (subscription !== undefined) {
                 console.log('[LoginPage Effect] Assinatura não está ativa. Redirecionando para pagamento.');
                 navigate('/regularizar-pagamento', { replace: true });
                 return;
            }
        } else {
             setIsChecking(false);
             setIsLoading(false);
             toast({ title: "Ocorreu um erro", description: "Tente fazer o login novamente.", variant: 'destructive' });
        }
    }, [user, subscription, authLoading, isChecking, navigate, location.state, toast]);

    // --- NOVA LÓGICA DE TIMEOUT ---
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        if (isChecking) {
            timeoutId = setTimeout(() => {
                console.error("[LoginPage Timeout] A verificação da assinatura demorou demais.");
                toast({
                    title: "A verificação está demorando",
                    description: "Pode haver um problema de conexão. Tente novamente.",
                    variant: "destructive",
                });
                setIsChecking(false);
                setIsLoading(false);
            }, 10000); // 10 segundos
        }
        return () => clearTimeout(timeoutId);
    }, [isChecking, toast]);

    // --- FUNÇÃO DE LOGIN ATUALIZADA ---
    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            toast({
                title: "Erro no Login",
                description: error.message || "Verifique suas credenciais.",
                variant: "destructive",
            });
            setIsLoading(false);
        } else {
            toast({
                title: "Login bem-sucedido!",
                description: "Verificando sua assinatura...",
            });
            setIsChecking(true);
        }
    };

    const isButtonDisabled = isLoading || isChecking;

    // --- SEU DESIGN ANTIGO (JSX) ---
    return (
        <div className="flex items-center justify-center min-h-screen bg-zinc-50">
            <Card className="mx-auto max-w-sm w-full">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Acesse sua conta para gerenciar sua loja
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@exemplo.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isButtonDisabled}
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Senha</Label>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isButtonDisabled}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isButtonDisabled}>
                            {isChecking ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verificando...
                                </>
                            ) : isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Entrando...
                                </>
                            ) : (
                                "Entrar"
                            )}
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        Não tem uma conta?{" "}
                        <Link to="/signup" className="underline">
                            Cadastre-se
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}