
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
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState } from "react";
import { Loader } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const formSchema = z.object({
  email: z.string().email("Ingresa un email válido."),
  password: z.string().min(1, "La contraseña es requerida."),
});

type LoginFormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    try {
      const loginResponse = await fetch('https://db.turismovillaunion.gob.ar/api/auth/local', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: values.email,
          password: values.password,
        }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData.error?.message || 'Credenciales inválidas.');
      }

      const { jwt, user } = loginData;

      // Usar el endpoint correcto para obtener alojamientos por usuario con populate
      const accommodationsResponse = await fetch(`https://db.turismovillaunion.gob.ar/api/alojamientos?filters[usuario][id][$eq]=${user.id}&populate=*`, {
          headers: {
              'Authorization': `Bearer ${jwt}`
          }
      });
      const accommodationsData = await accommodationsResponse.json();
      
      const accommodations = accommodationsData.data;

      login(jwt, user, accommodations);

      toast({
        title: "¡Inicio de Sesión Exitoso!",
        description: "Serás redirigido a tu panel.",
      });

      router.push('/dashboard');

    } catch (error) {
      toast({
        title: "Error de Inicio de Sesión",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        <Card className="shadow-2xl w-full max-w-md">
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>Ingresa a tu cuenta para gestionar tus alojamientos.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? <Loader className="animate-spin" /> : 'Ingresar'}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                    ¿No tienes una cuenta?{' '}
                    <a href="/#demo" className="underline text-primary">
                        Regístrate aquí
                    </a>
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
