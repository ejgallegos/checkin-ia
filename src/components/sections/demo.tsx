
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
  aire_acondicionado: z.boolean().default(false),
  calefaccion: z.boolean().default(false),
  tv: z.boolean().default(false),
  bano_privado: z.boolean().default(false),
  ropa_cama: z.boolean().default(false),
});

const formSchema = z.object({
  // Step 1: User Registration
  nombre: z.string().min(2, "El nombre es requerido."),
  email: z.string().email("Ingresa un email válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
  
  // Step 2: Accommodation Main Info
  nombreAlojamiento: z.string().min(2, "El nombre del alojamiento debe tener al menos 2 caracteres."),
  tipoAlojamiento: z.enum(["departamento", "cabaña", "casa"], {
    required_error: "Debes seleccionar un tipo de alojamiento."
  }),
  capacidad: z.coerce.number().min(1, "La capacidad debe ser al menos 1."),

  // Step 3: Amenities and Policies
  amenities: amenitiesSchema,
  politicaCancelacion: z.string().min(10, "Describe tu política de cancelación."),
  metodosPago: z.string().min(3, "Menciona al menos un método de pago."),
  
  // Step 4: Final Details
  checkIn: z.string().min(1, "La hora de check-in es requerida."),
  checkOut: z.string().min(1, "La hora de check-out es requerida."),
  mascotas: z.boolean().default(false),
  reglasCasa: z.string().optional(),
  telefono: z.string().min(8, "Ingresa un número de al menos 8 dígitos.").max(15, "El número no puede tener más de 15 dígitos."),
  ubicacion: z.string().min(3, "La ubicación es requerida."),
  descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
});

type UserAndAccommodationFormValues = z.infer<typeof formSchema>;

const stepFields = {
  1: ["nombre", "email", "password"],
  2: ["nombreAlojamiento", "tipoAlojamiento", "capacidad"],
  3: ["amenities", "politicaCancelacion", "metodosPago"],
  4: ["checkIn", "checkOut", "mascotas", "reglasCasa", "telefono", "ubicacion", "descripcion"],
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
      tipoAlojamiento: "departamento",
      descripcion: "",
      telefono: "",
      capacidad: 1,
      ubicacion: "",
      amenities: {
        wifi: false,
        estacionamiento: false,
        cocina: false,
        piscina: false,
        aire_acondicionado: false,
        calefaccion: false,
        tv: false,
        bano_privado: false,
        ropa_cama: false,
      },
      checkIn: "15:00",
      checkOut: "11:00",
      mascotas: false,
      politicaCancelacion: "",
      metodosPago: "",
      reglasCasa: "",
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
        toast({
            title: "Error de Registro",
            description: errorMessage,
            variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      const accommodationDataForApi = {
        data: {
          denominacion: values.nombreAlojamiento,
          tipo: values.tipoAlojamiento,
          capacidad: values.capacidad,
          checkin: `${values.checkIn}:00`,
          checkout: `${values.checkOut}:00`,
          telefono: `+54${values.telefono}`,
          ubicacion: values.ubicacion,
          descripcion: values.descripcion,
          politica_cancelacion: values.politicaCancelacion,
          metodo_pago: values.metodosPago,
          reglas_casa: values.reglasCasa,
          usuario: registerData.user.id,
          Servicios: {
            wifi: values.amenities.wifi,
            cocina: values.amenities.cocina,
            aire_acondicionado: values.amenities.aire_acondicionado,
            estacionamiento: values.amenities.estacionamiento,
            ropa_cama: values.amenities.ropa_cama,
            tv: values.amenities.tv,
            piscina: values.amenities.piscina,
            calefaccion: values.amenities.calefaccion,
            bano_privado: values.amenities.bano_privado,
            mascotas: values.mascotas,
          },
        }
      };
      
      const createAccommodationResponse = await fetch('https://db.turismovillaunion.gob.ar/api/alojamientos?populate=*', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${registerData.jwt}`
        },
        body: JSON.stringify(accommodationDataForApi)
      });
      
      const accommodationResponseData = await createAccommodationResponse.json();

      if (!createAccommodationResponse.ok) {
          const errorData = accommodationResponseData;
          toast({
            title: "Error al Crear Alojamiento",
            description: errorData.error?.message || 'No se pudo crear el alojamiento. Contacta a soporte.',
            variant: "destructive",
          });
          setIsLoading(false);
          return;
      }
      
      const newlyCreatedAccommodation = accommodationResponseData.data;

      // Create Evolution API instance
      const evolutionApiResponse = await fetch('https://evolution.gali.com.ar/instance/create', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'apikey': 'evolution_api_69976825'
          },
          body: JSON.stringify({
              instanceName: values.nombreAlojamiento,
              integration: "WHATSAPP-BAILEYS",
              token: newlyCreatedAccommodation.documentId,
              number: `54${values.telefono}`
          })
      });

      if (!evolutionApiResponse.ok) {
           toast({
            title: "Atención: Falló la conexión con WhatsApp",
            description: "Tu cuenta fue creada, pero no pudimos crear la instancia de WhatsApp. Podrás generarla desde tu panel.",
            variant: "destructive",
          });
      }

      login(registerData.jwt, registerData.user, [newlyCreatedAccommodation]);

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
                <CardTitle>Paso {step} de 4</CardTitle>
                 <CardDescription>
                  {step === 1 && "Crea tu cuenta para gestionar todo desde tu panel."}
                  {step === 2 && "Ingresa los datos principales de tu alojamiento."}
                  {step === 3 && "Define los servicios que ofreces y las políticas principales."}
                  {step === 4 && "Añade los últimos detalles para completar la configuración."}
                </CardDescription>
                 <Progress value={(step / 4) * 100} className="mt-2" />
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onInfoSubmit)} className="space-y-6">
                    
                    {step === 1 && (
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

                    {step === 2 && (
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
                    
                    {step === 3 && (
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
                        <FormField
                        control={form.control}
                        name="politicaCancelacion"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Política de Cancelación</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Ej: Reembolso completo si se cancela 5 días antes de la llegada..." {...field} disabled={isLoading}/>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="metodosPago"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Métodos de Pago Aceptados</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej: Transferencia, Mercado Pago, Efectivo" {...field} disabled={isLoading}/>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                       </div>
                    )}
                    
                    {step === 4 && (
                        <div className="animate-fade-in space-y-6">
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
                            name="reglasCasa"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Reglas de la Casa (Opcional)</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Ej: No fumar, no hacer fiestas, horario de silencio..." {...field} disabled={isLoading}/>
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
                              <div className="flex items-center">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-secondary text-muted-foreground text-sm">
                                  +54
                                </span>
                                <FormControl>
                                  <Input type="tel" placeholder="92991234567" {...field} disabled={isLoading} className="rounded-l-none" />
                                </FormControl>
                              </div>
                              <FormMessage />
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

                    <div className="flex justify-between pt-4">
                      {step > 1 ? (
                         <Button type="button" variant="outline" onClick={handlePrevStep} disabled={isLoading}>
                           <ArrowLeft className="mr-2"/>
                           Volver
                         </Button>
                      ) : <div />}

                      {step < 4 && (
                         <Button type="button" onClick={handleNextStep} disabled={isLoading}>
                           Siguiente
                         </Button>
                      )}

                      {step === 4 && (
                        <Button type="submit" size="lg" disabled={isLoading}>
                          {isLoading ? <Loader className="animate-spin" /> : 'Finalizar y Activar IA'}
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
