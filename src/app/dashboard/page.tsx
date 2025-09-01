
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader, LogOut, QrCode, Wifi, Car, Utensils, Snowflake, Sun, Tv, BedDouble, Bath, PawPrint, Clock, Info, Home, Building, Check, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from '@/components/ui/separator';

const serviceIcons: { [key: string]: JSX.Element } = {
  wifi: <Wifi className="w-5 h-5 text-primary" />,
  estacionamiento: <Car className="w-5 h-5 text-primary" />,
  cocina: <Utensils className="w-5 h-5 text-primary" />,
  aire_acondicionado: <Snowflake className="w-5 h-5 text-primary" />,
  calefaccion: <Sun className="w-5 h-5 text-primary" />,
  tv: <Tv className="w-5 h-5 text-primary" />,
  ropa_cama: <BedDouble className="w-5 h-5 text-primary" />,
  bano_privado: <Bath className="w-5 h-5 text-primary" />,
  mascotas: <PawPrint className="w-5 h-5 text-primary" />,
};

const serviceLabels: { [key: string]: string } = {
    wifi: "Wi-Fi",
    estacionamiento: "Estacionamiento",
    cocina: "Cocina",
    aire_acondicionado: "Aire Acondicionado",
    calefaccion: "Calefacción",
    tv: "TV",
    ropa_cama: "Ropa de Cama",
    bano_privado: "Baño Privado",
    mascotas: "Acepta Mascotas",
};

const accommodationTypeIcons: { [key: string]: JSX.Element } = {
    departamento: <Building className="w-5 h-5 text-muted-foreground" />,
    cabaña: <Home className="w-5 h-5 text-muted-foreground" />,
    casa: <Home className="w-5 h-5 text-muted-foreground" />,
};


export default function DashboardPage() {
  const { user, accommodations, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isGeneratingQR, setIsGeneratingQR] = useState<{[key: number]: boolean}>({});
  const [qrCodeUrl, setQrCodeUrl] = useState<{[key: number]: string | null}>({});

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleGenerateQR = async (alojamientoId: number, alojamientoNombre: string) => {
    if (!alojamientoNombre) return;

    setIsGeneratingQR(prev => ({...prev, [alojamientoId]: true}));
    setQrCodeUrl(prev => ({...prev, [alojamientoId]: null}));

    try {
      const encodedDenominacion = encodeURIComponent(alojamientoNombre);
      const response = await fetch(`https://evolution.gali.com.ar/instance/connect/${encodedDenominacion}`, {
        method: 'GET',
        headers: {
          'apikey': 'evolution_api_69976825',
          'accept': 'application/json',
        },
      });

      if (response.status === 405) {
        throw new Error("Method Not Allowed: Verifica la configuración de la API.");
      }
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Error del servidor: ${response.status}`);
      }
      
      if (data.base64) {
        setQrCodeUrl(prev => ({...prev, [alojamientoId]: data.base64}));
        toast({
          title: "¡QR Generado!",
          description: "Escanea el código con tu app de WhatsApp para conectar.",
        });
        
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
      setQrCodeUrl(prev => ({...prev, [alojamientoId]: null}));
      toast({
        title: "Error de Conexión",
        description: (error as Error).message || "No se pudo generar el QR. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQR(prev => ({...prev, [alojamientoId]: false}));
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
        
        {accommodations.length === 0 && (
            <Card className="shadow-lg text-center">
                <CardHeader>
                    <CardTitle>No tienes alojamientos</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Parece que aún no has registrado ningún alojamiento.</p>
                    <Button asChild className="mt-4">
                        <a href="/#demo">Registra tu Primer Alojamiento</a>
                    </Button>
                </CardContent>
            </Card>
        )}

        {accommodations.map((alojamiento) => (
             <Card key={alojamiento.id} className="shadow-lg mb-8">
             <CardHeader>
               <CardTitle className="flex items-center gap-2">{alojamiento.denominacion}
                <span className="text-sm font-normal text-muted-foreground capitalize flex items-center gap-1">
                    - {alojamiento.tipo && accommodationTypeIcons[alojamiento.tipo]} {alojamiento.tipo}
                </span>
               </CardTitle>
               <CardDescription>Conecta tu WhatsApp para activar la IA en este alojamiento.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                 <p><strong>Capacidad:</strong> {alojamiento.capacidad} personas</p>
                 <p><strong>Ubicación:</strong> {alojamiento.ubicacion}</p>
                 <p><strong>Teléfono:</strong> {alojamiento.telefono}</p>
                 <p><strong>Método de Pago:</strong> {alojamiento.metodo_pago}</p>
               </div>
               <Separator />

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Servicios Incluidos</AccordionTrigger>
                        <AccordionContent>
                           <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                            {alojamiento.Servicios && Object.entries(alojamiento.Servicios)
                                .filter(([key]) => key !== 'id' && serviceIcons[key])
                                .map(([key, value]) => (
                                <div key={key} className="flex items-center gap-2">
                                    {serviceIcons[key]}
                                    <span>{serviceLabels[key]}</span>
                                    {value ? <Check className="w-5 h-5 text-green-500" /> : <X className="w-5 h-5 text-red-500" />}
                                </div>
                            ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>Horarios y Políticas</AccordionTrigger>
                        <AccordionContent className="space-y-2">
                            {alojamiento.checkin && (
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-primary"/>
                                    <strong>Check-in:</strong> {alojamiento.checkin.substring(0,5)} hs
                                </div>
                            )}
                            {alojamiento.checkout && (
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-primary"/>
                                    <strong>Check-out:</strong> {alojamiento.checkout.substring(0,5)} hs
                                </div>
                            )}
                             {alojamiento.politica_cancelacion && (
                                <div className="flex items-start gap-2 mt-2">
                                    <Info className="w-5 h-5 text-primary flex-shrink-0 mt-1"/>
                                    <div>
                                        <strong>Política de Cancelación:</strong>
                                        <p className="text-muted-foreground">{alojamiento.politica_cancelacion}</p>
                                    </div>
                                </div>
                             )}
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-3">
                        <AccordionTrigger>Descripción y Reglas</AccordionTrigger>
                        <AccordionContent className="space-y-4">
                             {alojamiento.descripcion && (
                                <div>
                                    <strong>Descripción General:</strong>
                                    <p className="text-muted-foreground">{alojamiento.descripcion}</p>
                                </div>
                             )}
                             {alojamiento.reglas_casa && (
                                 <div>
                                    <strong>Reglas de la Casa:</strong>
                                    <p className="text-muted-foreground">{alojamiento.reglas_casa}</p>
                                </div>
                             )}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                
                {qrCodeUrl[alojamiento.id] && (
                  <div className="mt-6 text-center flex flex-col items-center">
                    <h4 className="font-semibold mb-2">¡Conexión Lista!</h4>
                    <p className="text-sm text-muted-foreground mb-4">Escanea este código QR desde tu app de WhatsApp para vincular tu número.</p>
                    <img src={qrCodeUrl[alojamiento.id]!} alt="Código QR de conexión de WhatsApp" className="w-64 h-64 rounded-lg shadow-md" />
                  </div>
                )}

                <Button onClick={() => handleGenerateQR(alojamiento.id, alojamiento.denominacion)} className="w-full mt-4" size="lg" disabled={isGeneratingQR[alojamiento.id]}>
                 {isGeneratingQR[alojamiento.id] ? <Loader className="animate-spin" /> : <> <QrCode className="mr-2"/> Generar QR de Conexión </>}
               </Button>
             </CardContent>
           </Card>
        ))}

      </main>
      <Footer />
    </div>
  );
}
