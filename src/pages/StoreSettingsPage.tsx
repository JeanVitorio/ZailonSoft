import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/components/ui/use-toast';

// UI
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Loader2,
  PlusCircle,
  Trash2,
  User,
  Building,
  AlertTriangle,
  Upload,
  Phone,
  AtSign
} from 'lucide-react';

// API
import {
  fetchStoreDetails,
  updateStoreDetails,
  fetchVendedores,
  createVendedor,
  deleteVendedor
} from '@/services/api';

// Tipos
interface Vendedor {
  id: string; // pode ser temp-xxx
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
    error: storeError
  } = useQuery({
    queryKey: ['storeDetails'],
    queryFn: fetchStoreDetails
  });

  const { data: vendedoresData, isLoading: isLoadingVendedores } = useQuery({
    queryKey: ['vendedores', storeDetailsData?.id],
    queryFn: () => fetchVendedores(storeDetailsData!.id),
    enabled: !!storeDetailsData?.id
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
      if (logoPreview && logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  // ====== MUTATIONS ======
  const updateLojaMutation = useMutation({
    mutationFn: ({
      lojaId,
      updates,
      newLogoFile
    }: {
      lojaId: string;
      updates: any;
      newLogoFile?: File | null;
    }) => updateStoreDetails({ lojaId, updates, newLogoFile }),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['storeDetails'] });
      setNewLogoFile(null);
      if (data?.logo_url) setLogoPreview(data.logo_url);
      toast({ title: 'Sucesso!', description: 'Dados da loja atualizados.' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: `Falha ao atualizar dados da loja: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  const createVendedorMutation = useMutation({
    mutationFn: createVendedor,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['vendedores', storeDetailsData?.id]
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const deleteVendedorMutation = useMutation({
    mutationFn: deleteVendedor,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['vendedores', storeDetailsData?.id]
      });
      toast({ title: 'Vendedor removido' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // ====== HANDLERS ======
  const handleLojaInputChange = (field: string, value: any) => {
    setLojaData((prev: any) => ({ ...prev, [field]: value }));
  };

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

  const handleVendedorInputChange = (
    index: number,
    field: keyof Vendedor,
    value: string
  ) => {
    setVendedores(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addVendedor = () => {
    if (!storeDetailsData?.id) {
      toast({
        title: 'Aguarde',
        description: 'Carregando dados da loja…'
      });
      return;
    }
    const novo: Vendedor = {
      id: `temp-${uuidv4()}`,
      nome: '',
      telefone: '',
      whatsapp: '',
      email: '',
      loja_id: storeDetailsData.id
    };
    setVendedores(prev => [novo, ...prev]);
  };

  const removeVendedor = (index: number, vendedor: Vendedor) => {
    // se for temp -> remove só local
    if (vendedor.id.startsWith('temp-')) {
      setVendedores(prev => prev.filter((_, i) => i !== index));
      return;
    }
    // se existir no backend -> chama mutation
    deleteVendedorMutation.mutate(vendedor.id);
    // otimismo: remove local imediatamente
    setVendedores(prev => prev.filter((_, i) => i !== index));
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
      newLogoFile: newLogoFile
    });

    // Cria vendedores que ainda são temporários
    const novos = vendedores.filter(v => v.id.startsWith('temp-'));
    for (const v of novos) {
      const { id: _temp, loja_id, ...payload } = v;
      await createVendedorMutation.mutateAsync({
        ...payload,
        loja_id: lojaData.id
      });
    }

    toast({
      title: 'Sucesso!',
      description: 'Configurações salvas com sucesso.'
    });
  };

  const isSaving =
    updateLojaMutation.isPending ||
    createVendedorMutation.isPending ||
    deleteVendedorMutation.isPending;

  // ====== LOADING / ERROR ======
  if (isLoadingStore) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-6 md:p-10 text-center">
          <Loader2 className="mx-auto h-8 w-8 text-yellow-400 animate-spin" />
          <p className="mt-3 text-slate-300">
            Carregando configurações da loja...
          </p>
        </div>
      </div>
    );
  }

  if (storeError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-4 md:p-8">
          <Card className="border-red-500/50 bg-red-950/60 text-red-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="text-red-300" /> Erro ao carregar
                dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <CardDescription className="text-red-200">
                Não foi possível buscar as informações da sua loja. Isso pode
                ocorrer se a loja não foi criada no cadastro ou por
                permissões.
              </CardDescription>
              <p className="text-sm text-red-100">
                <b>Detalhe:</b> {(storeError as Error).message}
              </p>
              <p className="text-sm text-red-100/90">
                <b>Próximos passos:</b> Recarregue a página. Se persistir,
                revise RLS no Supabase e o <code>user_id</code> da tabela{' '}
                <code>lojas</code>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ====== UI PRINCIPAL ======
  return (
    <div className="min-h-screen bg-black text-slate-50">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-10">
        {/* HEADER com logo e nome */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo da loja"
                className="w-14 h-14 rounded-full object-contain bg-slate-900 shadow border border-slate-800"
              />
            ) : (
              <div className="w-14 h-14 glass-card rounded-full flex items-center justify-center text-yellow-400 font-bold text-2xl shadow">
                {lojaData?.nome?.[0] || 'Z'}
              </div>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-50">
                Configurações •{' '}
                <span className="gradient-text">
                  {lojaData?.nome || 'Sua loja'}
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Edite as informações públicas e a equipe de vendedores que
                aparecem no catálogo
              </p>
            </div>
          </div>
          <Button
            type="submit"
            form="store-settings-form"
            className="btn-primary px-5 py-3 text-slate-950 rounded-xl shadow transition flex items-center gap-2 text-sm font-semibold whitespace-nowrap disabled:opacity-50"
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : null}
            Salvar alterações
          </Button>
        </div>

        <form
          id="store-settings-form"
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {/* DADOS DA LOJA */}
          <Card className="glass-card rounded-2xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-slate-50 flex items-center gap-2">
                <div className="h-1.5 bg-gradient-to-r from-yellow-500 via-green-500 to-yellow-400 rounded-full w-10" />
                Dados da loja
              </CardTitle>
              <CardDescription className="text-slate-400">
                Edite as informações públicas da sua concessionária.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* LOGO */}
              <div className="space-y-2">
                <Label className="text-slate-200">Logo da loja</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-md border border-slate-800 bg-slate-950 flex items-center justify-center overflow-hidden">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Pré-visualização da logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Building className="w-10 h-10 text-slate-600" />
                    )}
                  </div>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="border-slate-700 bg-slate-900 text-slate-100 hover:border-yellow-500 hover:bg-slate-800"
                    onClick={() =>
                      document.getElementById('logo-upload')?.click()
                    }
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {logoPreview ? 'Trocar imagem' : 'Enviar imagem'}
                  </Button>
                </div>
              </div>

              {/* CAMPOS */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-slate-200">
                    Nome da loja
                  </Label>
                  <Input
                    id="nome"
                    value={lojaData?.nome || ''}
                    onChange={e =>
                      handleLojaInputChange('nome', e.target.value)
                    }
                    className="border-slate-700 bg-slate-950 text-slate-50 focus:border-amber-500 focus:ring-amber-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="proprietario"
                    className="text-slate-200"
                  >
                    Proprietário
                  </Label>
                  <Input
                    id="proprietario"
                    value={lojaData?.proprietario || ''}
                    onChange={e =>
                      handleLojaInputChange(
                        'proprietario',
                        e.target.value
                      )
                    }
                    className="border-slate-700 bg-slate-950 text-slate-50 focus:border-yellow-500 focus:ring-yellow-500/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao" className="text-slate-200">
                  Descrição
                </Label>
                <Textarea
                  id="descricao"
                  value={lojaData?.descricao || ''}
                  onChange={e =>
                    handleLojaInputChange('descricao', e.target.value)
                  }
                  rows={4}
                  className="border-slate-700 bg-slate-950 text-slate-50 focus:border-yellow-500 focus:ring-yellow-500/20"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-slate-200">
                    WhatsApp principal
                  </Label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <Input
                      id="whatsapp"
                      className="pl-9 border-slate-700 bg-slate-950 text-slate-50 focus:border-amber-500 focus:ring-amber-500/20"
                      value={lojaData?.whatsapp || ''}
                      onChange={e =>
                        handleLojaInputChange('whatsapp', e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200">
                    E-mail de contato
                  </Label>
                  <div className="relative">
                    <AtSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-9 border-slate-700 bg-slate-950 text-slate-50 focus:border-amber-500 focus:ring-amber-500/20"
                      value={lojaData?.email || ''}
                      onChange={e =>
                        handleLojaInputChange('email', e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site" className="text-slate-200">
                    Site
                  </Label>
                  <Input
                    id="site"
                    value={lojaData?.site || ''}
                    onChange={e =>
                      handleLojaInputChange('site', e.target.value)
                    }
                    className="border-slate-700 bg-slate-950 text-slate-50 focus:border-amber-500 focus:ring-amber-500/20"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* VENDEDORES */}
          <Card className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-slate-50 flex items-center gap-2">
                <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-400 rounded-full w-10" />
                Equipe de vendedores
              </CardTitle>
              <CardDescription className="text-slate-400">
                Adicione, edite ou remova os contatos exibidos no catálogo e
                nos formulários de interesse.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-400">
                  {isLoadingVendedores
                    ? 'Carregando vendedores…'
                    : `${vendedores.length} vendedor(es) cadastrado(s)`}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-700 bg-slate-900 text-slate-100 hover:border-emerald-400 hover:bg-slate-800"
                  onClick={addVendedor}
                >
                  <PlusCircle className="w-4 h-4 mr-2" /> Adicionar vendedor
                </Button>
              </div>

              <div className="space-y-4">
                {vendedores.length === 0 && !isLoadingVendedores && (
                  <div className="p-4 text-sm text-slate-300 bg-slate-900 border border-slate-800 rounded-lg">
                    Nenhum vendedor cadastrado. Clique em “Adicionar
                    vendedor”.
                  </div>
                )}

                {vendedores.map((v, idx) => (
                  <div
                    key={v.id}
                    className="p-4 rounded-xl glass-card hover:border-amber-400/60 transition"
                  >
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-200">Nome</Label>
                        <div className="relative">
                          <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <Input
                            className="pl-9 border-slate-700 bg-slate-950 text-slate-50 focus:border-amber-500 focus:ring-amber-500/20"
                            placeholder="Ex: Ana Silva"
                            value={v.nome}
                            onChange={e =>
                              handleVendedorInputChange(
                                idx,
                                'nome',
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-200">Telefone</Label>
                        <Input
                          className="border-slate-700 bg-slate-950 text-slate-50 focus:border-amber-500 focus:ring-amber-500/20"
                          placeholder="(00) 0000-0000"
                          value={v.telefone}
                          onChange={e =>
                            handleVendedorInputChange(
                              idx,
                              'telefone',
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-200">WhatsApp</Label>
                        <Input
                          className="border-slate-700 bg-slate-950 text-slate-50 focus:border-amber-500 focus:ring-amber-500/20"
                          placeholder="(00) 00000-0000"
                          value={v.whatsapp}
                          onChange={e =>
                            handleVendedorInputChange(
                              idx,
                              'whatsapp',
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-200">E-mail</Label>
                        <Input
                          type="email"
                          className="border-slate-700 bg-slate-950 text-slate-50 focus:border-amber-500 focus:ring-amber-500/20"
                          placeholder="vendas@exemplo.com"
                          value={v.email}
                          onChange={e =>
                            handleVendedorInputChange(
                              idx,
                              'email',
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        className="text-red-300 border-red-500/60 bg-red-950/50 hover:bg-red-900/70 hover:text-red-50"
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
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold disabled:bg-emerald-300"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando…
                </>
              ) : (
                'Salvar todas as alterações'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StoreSettingsPage;
