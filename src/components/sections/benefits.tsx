import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Bot, Clock, Sparkles, MessagesSquare } from "lucide-react";

const benefits = [
  {
    icon: <Bot className="w-10 h-10 text-primary" />,
    title: "Automatización Inteligente",
    description: "Deja que nuestra IA gestione las consultas y reservas, liberándote para otras tareas."
  },
  {
    icon: <Clock className="w-10 h-10 text-primary" />,
    title: "Ahorro de Tiempo",
    description: "Reduce horas de trabajo manual y responde a tus huéspedes instantáneamente."
  },
  {
    icon: <Sparkles className="w-10 h-10 text-primary" />,
    title: "Imagen Profesional",
    description: "Ofrece una atención al cliente pulida y consistente que mejora la confianza."
  },
  {
    icon: <MessagesSquare className="w-10 h-10 text-primary" />,
    title: "Respuestas 24/7",
    description: "No pierdas ninguna reserva. Tu asistente virtual trabaja día y noche."
  },
];

export function BenefitsSection() {
  return (
    <div className="w-full py-12 md:py-24 bg-background">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Ventajas de usar Checkin IA</h2>
          <p className="text-lg text-muted-foreground mt-2">Descubre cómo podemos potenciar tu negocio.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="flex-shrink-0">
                  {benefit.icon}
                </div>
                <div className="flex-grow">
                  <CardTitle>{benefit.title}</CardTitle>
                  <CardDescription className="mt-2">{benefit.description}</CardDescription>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}