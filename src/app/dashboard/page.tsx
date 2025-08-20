"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader, LogOut, QrCode } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user, accommodations, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleGenerateQR = async (alojamientoNombre: string) => {
    if (!alojamientoNombre) return;

    setIsGeneratingQR(true);
    setQrCodeUrl(null);
    try {
      const encodedDenominacion = encodeURIComponent(alojamientoNombre);
      const response = await fetch(`https://evolution.gali.com.ar/instance/connect/${encodedDenominacion}`, {
        method: 'GET',
        headers: {
          'apikey': 'evolution_api_69976825',
          'accept': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Error del servidor: ${response.status}`);
      }
      
      if (data.base64) {
        setQrCodeUrl(data.base64);
        toast({
          title: "¡QR Generado!",
          description: "Escanea el código con tu app de WhatsApp para conectar.",
        });
        
        // Setup Webhook
        const webhookPayload = {
            webhook: {
                enabled: true,
                url: "https://n8n.gali.com.ar/webhook/4cf2663e-d777-42a1-8557-8c418a451156",
                events: ["MESSAGES_UPSERT"],
                base64: false,
                "byEvents": false
            }
        };
        await fetch(`https://evolution.gali.com.ar/webhook/set/${encodedDenominacion}`, {
            method: 'POST',
            headers: {
                'apikey': 'evolution_api_69976825',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(webhookPayload)
        });

      } else {
        throw new Error("La respuesta de la API no contiene un código QR válido.");
      }

    } catch (error) {
      setQrCodeUrl(null);
      toast({
        title: "Error de Conexión",
        description: (error as Error).message || "No se pudo generar el QR. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQR(false);
    }
  };


  if (authLoading || !isAuthenticated) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header/>
            <main className="flex-grow container max-w-4xl mx-auto py-12">
                 <div className="flex items-center justify-between mb-8">
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-10 w-24" />
                </div>
                <Card className="shadow-lg">
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-3/4 mt-2" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-40 w-full" />
                    </CardContent>
                </Card>
            </main>
            <Footer/>
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-secondary">
      <Header />
      <main className="flex-grow container max-w-4xl mx-auto py-12">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">Hola, {user?.username}!</h1>
            <Button variant="outline" onClick={logout}>
                <LogOut className="mr-2"/>
                Cerrar Sesión
            </Button>
        </div>

        {accommodations.map((alojamiento, index) => (
             <Card key={index} className="shadow-lg">
             <CardHeader>
               <CardTitle>{alojamiento.name}</CardTitle>
               <CardDescription>Conecta tu WhatsApp para activar la IA en este alojamiento.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="space-y-2">
                 <p className="text-sm text-muted-foreground">{alojamiento.description}</p>
               </div>
               <div className="grid grid-cols-2 gap-4 text-sm">
                 <div className="flex items-center gap-2">
                   <p dangerouslySetInnerHTML={{ __html: `<strong>Tipo:</strong> ${alojamiento.amenities.split("Tipo: ")[1].split('.')[0]}` }}></p>
                 </div>
                  <div className="flex items-center gap-2">
                   <p dangerouslySetInnerHTML={{ __html: `<strong>Capacidad:</strong> ${alojamiento.amenities.split("Capacidad para ")[1].split(' ')[0]} personas` }}></p>
                 </div>
                  <div className="flex items-center gap-2">
                   <p><strong>Ubicación:</strong> {alojamiento.location}</p>
                 </div>
                 <div className="flex items-center gap-2">
                   <p><strong>Teléfono:</strong> {alojamiento.contact}</p>
                 </div>
               </div>
                {qrCodeUrl && (
                  <div className="mt-6 text-center flex flex-col items-center">
                    <h4 className="font-semibold mb-2">¡Conexión Lista!</h4>
                    <p className="text-sm text-muted-foreground mb-4">Escanea este código QR desde tu app de WhatsApp para vincular tu número.</p>
                    <img src={qrCodeUrl} alt="Código QR de conexión de WhatsApp" className="w-64 h-64 rounded-lg shadow-md" />
                  </div>
                )}
                <Button onClick={() => handleGenerateQR(alojamiento.name)} className="w-full mt-4" size="lg" disabled={isGeneratingQR}>
                 {isGeneratingQR ? <Loader className="animate-spin" /> : <> <QrCode className="mr-2"/> Generar QR de Conexión </>}
               </Button>
             </CardContent>
           </Card>
        ))}

      </main>
      <Footer />
    </div>
  );
}
