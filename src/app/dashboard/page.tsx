
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import type { Accommodation } from '@/hooks/use-auth';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader, LogOut, QrCode, Wifi, Car, Utensils, Snowflake, Sun, Tv, BedDouble, Bath, PawPrint, Clock, Info, Home, Building, Check } from 'lucide-react';
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
  
  const [isGeneratingQR, setIsGeneratingQR] = useState<{[key: string]: boolean}>({});
  const [qrCodeUrl, setQrCodeUrl] = useState<{[key: string]: string | null}>({});

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleGenerateQR = async (alojamientoId: number, alojamientoNombre: string) => {
    setIsGeneratingQR(prev => ({...prev, [String(alojamientoId)]: true}));
    try {
      const encodedDenominacion = encodeURIComponent(alojamientoNombre);
      const apiKey = 'evolution_api_69976825';
      const apiUrl = `https://evolution.gali.com.ar/instance/connect/${encodedDenominacion}?apikey=${apiKey}`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (!response.ok || !data.base64) {
        throw new Error(data.message || 'La respuesta de la API no contiene un código QR válido.');
      }
      setQrCodeUrl(prev => ({...prev, [String(alojamientoId)]: data.base64}));
      toast({
        title: "¡QR Generado!",
        description: "Escanea el código con tu app de WhatsApp para conectar.",
      });
    } catch (error) {
      toast({
        title: "Error de Conexión",
        description: (error as Error).message || "No se pudo generar el QR. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQR(prev => ({...prev, [String(alojamientoId)]: false}));
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
        
        {!accommodations || accommodations.length === 0 ? (
            <Card className="shadow-lg text-center">
                <CardHeader>
                    <CardTitle>No tienes alojamientos registrados</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Parece que aún no has añadido ningún alojamiento a tu cuenta.</p>
                    <Button asChild className="mt-4">
                        <a href="/#demo">Registra tu Primer Alojamiento</a>
                    </Button>
                </CardContent>
            </Card>
        ) : (
            accommodations.map((alojamiento: Accommodation) => {
             if (!alojamiento || !alojamiento.attributes) return null;
             
             const { attributes } = alojamiento;
             const services = attributes.Servicios || {};
             const availableServices = Object.entries(services)
                .filter(([key, value]) => value === true && serviceIcons[key]);

             return (
             <Card key={alojamiento.id} className="shadow-lg mb-8">
             <CardHeader>
               <CardTitle className="flex items-center gap-2">{attributes.denominacion}
                {attributes.tipo && (
                    <span className="text-sm font-normal text-muted-foreground capitalize flex items-center gap-1">
                        - {accommodationTypeIcons[attributes.tipo] || <Building className="w-5 h-5 text-muted-foreground" />} {attributes.tipo}
                    </span>
                )}
               </CardTitle>
               <CardDescription>Gestiona la conexión de IA para este alojamiento.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                 {attributes.capacidad && <p><strong>Capacidad:</strong> {attributes.capacidad} personas</p>}
                 {attributes.ubicacion && <p><strong>Ubicación:</strong> {attributes.ubicacion}</p>}
                 {attributes.telefono && <p><strong>Teléfono:</strong> {attributes.telefono}</p>}
                 {attributes.metodo_pago && <p><strong>Método de Pago:</strong> {attributes.metodo_pago}</p>}
               </div>
               <Separator />

                <Accordion type="single" collapsible className="w-full">
                    {availableServices.length > 0 && (
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Servicios Incluidos</AccordionTrigger>
                            <AccordionContent>
                               <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                                {availableServices.map(([key]) => (
                                    <div key={key} className="flex items-center gap-2">
                                        {serviceIcons[key]}
                                        <span>{serviceLabels[key]}</span>
                                        <Check className="w-5 h-5 text-green-500" />
                                    </div>
                                ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    )}
                    <AccordionItem value="item-2">
                        <AccordionTrigger>Horarios y Políticas</AccordionTrigger>
                        <AccordionContent className="space-y-2">
                            {attributes.checkin && (
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-primary"/>
                                    <strong>Check-in:</strong> {attributes.checkin.substring(0,5)} hs
                                </div>
                            )}
                            {attributes.checkout && (
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-primary"/>
                                    <strong>Check-out:</strong> {attributes.checkout.substring(0,5)} hs
                                </div>
                            )}
                             {attributes.politica_cancelacion && (
                                <div className="flex items-start gap-2 mt-2">
                                    <Info className="w-5 h-5 text-primary flex-shrink-0 mt-1"/>
                                    <div>
                                        <strong>Política de Cancelación:</strong>
                                        <p className="text-muted-foreground">{attributes.politica_cancelacion}</p>
                                    </div>
                                </div>
                             )}
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="item-3">
                        <AccordionTrigger>Descripción y Reglas</AccordionTrigger>
                        <AccordionContent className="space-y-4">
                             {attributes.descripcion && (
                                <div>
                                    <strong>Descripción General:</strong>
                                    <p className="text-muted-foreground">{attributes.descripcion}</p>
                                </div>
                             )}
                             {attributes.reglas_casa && (
                                 <div>
                                    <strong>Reglas de la Casa:</strong>
                                    <p className="text-muted-foreground">{attributes.reglas_casa}</p>
                                </div>
                             )}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                
                <div className="mt-6 text-center flex flex-col items-center">
                    {qrCodeUrl[String(alojamiento.id)] ? (
                      <>
                        <h4 className="font-semibold mb-2">¡Conexión Lista!</h4>
                        <p className="text-sm text-muted-foreground mb-4">Escanea este código QR desde tu app de WhatsApp para vincular tu número.</p>
                        <img src={qrCodeUrl[String(alojamiento.id)]!} alt="Código QR de conexión de WhatsApp" className="w-64 h-64 rounded-lg shadow-md" />
                      </>
                    ) : (
                       <Button onClick={() => handleGenerateQR(alojamiento.id, attributes.denominacion)} className="w-full" size="lg" disabled={isGeneratingQR[String(alojamiento.id)]}>
                        {isGeneratingQR[String(alojamiento.id)] ? <Loader className="animate-spin" /> : <> <QrCode className="mr-2"/> Conectar WhatsApp con IA </>}
                      </Button>
                    )}
                </div>
             </CardContent>
           </Card>
             );
            })
        )}
        </main>
      <Footer />
    </div>
  );
}

    