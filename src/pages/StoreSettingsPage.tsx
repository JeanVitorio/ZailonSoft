// src/pages/StoreSettingsPage.tsx

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
            toast({ title: "Sucesso!", description: "Os dados da loja foram atualizados." });
            queryClient.invalidateQueries({ queryKey: ['storeDetails'] });
        },
        onError: (error: Error) => {
            toast({ title: "Erro", description: error.message, variant: 'destructive' });
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

    if (isLoading) return <p>Carregando configurações...</p>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Configurações da Loja</CardTitle>
                <CardDescription>Edite as informações públicas da sua concessionária.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nome">Nome da Loja</Label>
                        <Input id="nome" value={formData.nome || ''} onChange={(e) => handleInputChange('nome', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="descricao">Descrição</Label>
                        <Textarea id="descricao" value={formData.descricao || ''} onChange={(e) => handleInputChange('descricao', e.target.value)} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="whatsapp">WhatsApp Principal</Label>
                            <Input id="whatsapp" value={formData.whatsapp || ''} onChange={(e) => handleInputChange('whatsapp', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail de Contato</Label>
                            <Input id="email" type="email" value={formData.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} />
                        </div>
                    </div>
                    {/* Adicione mais campos aqui para 'site', 'localizacao', etc. */}
                </CardContent>
                <div className="p-6 pt-0">
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                </div>
            </form>
        </Card>
    );
}