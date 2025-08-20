"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { useState } from "react";
import { AccommodationInfo } from "@/ai/flows/accommodation-chat-flow";
import { Loader, QrCode } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

const formSchema = z.object({
  nombre: z.string().min(2, "El nombre es requerido."),
  email: z.string().email("Ingresa un email válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
  nombreAlojamiento: z.string().min(2, "El nombre del alojamiento debe tener al menos 2 caracteres."),
  descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
  telefono: z.string().min(8, "Ingresa un teléfono válido."),
  capacidad: z.coerce.number().min(1, "La capacidad debe ser al menos 1."),
  tipoAlojamiento: z.enum(["departamento", "cabaña", "casa"], {
    required_error: "Debes seleccionar un tipo de alojamiento."
  }),
  ubicacion: z.string().min(3, "La ubicación es requerida."),
});

type UserAndAccommodationFormValues = z.infer<typeof formSchema>;

export function DemoSection() {
  const [accommodationInfo, setAccommodationInfo] = useState<AccommodationInfo | null>(null);
  const [formValues, setFormValues] = useState<UserAndAccommodationFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<UserAndAccommodationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      email: "",
      password: "",
      nombreAlojamiento: "",
      descripcion: "",
      telefono: "",
      capacidad: 1,
      ubicacion: "",
    },
  });

  async function onInfoSubmit(values: UserAndAccommodationFormValues) {
    setIsLoading(true);
    try {
      const registerResponse = await fetch('https://db.turismovillaunion.gob.ar/api/auth/local/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: values.nombre,
          email: values.email,
          password: values.password,
        }),
      });

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        const errorMessage = errorData.error?.message || 'Error en el registro. Inténtalo de nuevo.';
        throw new Error(errorMessage);
      }
      
      const infoForAI: AccommodationInfo = {
        name: values.nombreAlojamiento,
        description: values.descripcion,
        amenities: `Capacidad para ${values.capacidad} personas. Tipo: ${values.tipoAlojamiento}. Contacto: Teléfono ${values.telefono}`,
        location: values.ubicacion,
        contact: `Teléfono: ${values.telefono}`
      };
      
      setFormValues(values);
      setAccommodationInfo(infoForAI);
      toast({
        title: "¡Registro Exitoso!",
        description: "Tu cuenta y tu primer alojamiento han sido creados.",
      });
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      toast({
        title: "Error de Registro",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleGenerateQR = async () => {
    if (!formValues) return;
    setIsGeneratingQR(true);
    setQrCodeUrl(null);
    try {
      const encodedDenominacion = encodeURIComponent(formValues.nombreAlojamiento);
      const response = await fetch(`https://evolution.gali.com.ar/instance/connect/${encodedDenominacion}`, {
        method: 'GET',
        headers: {
          'apikey': 'evolution_api_69976825',
          'accept': 'application/json, text/plain, */*',
        },
      });

      const responseBody = await response.text();
      
      if (!response.ok) {
        let errorMessage = `Error del servidor: ${response.status}`;
        try {
            const errorJson = JSON.parse(responseBody);
            errorMessage = errorJson.message || JSON.stringify(errorJson);
        } catch (e) {
            errorMessage = responseBody || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const data = JSON.parse(responseBody);

      if (data && data.base64) {
        setQrCodeUrl(data.base64);
        toast({
          title: "¡QR Generado!",
          description: "Escanea el código con tu app de WhatsApp para conectar.",
        });

        try {
            const webhookPayload = {
                webhook: {
                    enabled: true,
                    url: "https://n8n.gali.com.ar/webhook/4cf2663e-d777-42a1-8557-8c418a451156",
                    events: ["MESSAGES_UPSERT"],
                    base64: false,
                    byEvents: false
                }
            };
            
            const webhookResponse = await fetch(`https://evolution.gali.com.ar/webhook/set/${encodedDenominacion}`, {
                method: 'POST',
                headers: {
                    'apikey': 'evolution_api_69976825',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(webhookPayload)
            });
            if (!webhookResponse.ok) {
                const webhookErrorData = await webhookResponse.json().catch(() => ({ message: webhookResponse.statusText }));
                throw new Error(webhookErrorData.message || 'Error al configurar el webhook.');
            }
            
            toast({
                title: "¡Webhook Configurado!",
                description: "La conexión con WhatsApp está lista para recibir mensajes.",
            });

        } catch (webhookError) {
             toast({
                title: "Error de Webhook",
                description: (webhookError as Error).message,
                variant: "destructive",
            });
        }
        
      } else {
        throw new Error("La respuesta de la API no contiene un código QR válido.");
      }

    } catch (error) {
      console.error("Error al generar QR:", error);
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


  return (
    <div className="w-full py-12 md:py-24 bg-secondary">
      <div className="container max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Crea tu Cuenta y Conecta tu WhatsApp</h2>
          <p className="text-lg text-muted-foreground mt-2">
            Regístrate y configura tu primer alojamiento para comenzar a automatizar.
          </p>
        </div>
        <div className="flex justify-center">
          <Card className="shadow-2xl w-full">
            {accommodationInfo && formValues ? (
               <>
                <CardHeader>
                  <CardTitle>¡Bienvenido, {formValues.nombre}!</CardTitle>
                  <CardDescription>Conecta tu WhatsApp para activar la IA en "{formValues.nombreAlojamiento}".</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{formValues.nombreAlojamiento}</h3>
                    <p className="text-sm text-muted-foreground">{formValues.descripcion}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <p><strong>Tipo:</strong> {formValues.tipoAlojamiento}</p>
                    </div>
                     <div className="flex items-center gap-2">
                      <p><strong>Capacidad:</strong> {formValues.capacidad} personas</p>
                    </div>
                     <div className="flex items-center gap-2">
                      <p><strong>Ubicación:</strong> {formValues.ubicacion}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p><strong>Teléfono:</strong> {formValues.telefono}</p>
                    </div>
                  </div>
                   {qrCodeUrl && (
                     <div className="mt-6 text-center flex flex-col items-center">
                       <h4 className="font-semibold mb-2">¡Conexión Lista!</h4>
                       <p className="text-sm text-muted-foreground mb-4">Escanea este código QR desde tu app de WhatsApp para vincular tu número.</p>
                       <img src={qrCodeUrl} alt="Código QR de conexión de WhatsApp" className="w-64 h-64 rounded-lg shadow-md" />
                     </div>
                   )}
                   <Button onClick={handleGenerateQR} className="w-full mt-4" size="lg" disabled={isGeneratingQR}>
                    {isGeneratingQR ? <Loader className="animate-spin" /> : <> <QrCode className="mr-2"/> Generar QR de Conexión </>}
                  </Button>
                </CardContent>
              </>
            ) : (
            <>
              <CardHeader>
                <CardTitle>1. Regístrate y Configura tu Alojamiento</CardTitle>
                <CardDescription>Completa los detalles para entrenar a tu asistente.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onInfoSubmit)} className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Tus Datos</h3>
                     <FormField
                      control={form.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Ana Pérez" {...field} disabled={isLoading}/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="tu@email.com" {...field} disabled={isLoading}/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contraseña</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} disabled={isLoading}/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <h3 className="text-lg font-semibold border-b pb-2 pt-4">Datos de tu Alojamiento</h3>
                    <FormField
                      control={form.control}
                      name="nombreAlojamiento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Alojamiento</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Cabañas del Bosque" {...field} disabled={isLoading}/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="descripcion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Describe tu lugar, qué lo hace especial..." {...field} disabled={isLoading}/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="telefono"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono de Contacto (WhatsApp)</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="Ej: +54 9 299 1234567" {...field} disabled={isLoading}/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="capacidad"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capacidad de Personas</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" placeholder="Ej: 4" {...field} disabled={isLoading}/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tipoAlojamiento"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Tipo de Alojamiento</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                              disabled={isLoading}
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="departamento" />
                                </FormControl>
                                <FormLabel className="font-normal">Departamento</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="cabaña" />
                                </FormControl>
                                <FormLabel className="font-normal">Cabaña</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="casa" />
                                </FormControl>
                                <FormLabel className="font-normal">Casa</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ubicacion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ubicación</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: San Martín de los Andes, a 2km del centro" {...field} disabled={isLoading}/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                      {isLoading ? <Loader className="animate-spin" /> : 'Registrar y Activar IA'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
