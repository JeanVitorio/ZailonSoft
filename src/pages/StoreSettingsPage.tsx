import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

// Componentes UI
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, PlusCircle, Trash2, User, Building, AlertTriangle } from 'lucide-react';

// Funções da API
import { 
    fetchStoreDetails, 
    updateStoreDetails, 
    fetchVendedores, 
    createVendedor, 
    deleteVendedor 
} from '@/services/api';

// Tipos
interface Vendedor {
    id: string;
    nome: string;
    telefone: string;
    whatsapp: string;
    email: string;
}

export function StoreSettingsPage() {
    const [lojaData, setLojaData] = useState<any>({});
    const [vendedores, setVendedores] = useState<Vendedor[]>([]);
    
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Query para buscar os detalhes da loja
    const { data: storeDetailsData, isLoading: isLoadingStore, error: storeError } = useQuery({
        queryKey: ['storeDetails'],
        queryFn: fetchStoreDetails,
    });
    
    // Query para buscar os vendedores
    const { data: vendedoresData, isLoading: isLoadingVendedores } = useQuery({
        queryKey: ['vendedores', storeDetailsData?.id],
        queryFn: () => fetchVendedores(storeDetailsData.id),
        enabled: !!storeDetailsData?.id,
    });

    useEffect(() => {
        if (storeDetailsData) {
            setLojaData(storeDetailsData);
        }
    }, [storeDetailsData]);

    useEffect(() => {
        if (vendedoresData) {
            setVendedores(vendedoresData);
        }
    }, [vendedoresData]);

    const updateLojaMutation = useMutation({
        mutationFn: ({ lojaId, updates }: { lojaId: string, updates: any }) => updateStoreDetails(lojaId, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['storeDetails'] });
        },
        onError: (error: Error) => {
            toast({ title: "Erro", description: `Falha ao atualizar dados da loja: ${error.message}`, variant: 'destructive' });
        }
    });
    
    const createVendedorMutation = useMutation({
        mutationFn: createVendedor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendedores', storeDetailsData?.id] });
        },
        onError: (error: Error) => {
            toast({ title: "Erro", description: error.message, variant: 'destructive' });
        }
    });
    
    const deleteVendedorMutation = useMutation({
        mutationFn: deleteVendedor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendedores', storeDetailsData?.id] });
        },
        onError: (error: Error) => {
            toast({ title: "Erro", description: error.message, variant: 'destructive' });
        }
    });

    const handleLojaInputChange = (field: string, value: any) => {
        setLojaData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleVendedorInputChange = (index: number, field: keyof Vendedor, value: string) => {
        const updatedVendedores = [...vendedores];
        updatedVendedores[index] = { ...updatedVendedores[index], [field]: value };
        setVendedores(updatedVendedores);
    };

    const addVendedor = () => {
        setVendedores([...vendedores, { id: `temp-${uuidv4()}`, nome: '', telefone: '', whatsapp: '', email: '' }]);
    };

    const removeVendedor = (index: number, vendedor: Vendedor) => {
        if (!vendedor.id.startsWith('temp-')) {
            deleteVendedorMutation.mutate(vendedor.id);
        }
        setVendedores(vendedores.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // ALTERAÇÃO: Verificação agora usa 'lojaData.id', que é o estado do formulário.
        if (!lojaData?.id) {
            toast({
                title: "Erro",
                description: "ID da loja não encontrado. Aguarde o carregamento ou recarregue a página.",
                variant: "destructive",
            });
            return;
        }
        
        const { id, created_at, user_id, ...lojaUpdates } = lojaData;
        await updateLojaMutation.mutateAsync({ lojaId: lojaData.id, updates: lojaUpdates });

        for (const vendedor of vendedores) {
            if (vendedor.id.startsWith('temp-')) {
                const { id: tempId, ...vendedorData } = vendedor;
                await createVendedorMutation.mutateAsync({ ...vendedorData, loja_id: lojaData.id });
            }
        }

        toast({ 
            title: "Sucesso!", 
            description: "Configurações salvas com sucesso.",
        });
    };

    const isSaving = updateLojaMutation.isPending || createVendedorMutation.isPending || deleteVendedorMutation.isPending;

    if (isLoadingStore) return <p className="text-zinc-600 font-poppins p-8">Carregando configurações...</p>;
    
    // ALTERAÇÃO: Adicionado um bloco para tratar o erro ao carregar os dados da loja.
    if (storeError) {
        return (
            <div className="container mx-auto p-4 md:p-8">
                <Card className="border-red-500/50 bg-red-500/10 text-red-700">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><AlertTriangle /> Erro ao Carregar Dados</CardTitle>
                        <CardDescription className="text-red-600">
                            Não foi possível buscar as informações da sua loja. Isso pode acontecer se não houver uma loja associada a este usuário.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm"><b>Detalhe do erro:</b> {(storeError as Error).message}</p>
                        <p className="text-sm mt-2"><b>Sugestão:</b> Verifique suas políticas de segurança de linha (RLS) na tabela `lojas` no painel da Supabase.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8 font-poppins">
            <h1 className="text-3xl font-bold text-zinc-900">Configurações</h1>
            <form onSubmit={handleSubmit}>
                <div className="space-y-8">
                    <Card className="bg-white/70 border-zinc-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-zinc-900 flex items-center gap-2"><Building className="h-5 w-5 text-amber-500" /> Dados da Loja</CardTitle>
                            <CardDescription className="text-zinc-600">Edite as informações públicas da sua concessionária.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nome" className="text-zinc-600">Nome da Loja</Label>
                                    <Input id="nome" value={lojaData.nome || ''} onChange={(e) => handleLojaInputChange('nome', e.target.value)} className="focus-visible:ring-amber-500/20" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="proprietario" className="text-zinc-600">Proprietário</Label>
                                    <Input id="proprietario" value={lojaData.proprietario || ''} onChange={(e) => handleLojaInputChange('proprietario', e.target.value)} className="focus-visible:ring-amber-500/20" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="descricao" className="text-zinc-600">Descrição</Label>
                                <Textarea id="descricao" value={lojaData.descricao || ''} onChange={(e) => handleLojaInputChange('descricao', e.target.value)} className="focus-visible:ring-amber-500/20" />
                            </div>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="whatsapp" className="text-zinc-600">WhatsApp Principal</Label>
                                    <Input id="whatsapp" value={lojaData.whatsapp || ''} onChange={(e) => handleLojaInputChange('whatsapp', e.target.value)} className="focus-visible:ring-amber-500/20" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-zinc-600">E-mail de Contato</Label>
                                    <Input id="email" type="email" value={lojaData.email || ''} onChange={(e) => handleLojaInputChange('email', e.target.value)} className="focus-visible:ring-amber-500/20" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="site" className="text-zinc-600">Site</Label>
                                    <Input id="site" value={lojaData.site || ''} onChange={(e) => handleLojaInputChange('site', e.target.value)} className="focus-visible:ring-amber-500/20" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/70 border-zinc-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-zinc-900 flex items-center gap-2"><User className="h-5 w-5 text-amber-500" /> Vendedores</CardTitle>
                            <CardDescription className="text-zinc-600">Gerencie a equipe que terá acesso aos leads.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isLoadingVendedores ? <p>Carregando vendedores...</p> : vendedores.map((vendedor, index) => (
                                <div key={vendedor.id} className="p-4 border border-zinc-200 rounded-lg space-y-3 relative">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor={`vendedor-nome-${index}`} className="text-zinc-600">Nome do Vendedor</Label>
                                            <Input id={`vendedor-nome-${index}`} value={vendedor.nome} onChange={(e) => handleVendedorInputChange(index, 'nome', e.target.value)} className="focus-visible:ring-amber-500/20" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`vendedor-email-${index}`} className="text-zinc-600">E-mail</Label>
                                            <Input id={`vendedor-email-${index}`} type="email" value={vendedor.email} onChange={(e) => handleVendedorInputChange(index, 'email', e.target.value)} className="focus-visible:ring-amber-500/20" />
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor={`vendedor-telefone-${index}`} className="text-zinc-600">Telefone</Label>
                                            <Input id={`vendedor-telefone-${index}`} value={vendedor.telefone} onChange={(e) => handleVendedorInputChange(index, 'telefone', e.target.value)} className="focus-visible:ring-amber-500/20" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`vendedor-whatsapp-${index}`} className="text-zinc-600">WhatsApp</Label>
                                            <Input id={`vendedor-whatsapp-${index}`} value={vendedor.whatsapp} onChange={(e) => handleVendedorInputChange(index, 'whatsapp', e.target.value)} className="focus-visible:ring-amber-500/20" />
                                        </div>
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 hover:bg-red-500/10 hover:text-red-600" onClick={() => removeVendedor(index, vendedor)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" onClick={addVendedor} className="w-full border-dashed hover:border-solid hover:bg-amber-500/10 hover:text-amber-600 border-amber-500 text-amber-500">
                                <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Vendedor
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button 
                            type="submit" 
                            className="bg-amber-500 hover:bg-amber-600 text-white disabled:bg-amber-300"
                            disabled={isSaving}
                        >
                            {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : 'Salvar Todas as Alterações'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}