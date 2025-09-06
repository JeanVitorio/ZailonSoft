import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { fetchStoreDetails, updateStoreDetails } from '@/services/api';

export function StoreSettingsPage() {
    const [formData, setFormData] = useState<any>({});
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: storeData, isLoading } = useQuery({
        queryKey: ['storeDetails'],
        queryFn: fetchStoreDetails,
    });

    useEffect(() => {
        if (storeData) {
            setFormData(storeData);
        }
    }, [storeData]);

    const mutation = useMutation({
        mutationFn: (updates: any) => updateStoreDetails(storeData.id, updates),
        onSuccess: () => {
            toast({ 
                title: "Sucesso!", 
                description: "Os dados da loja foram atualizados.",
                className: "bg-amber-500/10 text-zinc-900 border-amber-500/20"
            });
            queryClient.invalidateQueries({ queryKey: ['storeDetails'] });
        },
        onError: (error: Error) => {
            toast({ 
                title: "Erro", 
                description: error.message, 
                variant: 'destructive',
                className: "bg-red-500/10 text-red-500 border-red-500/20"
            });
        },
    });
    
    const handleInputChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { id, created_at, user_id, ...updates } = formData;
        mutation.mutate(updates);
    };

    if (isLoading) return <p className="text-zinc-600 font-poppins">Carregando configurações...</p>;

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6 font-poppins">
            <Card className="bg-white/70 border-zinc-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-zinc-900">Configurações da Loja</CardTitle>
                    <CardDescription className="text-zinc-600">Edite as informações públicas da sua concessionária.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nome" className="text-zinc-600">Nome da Loja</Label>
                            <Input 
                                id="nome" 
                                value={formData.nome || ''} 
                                onChange={(e) => handleInputChange('nome', e.target.value)} 
                                className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="descricao" className="text-zinc-600">Descrição</Label>
                            <Textarea 
                                id="descricao" 
                                value={formData.descricao || ''} 
                                onChange={(e) => handleInputChange('descricao', e.target.value)} 
                                className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
                            />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="whatsapp" className="text-zinc-600">WhatsApp Principal</Label>
                                <Input 
                                    id="whatsapp" 
                                    value={formData.whatsapp || ''} 
                                    onChange={(e) => handleInputChange('whatsapp', e.target.value)} 
                                    className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-zinc-600">E-mail de Contato</Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    value={formData.email || ''} 
                                    onChange={(e) => handleInputChange('email', e.target.value)} 
                                    className="border-zinc-200 focus:border-amber-500 focus:ring-amber-500/20"
                                />
                            </div>
                        </div>
                        {/* Adicione mais campos aqui para 'site', 'localizacao', etc. */}
                    </CardContent>
                    <div className="p-6 pt-0">
                        <Button 
                            type="submit" 
                            className="bg-amber-500 hover:bg-amber-600 text-white disabled:bg-amber-300"
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}