// src/pages/LoginPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '@/components/ui/use-toast';

// Componentes da sua UI (adapte os imports se necessário)
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react"; // Um ícone de carregamento

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Loading para o processo de login
    const [isChecking, setIsChecking] = useState(false); // Novo estado para verificar a assinatura

    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const { user, subscription, loading: authLoading } = useAuth();

    // Este useEffect é a chave da solução!
    // Ele vai reagir quando as informações do AuthContext estiverem prontas.
    useEffect(() => {
        // Só executa a lógica se estivermos no estado "isChecking"
        if (isChecking && !authLoading && user) {
            if (subscription?.status === 'active') {
                // Sucesso! Assinatura ativa, vai para o sistema.
                const from = location.state?.from?.pathname || '/sistema';
                navigate(from, { replace: true });
            } else if (subscription) {
                 // Existe uma assinatura, mas não está ativa. Vai para a regularização.
                navigate('/regularizar-pagamento', { replace: true });
            }
            // Se subscription for null, ele vai esperar o AuthContext buscar
        }
    }, [user, subscription, authLoading, isChecking, navigate, location.state]);


    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            toast({
                title: "Erro no Login",
                description: error.message || "Verifique suas credenciais e tente novamente.",
                variant: "destructive",
            });
            setIsLoading(false);
        } else {
            // SUCESSO NO LOGIN!
            // Em vez de navegar, nós ativamos o modo "Verificando..."
            // O useEffect acima cuidará do resto.
            toast({
                title: "Login bem-sucedido!",
                description: "Verificando sua assinatura...",
            });
            setIsChecking(true);
            // Não desativamos o isLoading aqui para manter o botão bloqueado
        }
    };

    // Se o usuário já estiver logado e com assinatura ativa, redireciona direto
    useEffect(() => {
        if (!authLoading && user && subscription?.status === 'active') {
             navigate('/sistema', { replace: true });
        }
    }, [user, subscription, authLoading, navigate]);


    const isButtonDisabled = isLoading || isChecking;

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
                                {/* <Link to="/forgot-password" className="ml-auto inline-block text-sm underline">
                                    Esqueceu sua senha?
                                </Link> */}
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