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
import { Loader } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from 'next/navigation';

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
  const [isLoading, setIsLoading] = useState(false);
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

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        const errorMessage = registerData.error?.message || 'Error en el registro. Inténtalo de nuevo.';
        throw new Error(errorMessage);
      }
      
      const accommodationData = {
        name: values.nombreAlojamiento,
        description: values.descripcion,
        amenities: `Capacidad para ${values.capacidad} personas. Tipo: ${values.tipoAlojamiento}. Contacto: Teléfono ${values.telefono}`,
        location: values.ubicacion,
        contact: `Teléfono: ${values.telefono}`,
        owner: registerData.user.id, 
      };

      // TODO: Guardar el alojamiento en la base de datos
      
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
            Regístrate y configura tu primer alojamiento para comenzar a automatizar.
          </p>
        </div>
        <div className="flex justify-center">
          <Card className="shadow-2xl w-full">
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
                    <h3 className="text-lg font-semibold border-b pb-2 pt-4">Datos de tu Primer Alojamiento</h3>
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
          </Card>
        </div>
      </div>
    </div>
  );
}
