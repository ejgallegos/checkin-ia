
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
import { Loader, ArrowLeft, Map } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from 'next/navigation';
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "../ui/checkbox";
import { Switch } from "../ui/switch";

const amenitiesSchema = z.object({
  wifi: z.boolean().default(false),
  estacionamiento: z.boolean().default(false),
  cocina: z.boolean().default(false),
  piscina: z.boolean().default(false),
  ac: z.boolean().default(false),
  calefaccion: z.boolean().default(false),
  tv: z.boolean().default(false),
  banoPrivado: z.boolean().default(false),
  ropaDeCama: z.boolean().default(false),
});

const formSchema = z.object({
  // Step 3 fields
  nombre: z.string().min(2, "El nombre es requerido."),
  email: z.string().email("Ingresa un email válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
  // Step 1 fields
  nombreAlojamiento: z.string().min(2, "El nombre del alojamiento debe tener al menos 2 caracteres."),
  tipoAlojamiento: z.enum(["departamento", "cabaña", "casa"], {
    required_error: "Debes seleccionar un tipo de alojamiento."
  }),
  capacidad: z.coerce.number().min(1, "La capacidad debe ser al menos 1."),
  // Step 2 fields
  descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
  telefono: z.string().min(8, "Ingresa un teléfono válido."),
  ubicacion: z.string().min(3, "La ubicación es requerida."),
  amenities: amenitiesSchema,
  checkIn: z.string().min(1, "La hora de check-in es requerida."),
  checkOut: z.string().min(1, "La hora de check-out es requerida."),
  mascotas: z.boolean().default(false),
});

type UserAndAccommodationFormValues = z.infer<typeof formSchema>;

const stepFields = {
  1: ["nombreAlojamiento", "tipoAlojamiento", "capacidad"],
  2: ["descripcion", "telefono", "ubicacion", "amenities", "checkIn", "checkOut", "mascotas"],
  3: ["nombre", "email", "password"],
};

const amenityItems = [
  { id: "wifi", label: "WiFi" },
  { id: "estacionamiento", label: "Estacionamiento" },
  { id: "cocina", label: "Cocina" },
  { id: "piscina", label: "Piscina" },
  { id: "ac", label: "Aire Acondicionado" },
  { id: "calefaccion", label: "Calefacción" },
  { id: "tv", label: "TV" },
  { id: "banoPrivado", label: "Baño Privado" },
  { id: "ropaDeCama", label: "Ropa de Cama" },
] as const;

export function DemoSection() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const { login } = useAuth();
  const router = useRouter();

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
      amenities: {
        wifi: false,
        estacionamiento: false,
        cocina: false,
        piscina: false,
        ac: false,
        calefaccion: false,
        tv: false,
        banoPrivado: false,
        ropaDeCama: false,
      },
      checkIn: "15:00",
      checkOut: "11:00",
      mascotas: false,
    },
  });

  const handleNextStep = async () => {
    const fieldsToValidate = stepFields[step as keyof typeof stepFields];
    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };


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

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        const errorMessage = registerData.error?.message || 'Error en el registro. Inténtalo de nuevo.';
        throw new Error(errorMessage);
      }
      
       const selectedAmenities = Object.entries(values.amenities)
        .filter(([, isSelected]) => isSelected)
        .map(([key]) => amenityItems.find(item => item.id === key)?.label)
        .filter(Boolean)
        .join(', ');

      const amenityDetails = [
        `Capacidad para ${values.capacidad} personas`,
        `Tipo: ${values.tipoAlojamiento}`,
        selectedAmenities ? `Servicios: ${selectedAmenities}` : '',
        `Horario de Check-in: ${values.checkIn}`,
        `Horario de Check-out: ${values.checkOut}`,
        `Mascotas: ${values.mascotas ? 'Sí' : 'No'}`,
      ].filter(Boolean).join('. ');

      const accommodationData = {
        name: values.nombreAlojamiento,
        description: values.descripcion,
        amenities: amenityDetails,
        location: values.ubicacion,
        contact: `Teléfono: ${values.telefono}`,
        owner: registerData.user.id, 
      };

      const createAccommodationResponse = await fetch('https://db.turismovillaunion.gob.ar/api/accommodations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${registerData.jwt}`
        },
        body: JSON.stringify({ data: accommodationData })
      });
      
      if (!createAccommodationResponse.ok) {
          const errorData = await createAccommodationResponse.json();
          throw new Error(errorData.error?.message || 'No se pudo crear el alojamiento.');
      }
      
      login(registerData.jwt, registerData.user, [accommodationData]);

      toast({
        title: "¡Registro Exitoso!",
        description: "Tu cuenta ha sido creada. Serás redirigido a tu panel.",
      });

      router.push('/dashboard');

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


  return (
    <div className="w-full py-12 md:py-24 bg-secondary">
      <div className="container max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Crea tu Cuenta y Conecta tu WhatsApp</h2>
          <p className="text-lg text-muted-foreground mt-2">
            Sigue los pasos para registrarte y configurar tu primer alojamiento.
          </p>
        </div>
        <div className="flex justify-center">
          <Card className="shadow-2xl w-full">
              <CardHeader>
                <CardTitle>Paso {step} de 3</CardTitle>
                 <CardDescription>
                  {step === 1 && "Ingresa los datos principales de tu alojamiento."}
                  {step === 2 && "Describe tu lugar, servicios y políticas."}
                  {step === 3 && "Crea tu cuenta para gestionar todo desde tu panel."}
                </CardDescription>
                 <Progress value={(step / 3) * 100} className="mt-2" />
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onInfoSubmit)} className="space-y-6">
                    
                    {step === 1 && (
                      <div className="animate-fade-in space-y-4">
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
                      </div>
                    )}
                    
                    {step === 2 && (
                       <div className="animate-fade-in space-y-6">
                        <FormField
                          control={form.control}
                          name="amenities"
                          render={() => (
                            <FormItem>
                              <div className="mb-4">
                                <FormLabel className="text-base">Servicios</FormLabel>
                                <p className="text-sm text-muted-foreground">
                                  Selecciona los servicios que ofreces.
                                </p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                {amenityItems.map((item) => (
                                  <FormField
                                    key={item.id}
                                    control={form.control}
                                    name={`amenities.${item.id}`}
                                    render={({ field }) => (
                                      <FormItem
                                        key={item.id}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                          {item.label}
                                        </FormLabel>
                                      </FormItem>
                                    )}
                                  />
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <div className="grid grid-cols-2 gap-4">
                            <FormField
                            control={form.control}
                            name="checkIn"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Hora de Check-in</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} disabled={isLoading}/>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name="checkOut"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Hora de Check-out</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} disabled={isLoading}/>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="mascotas"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">
                                    ¿Se aceptan mascotas?
                                    </FormLabel>
                                    <p className="text-sm text-muted-foreground">
                                        Indica si los huéspedes pueden traer a sus mascotas.
                                    </p>
                                </div>
                                <FormControl>
                                    <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                          control={form.control}
                          name="ubicacion"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ubicación (Coordenadas de Google Maps)</FormLabel>
                               <p className="text-[0.8rem] text-muted-foreground">
                                 Busca tu dirección en Google Maps, haz clic derecho en la ubicación y copia las coordenadas.
                               </p>
                              <div className="flex gap-2">
                                <FormControl>
                                    <Input placeholder="Ej: -29.4134, -68.7745" {...field} disabled={isLoading}/>
                                </FormControl>
                                <Button type="button" variant="outline" size="icon" onClick={() => window.open('https://maps.google.com', '_blank')}>
                                    <Map className="h-4 w-4" />
                                </Button>
                               </div>
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
                          name="descripcion"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descripción en General</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Describe tu lugar, qué lo hace especial..." {...field} disabled={isLoading}/>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                       </div>
                    )}

                    {step === 3 && (
                       <div className="animate-fade-in space-y-4">
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
                       </div>
                    )}

                    <div className="flex justify-between pt-4">
                      {step > 1 ? (
                         <Button type="button" variant="outline" onClick={handlePrevStep} disabled={isLoading}>
                           <ArrowLeft className="mr-2"/>
                           Volver
                         </Button>
                      ) : <div />}

                      {step < 3 && (
                         <Button type="button" onClick={handleNextStep} disabled={isLoading}>
                           Siguiente
                         </Button>
                      )}

                      {step === 3 && (
                        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                          {isLoading ? <Loader className="animate-spin" /> : 'Registrar y Activar IA'}
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

    