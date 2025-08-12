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
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";

const formSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  email: z.string().email("Por favor, introduce un email válido."),
  phone: z.string().min(8, "El teléfono debe tener al menos 8 caracteres."),
  message: z.string().optional(),
});

export function ContactSection() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "¡Formulario enviado!",
      description: "Gracias por tu interés. Nos pondremos en contacto con vos pronto.",
    });
    form.reset();
  }

  return (
    <div className="w-full py-12 md:py-24 bg-secondary">
      <div className="container max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">¿Listo para empezar?</h2>
              <p className="text-lg text-muted-foreground">
                Completá el formulario para agendar una demostración personalizada y descubrir cómo Checkin IA puede transformar la gestión de tus alojamientos.
              </p>
              <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl">
                <Image src="https://placehold.co/600x400.png" alt="Checkin IA en acción" layout="fill" objectFit="cover" data-ai-hint="software dashboard" />
              </div>
          </div>

          <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle>Agendá tu demo gratuita</CardTitle>
              <CardDescription>Sin compromiso, solo oportunidades.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Tu nombre" {...field} />
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
                          <Input type="email" placeholder="tu@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono / WhatsApp</FormLabel>
                        <FormControl>
                          <Input placeholder="Tu número de contacto" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensaje (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Contanos un poco sobre tu negocio..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" size="lg">Enviar y Agendar Demo</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}