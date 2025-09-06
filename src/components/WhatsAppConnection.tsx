import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Smartphone, Wifi, WifiOff, QrCode, Loader2, AlertCircle, LogOut } from 'lucide-react';

export function WhatsAppConnection() {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [qrError, setQrError] = useState('');
    const [connectedNumber, setConnectedNumber] = useState('');

    const statusIntervalRef = useRef(null);
    const qrRefreshIntervalRef = useRef(null);

    const clearAllIntervals = () => {
        clearInterval(statusIntervalRef.current);
        statusIntervalRef.current = null;
        clearInterval(qrRefreshIntervalRef.current);
        qrRefreshIntervalRef.current = null;
    };

    const refreshQrCode = () => {
        const newQrUrl = `http://localhost:5000/QRCODE/qrcode.png?t=${Date.now()}`;
        setQrCodeUrl(newQrUrl);
        setQrError('');
        console.log("QR Code atualizado.", new Date().toLocaleTimeString());
    };

    const checkConnectionStatus = async (initialCheck = false) => {
        try {
            const response = await fetch('http://localhost:5000/status');
            if (!response.ok) {
                if (initialCheck) setIsConnected(false);
                throw new Error('Falha ao verificar status.');
            }
            const data = await response.json();
            
            if (data.isReady) {
                setIsConnected(true);
                setConnectedNumber(data.phoneNumber || '');
                setIsConnecting(false);
                setQrCodeUrl('');
                clearAllIntervals();
            } else {
                if (!initialCheck) {
                    setIsConnected(false);
                    setConnectedNumber('');
                }
            }
        } catch (error) {
            console.error('Erro ao verificar status da conexão:', error);
            if (initialCheck) setIsConnected(false);
        }
    };
    
    const handleConnect = () => {
        setIsConnecting(true);
        setConnectedNumber('');
        clearAllIntervals();
        refreshQrCode();
        statusIntervalRef.current = setInterval(checkConnectionStatus, 3000);
        qrRefreshIntervalRef.current = setInterval(refreshQrCode, 45000);
    };

    const handleDisconnect = async () => {
        setIsDisconnecting(true);
        clearAllIntervals();
        try {
            const response = await fetch('http://localhost:5000/api/bot/disconnect', {
                method: 'POST',
            });
            if (!response.ok) {
                throw new Error('Falha ao solicitar a desconexão do bot.');
            }
            const result = await response.json();
            console.log(result.message);
            
            setIsConnected(false);
            setConnectedNumber('');
            setIsConnecting(false);
        } catch (error) {
            console.error("Erro ao desconectar:", error);
        } finally {
            setIsDisconnecting(false);
        }
    };

    useEffect(() => {
        checkConnectionStatus(true);
        return () => {
            clearAllIntervals();
        };
    }, []);

    return (
        <div className="container mx-auto py-6 px-4 md:px-6 space-y-6 font-poppins">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900">Conexão WhatsApp</h1>
                    <p className="text-zinc-600">Gerencie a conexão do seu bot de atendimento.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Connection Status Card */}
                <Card className="bg-white/70 border-zinc-200 shadow-sm flex flex-col h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-zinc-900">
                            <MessageSquare className="w-5 h-5" />
                            Status da Conexão
                        </CardTitle>
                        <CardDescription className="text-zinc-600">
                            {isConnected 
                                ? `Conectado com o número: ${connectedNumber}`
                                : "O bot está offline. Conecte-o para começar."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {isConnected ? (
                                    <Wifi className="w-8 h-8 text-amber-500" />
                                ) : (
                                    <WifiOff className="w-8 h-8 text-zinc-400" />
                                )}
                                <div>
                                    <p className="font-medium text-zinc-900">
                                        {isConnected ? 'Bot Conectado' : 'Bot Desconectado'}
                                    </p>
                                    <p className="text-sm text-zinc-600">
                                        {isConnected 
                                            ? 'Pronto para receber mensagens' 
                                            : isConnecting 
                                                ? 'Aguardando escaneamento do QR Code...'
                                                : 'Clique para conectar e ativar o bot'}
                                    </p>
                                </div>
                            </div>
                            <Badge 
                                variant={isConnected ? 'default' : 'secondary'} 
                                className={isConnected ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-zinc-100 text-zinc-600 border-zinc-200'}
                            >
                                {isConnected ? 'Online' : 'Offline'}
                            </Badge>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        {!isConnected ? (
                            <Button 
                                onClick={handleConnect}
                                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                                disabled={isConnecting}
                            >
                                {isConnecting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Aguardando Conexão...
                                    </>
                                ) : 'Conectar WhatsApp'}
                            </Button>
                        ) : (
                            <Button 
                                onClick={handleDisconnect}
                                className="w-full bg-red-500 hover:bg-red-600 text-white"
                                disabled={isDisconnecting}
                            >
                                {isDisconnecting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Desconectando...
                                    </>
                                ) : (
                                    <>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Desconectar e Limpar Sessão
                                    </>
                                )}
                            </Button>
                        )}
                    </CardFooter>
                </Card>

                {/* QR Code Card */}
                <Card className="bg-white/70 border-zinc-200 shadow-sm flex flex-col h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-zinc-900">
                            <QrCode className="w-5 h-5" />
                            QR Code
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col items-center justify-center p-4">
                        {isConnecting ? (
                            <div className="space-y-4 text-center">
                                {qrError ? (
                                    <div className="w-full max-w-[256px] aspect-square mx-auto bg-red-500/10 border-2 border-dashed border-red-500/20 rounded-lg flex items-center justify-center p-4">
                                        <div>
                                            <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-2" />
                                            <p className="font-medium text-red-500">Erro!</p>
                                            <p className="text-sm text-zinc-600">{qrError}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full max-w-[256px] aspect-square mx-auto bg-white p-2 border border-zinc-200 rounded-lg flex items-center justify-center transition-opacity duration-500">
                                        <img 
                                            src={qrCodeUrl} 
                                            alt="QR Code para conexão com WhatsApp"
                                            key={qrCodeUrl}
                                            className="animate-in fade-in"
                                            onError={() => setQrError('Não foi possível carregar o QR Code. Tentando novamente...') }
                                        />
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium text-zinc-900">Escaneie com seu WhatsApp</p>
                                    <p className="text-sm text-zinc-600">
                                        O QR Code será atualizado automaticamente.
                                    </p>
                                </div>
                            </div>
                        ) : isConnected ? (
                            <div className="text-center flex flex-col items-center justify-center h-full">
                                <div className="w-16 h-16 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
                                    <MessageSquare className="w-8 h-8 text-amber-500" />
                                </div>
                                <p className="font-medium text-zinc-900 mb-2">Bot Ativo</p>
                                <p className="text-sm text-zinc-600">
                                    O bot está conectado e funcionando.
                                </p>
                            </div>
                        ) : (
                            <div className="text-center flex flex-col items-center justify-center h-full">
                                <div className="w-16 h-16 mx-auto bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                                    <Smartphone className="w-8 h-8 text-zinc-400" />
                                </div>
                                <p className="font-medium text-zinc-900 mb-2">Pronto para conectar</p>
                                <p className="text-sm text-zinc-600">
                                    Clique em "Conectar WhatsApp" para gerar o QR Code.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}