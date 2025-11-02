import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/components/ui/use-toast';

// UI
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, PlusCircle, Trash2, User, Building, AlertTriangle, Upload, Phone, AtSign } from 'lucide-react';

// API
import {
  fetchStoreDetails,
  updateStoreDetails,
  fetchVendedores,
  createVendedor,
  deleteVendedor,
} from '@/services/api';

// Tipos
interface Vendedor {
  id: string;          // pode ser temp-xxx
  nome: string;
  telefone: string;
  whatsapp: string;
  email: string;
  loja_id?: string;
}

export function StoreSettingsPage() {
  // Loja
  const [lojaData, setLojaData] = useState<any>({});
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Vendedores
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);

  // Infra
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // ====== QUERIES ======
  const {
    data: storeDetailsData,
    isLoading: isLoadingStore,
    error: storeError,
  } = useQuery({
    queryKey: ['storeDetails'],
    queryFn: fetchStoreDetails,
  });

  const {
    data: vendedoresData,
    isLoading: isLoadingVendedores,
  } = useQuery({
    queryKey: ['vendedores', storeDetailsData?.id],
    queryFn: () => fetchVendedores(storeDetailsData!.id),
    enabled: !!storeDetailsData?.id,
  });

  // ====== EFFECTS ======
  useEffect(() => {
    if (storeDetailsData) {
      setLojaData(storeDetailsData);
      setLogoPreview(storeDetailsData.logo_url || null);
    }
  }, [storeDetailsData]);

  useEffect(() => {
    if (vendedoresData) {
      setVendedores(vendedoresData);
    }
  }, [vendedoresData]);

  // evitar memory leaks do preview
  useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith('blob:')) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  // ====== MUTATIONS ======
  const updateLojaMutation = useMutation({
    mutationFn: ({
      lojaId,
      updates,
      newLogoFile,
    }: {
      lojaId: string;
      updates: any;
      newLogoFile?: File | null;
    }) => updateStoreDetails({ lojaId, updates, newLogoFile }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['storeDetails'] });
      setNewLogoFile(null);
      if (data?.logo_url) setLogoPreview(data.logo_url);
      toast({ title: 'Sucesso!', description: 'Dados da loja atualizados.' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: `Falha ao atualizar dados da loja: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const createVendedorMutation = useMutation({
    mutationFn: createVendedor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendedores', storeDetailsData?.id] });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const deleteVendedorMutation = useMutation({
    mutationFn: deleteVendedor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendedores', storeDetailsData?.id] });
      toast({ title: 'Vendedor removido' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  // ====== HANDLERS ======
  const handleLojaInputChange = (field: string, value: any) => {
    setLojaData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (logoPreview && logoPreview.startsWith('blob:')) URL.revokeObjectURL(logoPreview);
      setNewLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleVendedorInputChange = (index: number, field: keyof Vendedor, value: string) => {
    setVendedores((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addVendedor = () => {
    if (!storeDetailsData?.id) {
      toast({ title: 'Aguarde', description: 'Carregando dados da loja…' });
      return;
    }
    const novo: Vendedor = {
      id: `temp-${uuidv4()}`,
      nome: '',
      telefone: '',
      whatsapp: '',
      email: '',
      loja_id: storeDetailsData.id,
    };
    setVendedores((prev) => [novo, ...prev]);
  };

  const removeVendedor = (index: number, vendedor: Vendedor) => {
    // se for temp -> remove só local
    if (vendedor.id.startsWith('temp-')) {
      setVendedores((prev) => prev.filter((_, i) => i !== index));
      return;
    }
    // se existir no backend -> chama mutation
    deleteVendedorMutation.mutate(vendedor.id);
    // otimismo: remove local imediatamente
    setVendedores((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lojaData?.id) {
      toast({ title: 'Loja não encontrada', variant: 'destructive' });
      return;
    }

    // Remove campos imutáveis
    const { id, created_at, user_id, ...lojaUpdates } = lojaData;

    // Atualiza loja (inclui logo caso selecionada)
    await updateLojaMutation.mutateAsync({
      lojaId: lojaData.id,
      updates: lojaUpdates,
      newLogoFile: newLogoFile,
    });

    // Cria vendedores que ainda são temporários
    const novos = vendedores.filter((v) => v.id.startsWith('temp-'));
    for (const v of novos) {
      const { id: _temp, loja_id, ...payload } = v;
      await createVendedorMutation.mutateAsync({ ...payload, loja_id: lojaData.id });
    }

    toast({ title: 'Sucesso!', description: 'Configurações salvas com sucesso.' });
  };

  const isSaving =
    updateLojaMutation.isPending || createVendedorMutation.isPending || deleteVendedorMutation.isPending;

  // ====== LOADING / ERROR ======
  if (isLoadingStore) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto p-6 md:p-10 text-center">
          <Loader2 className="mx-auto h-8 w-8 text-amber-500 animate-spin" />
          <p className="mt-3 text-zinc-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  if (storeError) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Card className="border-red-500/50 bg-red-50 text-red-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle /> Erro ao Carregar Dados
            </CardTitle>
            <CardDescription className="text-red-600">
              Não foi possível buscar as informações da sua loja. Isso pode ocorrer se a loja não foi criada
              no cadastro ou por permissões.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              <b>Detalhe:</b> {(storeError as Error).message}
            </p>
            <p className="text-sm mt-2">
              <b>Próximos passos:</b> Recarregue a página. Se persistir, revise RLS no Supabase e o{' '}
              <code>user_id</code> da tabela <code>lojas</code>.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ====== UI PRINCIPAL ======
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-10">
        {/* HEADER com logo e nome (padrão) */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo da loja"
                className="w-14 h-14 rounded-full object-contain bg-white shadow"
              />
            ) : (
              <div className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow">
                {lojaData?.nome?.[0] || 'Z'}
              </div>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Configurações • <span className="text-amber-600">{lojaData?.nome || 'Sua Loja'}</span>
              </h1>
              <p className="text-sm text-gray-600">Edite informações públicas e sua equipe de vendedores</p>
            </div>
          </div>
          <Button
            type="submit"
            form="store-settings-form"
            className="px-5 py-3 bg-amber-500 text-white rounded-xl shadow hover:bg-amber-600 transition flex items-center gap-2 text-sm font-medium whitespace-nowrap"
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            Salvar Alterações
          </Button>
        </div>

        <form id="store-settings-form" onSubmit={handleSubmit} className="space-y-8">
          {/* DADOS DA LOJA */}
          <Card className="bg-white border border-gray-100 rounded-2xl shadow">
            <CardHeader>
              <CardTitle className="text-zinc-900 flex items-center gap-2">
                <div className="h-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full w-10" />
                Dados da Loja
              </CardTitle>
              <CardDescription className="text-zinc-600">
                Edite as informações públicas da sua concessionária.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* LOGO */}
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
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <Button type="button" variant="outline" onClick={() => document.getElementById('logo-upload')?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    {logoPreview ? 'Trocar Imagem' : 'Enviar Imagem'}
                  </Button>
                </div>
              </div>

              {/* CAMPOS */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-zinc-600">
                    Nome da Loja
                  </Label>
                  <Input
                    id="nome"
                    value={lojaData?.nome || ''}
                    onChange={(e) => handleLojaInputChange('nome', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proprietario" className="text-zinc-600">
                    Proprietário
                  </Label>
                  <Input
                    id="proprietario"
                    value={lojaData?.proprietario || ''}
                    onChange={(e) => handleLojaInputChange('proprietario', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao" className="text-zinc-600">
                  Descrição
                </Label>
                <Textarea
                  id="descricao"
                  value={lojaData?.descricao || ''}
                  onChange={(e) => handleLojaInputChange('descricao', e.target.value)}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-zinc-600">
                    WhatsApp Principal
                  </Label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <Input
                      id="whatsapp"
                      className="pl-9"
                      value={lojaData?.whatsapp || ''}
                      onChange={(e) => handleLojaInputChange('whatsapp', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-600">
                    E-mail de Contato
                  </Label>
                    <div className="relative">
                      <AtSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-9"
                        value={lojaData?.email || ''}
                        onChange={(e) => handleLojaInputChange('email', e.target.value)}
                      />
                    </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site" className="text-zinc-600">
                    Site
                  </Label>
                  <Input
                    id="site"
                    value={lojaData?.site || ''}
                    onChange={(e) => handleLojaInputChange('site', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* VENDEDORES */}
          <Card className="bg-white border border-gray-100 rounded-2xl shadow">
            <CardHeader>
              <CardTitle className="text-zinc-900 flex items-center gap-2">
                <div className="h-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full w-10" />
                Equipe de Vendedores
              </CardTitle>
              <CardDescription className="text-zinc-600">
                Adicione, edite ou remova os contatos exibidos no catálogo e formulários.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-zinc-600">
                  {isLoadingVendedores ? 'Carregando vendedores…' : `${vendedores.length} vendedor(es)`}
                </p>
                <Button type="button" variant="outline" onClick={addVendedor}>
                  <PlusCircle className="w-4 h-4 mr-2" /> Adicionar Vendedor
                </Button>
              </div>

              <div className="space-y-4">
                {vendedores.length === 0 && !isLoadingVendedores && (
                  <div className="p-4 text-sm text-zinc-600 bg-zinc-50 border border-zinc-200 rounded-lg">
                    Nenhum vendedor cadastrado. Clique em “Adicionar Vendedor”.
                  </div>
                )}

                {vendedores.map((v, idx) => (
                  <div
                    key={v.id}
                    className="p-4 rounded-xl border border-zinc-200 bg-white hover:border-amber-200 transition"
                  >
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="text-zinc-600">Nome</Label>
                        <div className="relative">
                          <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                          <Input
                            className="pl-9"
                            placeholder="Ex: Ana Silva"
                            value={v.nome}
                            onChange={(e) => handleVendedorInputChange(idx, 'nome', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-600">Telefone</Label>
                        <Input
                          placeholder="(00) 0000-0000"
                          value={v.telefone}
                          onChange={(e) => handleVendedorInputChange(idx, 'telefone', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-600">WhatsApp</Label>
                        <Input
                          placeholder="(00) 00000-0000"
                          value={v.whatsapp}
                          onChange={(e) => handleVendedorInputChange(idx, 'whatsapp', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-600">E-mail</Label>
                        <Input
                          type="email"
                          placeholder="vendas@exemplo.com"
                          value={v.email}
                          onChange={(e) => handleVendedorInputChange(idx, 'email', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => removeVendedor(idx, v)}
                        disabled={deleteVendedorMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remover
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* BOTÃO FINAL (redundante ao do header – útil em telas longas) */}
          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-white"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando…
                </>
              ) : (
                'Salvar Todas as Alterações'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StoreSettingsPage;
