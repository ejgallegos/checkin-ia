
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import type { Accommodation } from '@/hooks/use-auth';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader, LogOut, QrCode, Wifi, Car, Utensils, Snowflake, Sun, Tv, BedDouble, Bath, PawPrint, Clock, Info, Home, Building, Check, Pencil, Map } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';


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

const amenityItems = [
  { id: "wifi", label: "WiFi" },
  { id: "estacionamiento", label: "Estacionamiento" },
  { id: "cocina", label: "Cocina" },
  { id: "piscina", label: "Piscina" },
  { id: "aire_acondicionado", label: "Aire Acondicionado" },
  { id: "calefaccion", label: "Calefacción" },
  { id: "tv", label: "TV" },
  { id: "bano_privado", label: "Baño Privado" },
  { id: "ropa_cama", label: "Ropa de Cama" },
] as const;


const accommodationTypeIcons: { [key: string]: JSX.Element } = {
    departamento: <Building className="w-5 h-5 text-muted-foreground" />,
    cabaña: <Home className="w-5 h-5 text-muted-foreground" />,
    casa: <Home className="w-5 h-5 text-muted-foreground" />,
};

export default function DashboardPage() {
  const { user, accommodations, isAuthenticated, isLoading: authLoading, logout, token, login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isGeneratingQR, setIsGeneratingQR] = useState<{[key: string]: boolean}>({});
  const [qrCodeUrl, setQrCodeUrl] = useState<{[key: string]: string | null}>({});
  const [editingAccommodation, setEditingAccommodation] = useState<Accommodation | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);
  
  const handleEditClick = (accommodation: Accommodation) => {
    setEditingAccommodation({...accommodation});
  };

  const handleFormFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingAccommodation) return;
    setEditingAccommodation({
        ...editingAccommodation,
        [e.target.name]: e.target.value
    });
  };

  const handleServiceChange = (serviceName: string, checked: boolean) => {
     if (!editingAccommodation) return;
     setEditingAccommodation({
        ...editingAccommodation,
        Servicios: {
            ...editingAccommodation.Servicios,
            [serviceName]: checked,
        }
     });
  };
  
  const handleMascotasChange = (checked: boolean) => {
      if (!editingAccommodation) return;
      handleServiceChange("mascotas", checked);
  };
  
  const handleUpdateAccommodation = async () => {
    if (!editingAccommodation) return;
    setIsUpdating(true);

    const accommodationDataForApi = {
        data: {
          denominacion: editingAccommodation.denominacion,
          capacidad: editingAccommodation.capacidad,
          checkin: editingAccommodation.checkin,
          checkout: editingAccommodation.checkout,
          telefono: editingAccommodation.telefono,
          ubicacion: editingAccommodation.ubicacion,
          descripcion: editingAccommodation.descripcion,
          politica_cancelacion: editingAccommodation.politica_cancelacion,
          metodo_pago: editingAccommodation.metodo_pago,
          reglas_casa: editingAccommodation.reglas_casa,
          Servicios: {
            ...editingAccommodation.Servicios
          },
        }
    };
    
    try {
        const response = await fetch(`https://db.turismovillaunion.gob.ar/api/alojamientos/${editingAccommodation.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(accommodationDataForApi)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'No se pudo actualizar el alojamiento.');
        }

        const updatedAccommodations = accommodations.map(acc => 
            acc.id === editingAccommodation.id ? editingAccommodation : acc
        );
        
        // This is a bit of a hack, we should probably have a dedicated update function in useAuth
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        login(token!, storedUser, updatedAccommodations);

        toast({
            title: "¡Alojamiento Actualizado!",
            description: "Los datos se guardaron correctamente.",
        });
        setEditingAccommodation(null);
    } catch (error) {
        toast({
            title: "Error al Actualizar",
            description: (error as Error).message,
            variant: "destructive",
        });
    } finally {
        setIsUpdating(false);
    }
  };


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
            <h1 className="text-3xl md:text-4xl font-bold">👋 ¡Hola, {user?.username}!</h1>
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
            accommodations.map((alojamiento) => {
             if (!alojamiento) return null;
             
             const services = alojamiento.Servicios || {};
             const availableServices = Object.keys(serviceIcons).filter(
                (key) => services && services[key as keyof typeof services] === true
             );

             return (
             <Card key={alojamiento.id} className="shadow-lg mb-8">
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">🏨 {alojamiento.denominacion}
                        {alojamiento.tipo && (
                            <span className="text-sm font-normal text-muted-foreground capitalize flex items-center gap-1">
                                - {accommodationTypeIcons[alojamiento.tipo] || <Building className="w-5 h-5 text-muted-foreground" />} {alojamiento.tipo}
                            </span>
                        )}
                       </CardTitle>
                       <CardDescription>Gestiona la conexión de IA y los datos de este alojamiento.</CardDescription>
                   </div>
                   <Dialog open={!!editingAccommodation && editingAccommodation.id === alojamiento.id} onOpenChange={(isOpen) => !isOpen && setEditingAccommodation(null)}>
                        <DialogTrigger asChild>
                            <Button variant="outline" onClick={() => handleEditClick(alojamiento)}>
                                <Pencil className="mr-2 h-4 w-4" /> Editar
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>✏️ Editando: {editingAccommodation?.denominacion}</DialogTitle>
                            </DialogHeader>
                            {editingAccommodation && (
                               <div className="space-y-6 py-4">
                                    {/* Form Fields */}
                                    <div className="space-y-2">
                                        <Label htmlFor="denominacion">Nombre del Alojamiento</Label>
                                        <Input id="denominacion" name="denominacion" value={editingAccommodation.denominacion} onChange={handleFormFieldChange} />
                                    </div>
                                     <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="capacidad">Capacidad</Label>
                                            <Input id="capacidad" name="capacidad" type="number" value={editingAccommodation.capacidad} onChange={handleFormFieldChange} />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="telefono">Teléfono</Label>
                                            <Input id="telefono" name="telefono" value={editingAccommodation.telefono} onChange={handleFormFieldChange} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="descripcion">📝 Descripción General</Label>
                                        <Textarea id="descripcion" name="descripcion" value={editingAccommodation.descripcion} onChange={handleFormFieldChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>✔️ Servicios Incluidos</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 rounded-md border p-4">
                                            {amenityItems.map((item) => (
                                              <div key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                                <Checkbox
                                                  id={`edit-${item.id}`}
                                                  checked={editingAccommodation.Servicios?.[item.id as keyof typeof editingAccommodation.Servicios] || false}
                                                  onCheckedChange={(checked) => handleServiceChange(item.id, !!checked)}
                                                />
                                                <Label htmlFor={`edit-${item.id}`} className="font-normal">{item.label}</Label>
                                              </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">¿Se aceptan mascotas?</Label>
                                        </div>
                                        <Switch
                                          checked={editingAccommodation.Servicios?.mascotas || false}
                                          onCheckedChange={handleMascotasChange}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="checkin">⏰ Hora de Check-in</Label>
                                            <Input id="checkin" name="checkin" type="time" value={editingAccommodation.checkin.substring(0,5)} onChange={handleFormFieldChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="checkout">⏰ Hora de Check-out</Label>
                                            <Input id="checkout" name="checkout" type="time" value={editingAccommodation.checkout.substring(0,5)} onChange={handleFormFieldChange} />
                                        </div>
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="politica_cancelacion">ℹ️ Política de Cancelación</Label>
                                        <Textarea id="politica_cancelacion" name="politica_cancelacion" value={editingAccommodation.politica_cancelacion} onChange={handleFormFieldChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reglas_casa">📜 Reglas de la Casa</Label>
                                        <Textarea id="reglas_casa" name="reglas_casa" value={editingAccommodation.reglas_casa} onChange={handleFormFieldChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="metodo_pago">💳 Método de Pago</Label>
                                        <Input id="metodo_pago" name="metodo_pago" value={editingAccommodation.metodo_pago} onChange={handleFormFieldChange} />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="ubicacion">📍 Ubicación (Coordenadas)</Label>
                                        <div className="flex gap-2">
                                            <Input id="ubicacion" name="ubicacion" value={editingAccommodation.ubicacion} onChange={handleFormFieldChange} />
                                             <Button type="button" variant="outline" size="icon" onClick={() => window.open('https://maps.google.com', '_blank')}>
                                                <Map className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                               </div>
                            )}
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">Cancelar</Button>
                                </DialogClose>
                                <Button onClick={handleUpdateAccommodation} disabled={isUpdating}>
                                    {isUpdating ? <Loader className="animate-spin" /> : "Guardar Cambios"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
             <CardContent className="space-y-4">
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                 {alojamiento.capacidad && <p><strong>👥 Capacidad:</strong> {alojamiento.capacidad} personas</p>}
                 {alojamiento.ubicacion && <p><strong>📍 Ubicación:</strong> {alojamiento.ubicacion}</p>}
                 {alojamiento.telefono && <p><strong>📞 Teléfono:</strong> {alojamiento.telefono}</p>}
                 {alojamiento.metodo_pago && <p><strong>💳 Método de Pago:</strong> {alojamiento.metodo_pago}</p>}
               </div>
               <Separator />

                <Accordion type="single" collapsible className="w-full">
                    {availableServices.length > 0 && (
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Servicios Incluidos</AccordionTrigger>
                            <AccordionContent>
                               <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                                {availableServices.map((key) => (
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
                                    <strong>📝 Descripción General:</strong>
                                    <p className="text-muted-foreground">{alojamiento.descripcion}</p>
                                </div>
                             )}
                             {alojamiento.reglas_casa && (
                                 <div>
                                    <strong>📜 Reglas de la Casa:</strong>
                                    <p className="text-muted-foreground">{alojamiento.reglas_casa}</p>
                                </div>
                             )}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                
                <div className="mt-6 text-center flex flex-col items-center">
                    {qrCodeUrl[String(alojamiento.id)] ? (
                      <>
                        <h4 className="font-semibold mb-2">✨ ¡Conexión Lista!</h4>
                        <p className="text-sm text-muted-foreground mb-4">Escanea este código QR desde tu app de WhatsApp para vincular tu número.</p>
                        <img src={qrCodeUrl[String(alojamiento.id)]!} alt="Código QR de conexión de WhatsApp" className="w-64 h-64 rounded-lg shadow-md" />
                      </>
                    ) : (
                       <Button onClick={() => handleGenerateQR(alojamiento.id, alojamiento.denominacion)} className="w-full" size="lg" disabled={isGeneratingQR[String(alojamiento.id)]}>
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

    