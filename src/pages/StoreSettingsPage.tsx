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
import { Loader2, PlusCircle, Trash2, User, Building, AlertTriangle, Upload } from 'lucide-react';

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
    
    // --- [NOVOS ESTADOS PARA A LOGO] ---
    const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: storeDetailsData, isLoading: isLoadingStore, error: storeError } = useQuery({
        queryKey: ['storeDetails'],
        queryFn: fetchStoreDetails,
    });
    
    const { data: vendedoresData, isLoading: isLoadingVendedores } = useQuery({
        queryKey: ['vendedores', storeDetailsData?.id],
        queryFn: () => fetchVendedores(storeDetailsData.id),
        enabled: !!storeDetailsData?.id,
    });

    useEffect(() => {
        if (storeDetailsData) {
            setLojaData(storeDetailsData);
            setLogoPreview(storeDetailsData.logo_url || null); // Define a pré-visualização inicial
        }
    }, [storeDetailsData]);

    useEffect(() => {
        if (vendedoresData) {
            setVendedores(vendedoresData);
        }
    }, [vendedoresData]);

    // Limpa a URL de pré-visualização para evitar memory leaks
    useEffect(() => {
        return () => {
            if (logoPreview && logoPreview.startsWith('blob:')) {
                URL.revokeObjectURL(logoPreview);
            }
        };
    }, [logoPreview]);

    const updateLojaMutation = useMutation({
        mutationFn: ({ lojaId, updates, newLogoFile }: { lojaId: string, updates: any, newLogoFile?: File | null }) => 
            updateStoreDetails({ lojaId, updates, newLogoFile }), // Passa a logo para a API
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['storeDetails'] });
            setNewLogoFile(null); // Limpa o arquivo após o sucesso
            if (data.logo_url) {
                setLogoPreview(data.logo_url); // Atualiza a preview com a nova URL salva
            }
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

    // --- [NOVA FUNÇÃO] ---
    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (logoPreview && logoPreview.startsWith('blob:')) {
                URL.revokeObjectURL(logoPreview);
            }
            setNewLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleVendedorInputChange = (index: number, field: keyof Vendedor, value: string) => { /* ... (sem alterações) ... */ };
    const addVendedor = () => { /* ... (sem alterações) ... */ };
    const removeVendedor = (index: number, vendedor: Vendedor) => { /* ... (sem alterações) ... */ };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!lojaData?.id) { /* ... (sem alterações) ... */ return; }
        
        // --- [CHAMADA CORRIGIDA] ---
        const { id, created_at, user_id, ...lojaUpdates } = lojaData;
        await updateLojaMutation.mutateAsync({ 
            lojaId: lojaData.id, 
            updates: lojaUpdates,
            newLogoFile: newLogoFile // Envia o novo arquivo da logo
        });

        // Loop para criar vendedores (sem alterações)
        for (const vendedor of vendedores) {
            if (vendedor.id.startsWith('temp-')) {
                const { id: tempId, ...vendedorData } = vendedor;
                await createVendedorMutation.mutateAsync({ ...vendedorData, loja_id: lojaData.id });
            }
        }

        toast({ title: "Sucesso!", description: "Configurações salvas com sucesso." });
    };

    const isSaving = updateLojaMutation.isPending || createVendedorMutation.isPending || deleteVendedorMutation.isPending;

    if (isLoadingStore) return <p className="text-zinc-600 font-poppins p-8">Carregando configurações...</p>;
    
    if (storeError) {
        return (
            <div className="container mx-auto p-4 md:p-8">
                <Card className="border-red-500/50 bg-red-500/10 text-red-700">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><AlertTriangle /> Erro ao Carregar Dados</CardTitle>
                        <CardDescription className="text-red-600">
                            Não foi possível buscar as informações da sua loja. Isso pode acontecer se a loja não foi criada durante o cadastro ou devido a permissões.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm"><b>Detalhe do erro:</b> {(storeError as Error).message}</p>
                        <p className="text-sm mt-2"><b>Próximos Passos:</b> Tente recarregar a página. Se o erro persistir, verifique suas políticas de RLS no Supabase e se o `user_id` na sua tabela `lojas` está correto.</p>
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
                        <CardContent className="space-y-6">
                            
                            {/* --- [NOVA SEÇÃO DE UPLOAD DA LOGO] --- */}
                            <div className="space-y-2">
                                <Label className="text-zinc-600">Logo da Loja</Label>
                                <div className="flex items-center gap-4">
                                    <div className="w-24 h-24 rounded-md border border-zinc-200 bg-zinc-50 flex items-center justify-center overflow-hidden">
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Pré-visualização da logo" className="w-full h-full object-contain" />
                                        ) : (
                                            <Building className="w-10 h-10 text-zinc-300" />
                                        )}
                                    </div>
                                    <Input id="logo-upload" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleLogoChange} className="hidden" />
                                    <Button type="button" variant="outline" onClick={() => document.getElementById('logo-upload')?.click()}>
                                        <Upload className="h-4 w-4 mr-2" />
                                        {logoPreview ? 'Trocar Imagem' : 'Enviar Imagem'}
                                    </Button>
                                </div>
                            </div>
                            
                            {/* --- Restante do formulário (sem alterações) --- */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nome" className="text-zinc-600">Nome da Loja</Label>
                                    <Input id="nome" value={lojaData.nome || ''} onChange={(e) => handleLojaInputChange('nome', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="proprietario" className="text-zinc-600">Proprietário</Label>
                                    <Input id="proprietario" value={lojaData.proprietario || ''} onChange={(e) => handleLojaInputChange('proprietario', e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="descricao" className="text-zinc-600">Descrição</Label>
                                <Textarea id="descricao" value={lojaData.descricao || ''} onChange={(e) => handleLojaInputChange('descricao', e.target.value)} />
                            </div>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="whatsapp" className="text-zinc-600">WhatsApp Principal</Label>
                                    <Input id="whatsapp" value={lojaData.whatsapp || ''} onChange={(e) => handleLojaInputChange('whatsapp', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-zinc-600">E-mail de Contato</Label>
                                    <Input id="email" type="email" value={lojaData.email || ''} onChange={(e) => handleLojaInputChange('email', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="site" className="text-zinc-600">Site</Label>
                                    <Input id="site" value={lojaData.site || ''} onChange={(e) => handleLojaInputChange('site', e.target.value)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card de Vendedores (sem alterações) */}
                    <Card className="bg-white/70 border-zinc-200 shadow-sm">
                       {/* ... seu código completo do card de vendedores ... */}
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white" disabled={isSaving}>
                            {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : 'Salvar Todas as Alterações'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}