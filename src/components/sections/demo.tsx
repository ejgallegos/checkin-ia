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
import { accommodationChat, AccommodationChatInput, AccommodationInfo } from "@/ai/flows/accommodation-chat-flow";
import { Bot, Home, Info, Loader, Send, User, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";


const formSchema = z.object({
  denominacion: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
  telefono: z.string().min(8, "Ingresa un teléfono válido."),
  email: z.string().email("Ingresa un email válido."),
  capacidad: z.coerce.number().min(1, "La capacidad debe ser al menos 1."),
  tipoAlojamiento: z.enum(["departamento", "cabaña", "casa"], {
    required_error: "Debes seleccionar un tipo de alojamiento."
  }),
  ubicacion: z.string().min(3, "La ubicación es requerida."),
});

type AccommodationFormValues = z.infer<typeof formSchema>;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function DemoSection() {
  const [accommodationInfo, setAccommodationInfo] = useState<AccommodationInfo | null>(null);
  const [formValues, setFormValues] = useState<AccommodationFormValues | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userQuery, setUserQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<AccommodationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      denominacion: "",
      descripcion: "",
      telefono: "",
      email: "",
      capacidad: 1,
      ubicacion: "",
    },
  });

  async function onInfoSubmit(values: AccommodationFormValues) {
    setIsLoading(true);
    try {
      await fetch('https://n8n.gali.com.ar/webhook/837f8987-d294-447a-b265-8938f70c3111', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      const infoForAI: AccommodationInfo = {
        name: values.denominacion,
        description: values.descripcion,
        amenities: `Capacidad para ${values.capacidad} personas. Tipo: ${values.tipoAlojamiento}. Contacto: Teléfono ${values.telefono}, Email ${values.email}`,
        location: values.ubicacion,
        contact: `Teléfono: ${values.telefono}, Email: ${values.email}`
      };
      
      setFormValues(values);
      setAccommodationInfo(infoForAI);
      toast({
        title: "¡Información guardada!",
        description: "Ahora puedes empezar a chatear con tu asistente de IA.",
      });
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la información. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim() || !accommodationInfo) return;

    const newUserMessage: ChatMessage = { role: 'user', content: userQuery };
    setChatHistory(prev => [...prev, newUserMessage]);
    setUserQuery("");
    setIsLoading(true);

    try {
      const chatInput: AccommodationChatInput = {
        accommodationInfo,
        chatHistory: chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n'),
        query: userQuery,
      };
      const response = await accommodationChat(chatInput);
      const newAssistantMessage: ChatMessage = { role: 'assistant', content: response };
      setChatHistory(prev => [...prev, newAssistantMessage]);
    } catch (error) {
      console.error("Error calling AI flow:", error);
      toast({
        title: "Error",
        description: "No se pudo obtener una respuesta de la IA. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateQR = async () => {
    if (!formValues) return;
    setIsGeneratingQR(true);
    setQrCodeUrl(null);
    try {
      const encodedDenominacion = encodeURIComponent(formValues.denominacion);
      const response = await fetch(`https://evolution.gali.com.ar/instance/connect/${encodedDenominacion}`, {
        method: 'GET',
        headers: {
          'apikey': 'evolution_api_69976825',
          'accept': 'application/json, text/plain, */*',
        },
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          throw new Error(`Error del servidor: ${response.statusText}`);
        }
        throw new Error(errorData.message || 'Error en la respuesta del servidor.');
      }

      const data = await response.json();

      if (data && data.base64) {
        setQrCodeUrl(data.base64);
        toast({
          title: "¡QR Generado!",
          description: "Escanea el código con tu app de WhatsApp para conectar.",
        });

        // Set webhook after QR is shown
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
                let errorWebhookData;
                try {
                    errorWebhookData = await webhookResponse.json();
                } catch (e) {
                    throw new Error(`Error del servidor al configurar webhook: ${webhookResponse.statusText}`);
                }
                throw new Error(errorWebhookData.message || 'Error al configurar el webhook.');
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
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Genera tu Demo de IA</h2>
          <p className="text-lg text-muted-foreground mt-2">
            Ingresa los datos de tu alojamiento y prueba cómo respondería tu asistente virtual.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <Card className="shadow-2xl">
            {accommodationInfo && formValues ? (
               <>
                <CardHeader>
                  <CardTitle>Información del Alojamiento</CardTitle>
                  <CardDescription>Estos son los datos que usará la IA para responder.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{formValues.denominacion}</h3>
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
                      <p><strong>Email:</strong> {formValues.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p><strong>Teléfono:</strong> {formValues.telefono}</p>
                    </div>
                  </div>
                   {!qrCodeUrl && (
                    <Button onClick={handleGenerateQR} className="w-full mt-4" size="lg" disabled={isGeneratingQR}>
                      {isGeneratingQR ? <Loader className="animate-spin" /> : <> <QrCode className="mr-2"/> Generar QR de Conexión </>}
                    </Button>
                   )}
                   {qrCodeUrl && (
                     <div className="mt-6 text-center flex flex-col items-center">
                       <h4 className="font-semibold mb-2">¡Conexión Lista!</h4>
                       <p className="text-sm text-muted-foreground mb-4">Escanea este código QR desde tu app de WhatsApp para vincular tu número.</p>
                       <img src={qrCodeUrl} alt="Código QR de conexión de WhatsApp" className="w-64 h-64 rounded-lg shadow-md" />
                     </div>
                   )}
                </CardContent>
              </>
            ) : (
            <>
              <CardHeader>
                <CardTitle>1. Configura tu Alojamiento</CardTitle>
                <CardDescription>Completa los detalles para entrenar a tu asistente.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onInfoSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="denominacion"
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
                          <FormLabel>Teléfono de Contacto</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="Ej: +54 9 299 1234567" {...field} disabled={isLoading}/>
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
                          <FormLabel>Email de Contacto</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Ej: contacto@alojamiento.com" {...field} disabled={isLoading}/>
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
                      {isLoading ? <Loader className="animate-spin" /> : 'Guardar y Activar IA'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </>
            )}
          </Card>
          
          <Card className={cn("shadow-2xl", !accommodationInfo && "opacity-50 pointer-events-none")}>
            <CardHeader>
              <CardTitle>2. Chatea con tu Asistente</CardTitle>
              <CardDescription>Haz una consulta como si fueras un turista.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-background rounded-lg border p-4 flex flex-col">
                <div className="flex-grow space-y-4 overflow-y-auto pr-2">
                  {chatHistory.length === 0 && (
                    <div className="text-center text-muted-foreground pt-16">
                      <p>El historial de chat está vacío.</p>
                      <p>¡Haz tu primera pregunta!</p>
                    </div>
                  )}
                  {chatHistory.map((msg, index) => (
                    <div key={index} className={cn("flex items-start gap-3", msg.role === 'user' ? "justify-end" : "justify-start")}>
                      {msg.role === 'assistant' && <Avatar className="bg-primary text-primary-foreground"><Bot /></Avatar>}
                      <div className={cn("rounded-lg px-4 py-2 max-w-xs", msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted")}>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                       {msg.role === 'user' && <Avatar className="bg-secondary-foreground text-secondary"><User /></Avatar>}
                    </div>
                  ))}
                   {isLoading && chatHistory[chatHistory.length -1]?.role === 'user' && (
                    <div className="flex items-start gap-3 justify-start">
                       <Avatar className="bg-primary text-primary-foreground"><Bot /></Avatar>
                      <div className="rounded-lg px-4 py-2 bg-muted flex items-center gap-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        <p className="text-sm">Pensando...</p>
                      </div>
                    </div>
                  )}
                </div>
                <form onSubmit={handleChatSubmit} className="mt-4 flex items-center gap-2">
                  <Input 
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Ej: ¿Aceptan mascotas?"
                    disabled={!accommodationInfo || isLoading}
                  />
                  <Button type="submit" size="icon" disabled={!accommodationInfo || isLoading}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Avatar({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", className)}>
      {children}
    </div>
  )
}
