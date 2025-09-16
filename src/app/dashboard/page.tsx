
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import type { Accommodation } from '@/hooks/use-auth';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader, LogOut, QrCode, Wifi, Car, Utensils, Snowflake, Sun, Tv, BedDouble, Bath, PawPrint, Clock, Info, Home, Building, Check, Pencil, Map, User, PartyPopper, Bed, Calendar, DollarSign, HomeIcon, Hotel, Sailboat, Users, MapPin, Phone, CreditCard, AlertTriangle, RefreshCw, Zap, Rocket } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { addDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as UiCalendar } from '@/components/ui/calendar';
import type { DateRange } from 'react-day-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


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

// Mock data for reservations - we'll connect this to an API later
const today = new Date();
const reservedDates = [
    addDays(today, 3),
    addDays(today, 4),
    addDays(today, 5),
];
const pendingDates = [
    addDays(today, 12)
];


export default function DashboardPage() {
  const { user, accommodations, isAuthenticated, isLoading: authLoading, logout, token, login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isGeneratingQR, setIsGeneratingQR] = useState<{[key: string]: boolean}>({});
  const [qrCodeUrl, setQrCodeUrl] = useState<{[key: string]: string | null}>({});
  const [editingAccommodation, setEditingAccommodation] = useState<Accommodation | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [qrError, setQrError] = useState<{[key: string]: boolean}>({});

  // State for the calendar
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  // State for reservation dialog
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [isCreatingReservation, setIsCreatingReservation] = useState(false);
  const [reservationDetails, setReservationDetails] = useState({
      nombre_cliente: '',
      email_cliente: '',
      telefono_cliente: '',
      cantidad_personas: 1,
      estado: 'Pendiente',
      observaciones: '',
  });


  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);
  
  const handleEditClick = (accommodation: Accommodation) => {
    setEditingAccommodation(JSON.parse(JSON.stringify(accommodation))); // Deep copy
  };

  const handleFormFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingAccommodation) return;
    const { name, value } = e.target;
    setEditingAccommodation({
        ...editingAccommodation,
        [name]: value
    });
  };
  
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingAccommodation) return;
    const { value } = e.target;
    // Allow only numbers and ensure it stays within a reasonable length
    if (/^\d*$/.test(value) && value.length <= 15) {
       setEditingAccommodation({
           ...editingAccommodation,
           telefono: value.startsWith('+54') ? value : `+54${value}`
       });
    }
  };


  const handleServiceChange = (serviceName: string, checked: boolean) => {
     if (!editingAccommodation) return;
     const updatedServices = { ...editingAccommodation.Servicios, [serviceName]: checked };
     setEditingAccommodation({
        ...editingAccommodation,
        Servicios: updatedServices
     });
  };
  
  const handleMascotasChange = (checked: boolean) => {
      if (!editingAccommodation) return;
      handleServiceChange("mascotas", checked);
  };
  
  const handleUpdateAccommodation = async () => {
    if (!editingAccommodation) return;
    setIsUpdating(true);

    const dataToUpdate = JSON.parse(JSON.stringify(editingAccommodation));

    // Remove all fields that Strapi manages and shouldn't be in the PUT request body
    delete dataToUpdate.id;
    delete dataToUpdate.documentId;
    delete dataToUpdate.createdAt;
    delete dataToUpdate.updatedAt;
    delete dataToUpdate.publishedAt;
    delete dataToUpdate.usuario; // This is crucial

    if (dataToUpdate.Servicios && dataToUpdate.Servicios.id) {
        delete dataToUpdate.Servicios.id;
    }
    
    // Ensure telefono is sent correctly, even if it wasn't modified
    let finalPhoneNumber = dataToUpdate.telefono;
    if (!finalPhoneNumber.startsWith('+54')) {
        finalPhoneNumber = `+54${finalPhoneNumber}`;
    }

    const accommodationDataForApi = {
        data: {
          ...dataToUpdate,
          telefono: finalPhoneNumber,
          capacidad: Number(dataToUpdate.capacidad),
          precio_noche: Number(dataToUpdate.precio_noche),
        }
    };
    
    try {
        const response = await fetch(`https://db.turismovillaunion.gob.ar/api/alojamientos/${editingAccommodation.documentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(accommodationDataForApi)
        });
        
        const responseData = await response.json();

        if (!response.ok) {
            const errorDetails = responseData.error?.details?.key ? `Error en el campo: ${responseData.error.details.key}` : responseData.error?.message || 'No se pudo actualizar el alojamiento.';
            throw new Error(errorDetails);
        }
        
        const updatedAccommodationFromApi = responseData.data;

        // Create the new full accommodation object with the updated attributes
        const updatedAccommodationData = {
          ...editingAccommodation,
          ...updatedAccommodationFromApi.attributes,
          id: updatedAccommodationFromApi.id, // Make sure to use the new ID if it changes
          documentId: updatedAccommodationFromApi.id, // Keep documentId consistent
        };
        
        const updatedAccommodationsList = accommodations.map(acc => 
            acc.documentId === editingAccommodation.documentId ? updatedAccommodationData : acc
        );
        
        login(token!, user!, updatedAccommodationsList);

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
    setQrError(prev => ({ ...prev, [String(alojamientoId)]: false }));
    try {
      const encodedDenominacion = encodeURIComponent(alojamientoNombre);
      const apiUrl = `https://evolution.gali.com.ar/instance/connect/${encodedDenominacion}`;
      const response = await fetch(apiUrl, {
          headers: {
              'apikey': 'evolution_api_69976825'
          }
      });
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
      setQrError(prev => ({ ...prev, [String(alojamientoId)]: true }));
      toast({
        title: "Error de Conexión",
        description: (error as Error).message || "No se pudo generar el QR. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQR(prev => ({...prev, [String(alojamientoId)]: false}));
    }
  };

  const handleCreateReservation = async () => {
      if (!date?.from || !date?.to) {
          toast({ title: "Error", description: "Fechas de reserva no seleccionadas.", variant: "destructive" });
          return;
      }

      setIsCreatingReservation(true);

      const reservationData = {
          data: {
              ...reservationDetails,
              telefono_cliente: Number(reservationDetails.telefono_cliente),
              fecha_inicio: format(date.from, 'yyyy-MM-dd'),
              fecha_fin: format(date.to, 'yyyy-MM-dd'),
          }
      };

      try {
          const response = await fetch('https://db.turismovillaunion.gob.ar/api/reservas', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` 
              },
              body: JSON.stringify(reservationData),
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error?.message || 'No se pudo crear la reserva.');
          }

          toast({
              title: "¡Reserva Creada!",
              description: "La reserva ha sido registrada exitosamente.",
          });

          // Reset form and calendar
          setIsReservationOpen(false);
          setReservationDetails({
              nombre_cliente: '',
              email_cliente: '',
              telefono_cliente: '',
              cantidad_personas: 1,
              estado: 'Pendiente',
              observaciones: '',
          });
          setDate({ from: undefined, to: undefined });
          // Here you would ideally refetch the reservations to update the calendar
          
      } catch (error) {
          toast({
              title: "Error al Crear Reserva",
              description: (error as Error).message,
              variant: "destructive",
          });
      } finally {
          setIsCreatingReservation(false);
      }
  };

  const handleReservationFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setReservationDetails(prev => ({
          ...prev,
          [name]: name === 'cantidad_personas' ? Number(value) : value
      }));
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
      <main className="flex-grow container max-w-7xl mx-auto py-12">
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
                    <CardTitle>🤷‍♂️ No tienes alojamientos registrados</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Parece que aún no has añadido ningún alojamiento a tu cuenta.</p>
                    <Button asChild className="mt-4">
                        <a href="/#demo">🚀 Registra tu Primer Alojamiento</a>
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
             const currentAloId = String(alojamiento.id);
             const hasError = qrError[currentAloId];

             return (
             <div key={alojamiento.documentId} className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 items-start">
               {/* Accommodation Data Card */}
               <Card className="shadow-lg lg:col-span-2">
                 <CardHeader className="flex flex-row items-start justify-between">
                     <div>
                         <CardTitle className="flex items-center gap-2">
                             {alojamiento.tipo && (accommodationTypeIcons[alojamiento.tipo] || <Building className="w-6 h-6 text-primary" />)}
                             {alojamiento.denominacion}
                         </CardTitle>
                        <CardDescription>
                             {alojamiento.tipo && <span className="capitalize">{alojamiento.tipo}</span>}
                             {alojamiento.capacidad && ` para ${alojamiento.capacidad} personas`}
                        </CardDescription>
                    </div>
                    <Dialog open={!!editingAccommodation && editingAccommodation.documentId === alojamiento.documentId} onOpenChange={(isOpen) => !isOpen && setEditingAccommodation(null)}>
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
                                         <Input id="denominacion" name="denominacion" value={editingAccommodation.denominacion} onChange={handleFormFieldChange} className="bg-white" />
                                     </div>
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                         <div className="space-y-2 sm:col-span-1">
                                             <Label htmlFor="capacidad">Capacidad</Label>
                                             <Input id="capacidad" name="capacidad" type="number" value={editingAccommodation.capacidad} onChange={handleFormFieldChange} className="bg-white" />
                                         </div>
                                         <div className="space-y-2 sm:col-span-1">
                                            <Label htmlFor="precio_noche">Precio por Noche</Label>
                                              <div className="relative">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                                                <Input id="precio_noche" name="precio_noche" type="number" step="0.01" value={editingAccommodation.precio_noche || ''} onChange={handleFormFieldChange} className="bg-white pl-7" />
                                            </div>
                                          </div>
                                          <div className="space-y-2 sm:col-span-1">
                                             <Label htmlFor="telefono">Teléfono</Label>
                                              <div className="flex items-center">
                                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-secondary text-muted-foreground text-sm">
                                                  +54
                                                </span>
                                                <Input 
                                                  id="telefono" 
                                                  name="telefono"
                                                  value={editingAccommodation.telefono.replace('+54', '')}
                                                  onChange={handlePhoneNumberChange} 
                                                  className="bg-white rounded-l-none" 
                                                />
                                              </div>
                                         </div>
                                     </div>
                                     <div className="space-y-2">
                                         <Label htmlFor="descripcion">📝 Descripción General</Label>
                                         <Textarea id="descripcion" name="descripcion" value={editingAccommodation.descripcion} onChange={handleFormFieldChange} className="bg-white" />
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
                                           checked={!!editingAccommodation.Servicios?.mascotas}
                                           onCheckedChange={handleMascotasChange}
                                         />
                                     </div>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         <div className="space-y-2">
                                             <Label htmlFor="checkin">⏰ Hora de Check-in</Label>
                                             <Input id="checkin" name="checkin" type="time" value={editingAccommodation.checkin ? editingAccommodation.checkin.substring(0,5) : ''} onChange={handleFormFieldChange} className="bg-white" />
                                         </div>
                                         <div className="space-y-2">
                                             <Label htmlFor="checkout">⏰ Hora de Check-out</Label>
                                             <Input id="checkout" name="checkout" type="time" value={editingAccommodation.checkout ? editingAccommodation.checkout.substring(0,5) : ''} onChange={handleFormFieldChange} className="bg-white" />
                                         </div>
                                     </div>
                                      <div className="space-y-2">
                                         <Label htmlFor="politica_cancelacion">ℹ️ Política de Cancelación</Label>
                                         <Textarea id="politica_cancelacion" name="politica_cancelacion" value={editingAccommodation.politica_cancelacion} onChange={handleFormFieldChange} className="bg-white" />
                                     </div>
                                     <div className="space-y-2">
                                         <Label htmlFor="reglas_casa">📜 Reglas de la Casa</Label>
                                         <Textarea id="reglas_casa" name="reglas_casa" value={editingAccommodation.reglas_casa} onChange={handleFormFieldChange} className="bg-white" />
                                     </div>
                                     <div className="space-y-2">
                                         <Label htmlFor="metodo_pago">💳 Método de Pago</Label>
                                         <Input id="metodo_pago" name="metodo_pago" value={editingAccommodation.metodo_pago} onChange={handleFormFieldChange} className="bg-white" />
                                     </div>
                                      <div className="space-y-2">
                                         <Label htmlFor="ubicacion">📍 Ubicación (Coordenadas)</Label>
                                         <div className="flex gap-2">
                                             <Input id="ubicacion" name="ubicacion" value={editingAccommodation.ubicacion} onChange={handleFormFieldChange} className="bg-white" />
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                        {alojamiento.capacidad && <p className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> <strong>Capacidad:</strong> {alojamiento.capacidad} personas</p>}
                        {alojamiento.precio_noche != null && <p className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary" /> <strong>Precio/noche:</strong> ${alojamiento.precio_noche.toLocaleString('es-AR')}</p>}
                        {alojamiento.ubicacion && <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> <strong>Ubicación:</strong> {alojamiento.ubicacion}</p>}
                        {alojamiento.telefono && <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> <strong>Teléfono:</strong> {alojamiento.telefono}</p>}
                        {alojamiento.metodo_pago && <p className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" /> <strong>Pago:</strong> {alojamiento.metodo_pago}</p>}
                    </div>
                    <Separator />

                     <Accordion type="single" collapsible className="w-full">
                         {alojamiento.Servicios && availableServices.length > 0 && (
                             <AccordionItem value="item-1">
                                 <AccordionTrigger>✔️ Servicios Incluidos</AccordionTrigger>
                                 <AccordionContent>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                                     {availableServices.map((key) => (
                                         <div key={key} className="flex items-center gap-2 text-sm">
                                             {serviceIcons[key]}
                                             <span>{serviceLabels[key]}</span>
                                         </div>
                                     ))}
                                     </div>
                                 </AccordionContent>
                             </AccordionItem>
                         )}
                         <AccordionItem value="item-2">
                             <AccordionTrigger>⏰ Horarios y Políticas</AccordionTrigger>
                             <AccordionContent className="space-y-3">
                                 {alojamiento.checkin && (
                                     <div className="flex items-center gap-2 text-sm">
                                         <Clock className="w-4 h-4 text-primary"/>
                                         <strong>Check-in:</strong> {alojamiento.checkin.substring(0,5)} hs
                                     </div>
                                 )}
                                 {alojamiento.checkout && (
                                     <div className="flex items-center gap-2 text-sm">
                                         <Clock className="w-4 h-4 text-primary"/>
                                         <strong>Check-out:</strong> {alojamiento.checkout.substring(0,5)} hs
                                     </div>
                                 )}
                                  {alojamiento.politica_cancelacion && (
                                     <div className="flex items-start gap-2 mt-2 text-sm">
                                         <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5"/>
                                         <div>
                                             <strong>Política de Cancelación:</strong>
                                             <p className="text-muted-foreground">{alojamiento.politica_cancelacion}</p>
                                         </div>
                                     </div>
                                  )}
                             </AccordionContent>
                         </AccordionItem>
                          <AccordionItem value="item-3">
                             <AccordionTrigger>📝 Descripción y Reglas</AccordionTrigger>
                             <AccordionContent className="space-y-4 text-sm">
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
                 </CardContent>
               </Card>
               
                <div className="flex flex-col gap-8">
                    {(alojamiento.plan?.id === 2 || alojamiento.plan?.id === 4) && (
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle>🤖 Conexión con IA</CardTitle>
                                <CardDescription>Activa el asistente virtual para tu WhatsApp.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center text-center">
                                {qrCodeUrl[currentAloId] ? (
                                <>
                                    <h4 className="font-semibold mb-2">✨ ¡Conexión Lista!</h4>
                                    <p className="text-sm text-muted-foreground mb-4">Escanea este código QR desde la app de WhatsApp para vincular tu número.</p>
                                    <img src={qrCodeUrl[currentAloId]!} alt="Código QR de conexión de WhatsApp" className="w-64 h-64 rounded-lg shadow-md" />
                                </>
                                ) : hasError ? (
                                    <div className="space-y-4">
                                        <AlertTriangle className="w-16 h-16 text-destructive mx-auto" />
                                        <p className="text-destructive font-semibold">Error al generar el QR</p>
                                        <Button 
                                            onClick={() => handleGenerateQR(alojamiento.id, alojamiento.denominacion)} 
                                            className="w-full" 
                                            size="lg" 
                                            disabled={isGeneratingQR[currentAloId]}
                                        >
                                            {isGeneratingQR[currentAloId] ? <Loader className="animate-spin" /> : <><RefreshCw className="mr-2" /> Reintentar</>}
                                        </Button>
                                    </div>
                                ) : (
                                <Button 
                                    onClick={() => handleGenerateQR(alojamiento.id, alojamiento.denominacion)} 
                                    className="w-full" 
                                    size="lg" 
                                    disabled={isGeneratingQR[currentAloId]}
                                >
                                    {isGeneratingQR[currentAloId] ? <Loader className="animate-spin" /> : <> <QrCode className="mr-2"/> Conectar WhatsApp </>}
                                </Button>
                                )}
                                <p className="text-xs text-muted-foreground mt-4">La conexión puede tardar unos segundos en establecerse.</p>
                            </CardContent>
                        </Card>
                    )}

                    {alojamiento.plan?.id === 2 && (
                        <Card className="shadow-lg bg-gradient-to-br from-primary/90 to-primary text-primary-foreground">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Rocket/>
                                    ¡Pásate a Premium!
                                </CardTitle>
                                <CardDescription className="text-primary-foreground/80">Desbloquea todo el potencial de Checkin IA.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm">Actualmente estás en el plan Básico. Mejora a Premium para obtener:</p>
                                <ul className="text-sm list-disc list-inside space-y-1">
                                    <li>Gestión de Calendario y Disponibilidad</li>
                                    <li>Sistema de Reservas y Pagos</li>
                                    <li>¡Y mucho más!</li>
                                </ul>
                                <Button className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 mt-2">
                                    ¡Mejorar a Premium Ahora!
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                    
                    {alojamiento.plan?.id === 4 && (
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle>📅 Calendario de Reservas</CardTitle>
                                <CardDescription>Selecciona un rango de fechas para crear una reserva.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center">
                                <UiCalendar
                                    mode="range"
                                    locale={es}
                                    numberOfMonths={1}
                                    selected={date}
                                    onSelect={setDate}
                                    className="rounded-md border"
                                    modifiers={{
                                      reserved: reservedDates,
                                      pending: pendingDates,
                                    }}
                                    modifiersStyles={{
                                      reserved: { 
                                        color: 'white',
                                        backgroundColor: '#ef4444' // red-500
                                      },
                                      pending: {
                                        color: 'black',
                                        backgroundColor: '#fde047' // yellow-300
                                      }
                                    }}
                                />
                                <div className="w-full mt-6 space-y-4">
                                  <div className="text-center p-4 border rounded-lg">
                                      <p className="text-sm font-medium">
                                          {date?.from ? (
                                              date.to ? (
                                                  <>
                                                      Desde {format(date.from, "LLL dd, y", { locale: es })} hasta{" "}
                                                      {format(date.to, "LLL dd, y", { locale: es })}
                                                  </>
                                              ) : (
                                                  <span>Selecciona la fecha de fin.</span>
                                              )
                                          ) : (
                                              <span>Selecciona un rango de fechas.</span>
                                          )}
                                      </p>
                                  </div>

                                  <Dialog open={isReservationOpen} onOpenChange={setIsReservationOpen}>
                                      <DialogTrigger asChild>
                                          <Button className="w-full" disabled={!date?.from || !date?.to}>
                                              Confirmar Reserva
                                          </Button>
                                      </DialogTrigger>
                                      <DialogContent className="sm:max-w-[425px]">
                                          <DialogHeader>
                                              <DialogTitle>Nueva Reserva</DialogTitle>
                                              <DialogDescription>
                                                  Completa los datos del cliente para confirmar la reserva.
                                              </DialogDescription>
                                          </DialogHeader>
                                          <div className="grid gap-4 py-4">
                                              <div className="grid grid-cols-4 items-center gap-4">
                                                  <Label htmlFor="nombre_cliente" className="text-right">Nombre</Label>
                                                  <Input id="nombre_cliente" name="nombre_cliente" value={reservationDetails.nombre_cliente} onChange={handleReservationFormChange} className="col-span-3" />
                                              </div>
                                              <div className="grid grid-cols-4 items-center gap-4">
                                                  <Label htmlFor="email_cliente" className="text-right">Email</Label>
                                                  <Input id="email_cliente" name="email_cliente" type="email" value={reservationDetails.email_cliente} onChange={handleReservationFormChange} className="col-span-3" />
                                              </div>
                                              <div className="grid grid-cols-4 items-center gap-4">
                                                  <Label htmlFor="telefono_cliente" className="text-right">Teléfono</Label>
                                                  <Input id="telefono_cliente" name="telefono_cliente" type="tel" value={reservationDetails.telefono_cliente} onChange={handleReservationFormChange} className="col-span-3" />
                                              </div>
                                              <div className="grid grid-cols-4 items-center gap-4">
                                                  <Label htmlFor="cantidad_personas" className="text-right">Personas</Label>
                                                  <Input id="cantidad_personas" name="cantidad_personas" type="number" min="1" value={reservationDetails.cantidad_personas} onChange={handleReservationFormChange} className="col-span-3" />
                                              </div>
                                              <div className="grid grid-cols-4 items-center gap-4">
                                                  <Label htmlFor="estado" className="text-right">Estado</Label>
                                                  <Select name="estado" value={reservationDetails.estado} onValueChange={(value) => setReservationDetails(prev => ({ ...prev, estado: value }))}>
                                                      <SelectTrigger className="col-span-3">
                                                          <SelectValue placeholder="Selecciona un estado" />
                                                      </SelectTrigger>
                                                      <SelectContent>
                                                          <SelectItem value="Pendiente">Pendiente</SelectItem>
                                                          <SelectItem value="Confirmada">Confirmada</SelectItem>
                                                          <SelectItem value="Cancelada">Cancelada</SelectItem>
                                                      </SelectContent>
                                                  </Select>
                                              </div>
                                              <div className="grid grid-cols-4 items-center gap-4">
                                                  <Label htmlFor="observaciones" className="text-right">Obs.</Label>
                                                  <Textarea id="observaciones" name="observaciones" value={reservationDetails.observaciones} onChange={handleReservationFormChange} className="col-span-3" placeholder="Notas adicionales..." />
                                              </div>
                                          </div>
                                          <DialogFooter>
                                              <Button onClick={handleCreateReservation} disabled={isCreatingReservation}>
                                                  {isCreatingReservation ? <Loader className="animate-spin" /> : 'Guardar Reserva'}
                                              </Button>
                                          </DialogFooter>
                                      </DialogContent>
                                  </Dialog>


                                  <div className="flex justify-around items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                                        <span>Reservado</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-yellow-300"></div>
                                        <span>Pendiente</span>
                                    </div>
                                  </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                </div>
             </div>
             );
            })
        )}
        </main>
      <Footer />
    </div>
  );

    


