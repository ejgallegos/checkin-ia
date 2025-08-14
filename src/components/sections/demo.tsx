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
import { Bot, Loader, Send, User } from "lucide-react";
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
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userQuery, setUserQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
      const response = await fetch('https://n8n.gali.com.ar/webhook/837f8987-d294-447a-b265-8938f70c3111', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Error al enviar al webhook');
      }
      
      const infoForAI: AccommodationInfo = {
        name: values.denominacion,
        description: values.descripcion,
        amenities: `Capacidad para ${values.capacidad} personas. Tipo: ${values.tipoAlojamiento}.`, // Combino info relevante aquí.
        location: values.ubicacion,
        contact: `Teléfono: ${values.telefono}, Email: ${values.email}`
      };

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

    