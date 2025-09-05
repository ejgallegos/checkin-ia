
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Básico",
    price: "$9.99/mes",
    description: "Para empezar a automatizar la comunicación con tus huéspedes.",
    trial: "Prueba gratis por 30 días",
    features: [
      "Automatización de respuestas a consultas frecuentes.",
      "Información completa y detallada del alojamiento.",
      "Conexión con tu número de WhatsApp.",
      "Panel de gestión de alojamientos."
    ],
    isFeatured: false,
  },
  {
    name: "Premium",
    price: "$29.9/mes",
    description: "La solución completa para maximizar tus reservas y eficiencia.",
    trial: null,
    features: [
      "Todo lo del plan Básico.",
      "Envío de imágenes y videos del alojamiento.",
      "Gestión de calendario y disponibilidad.",
      "Sistema de reservas y confirmación de fechas."
    ],
    isFeatured: true,
  },
];

export function PricingSection() {
  return (
    <div className="w-full py-12 md:py-24 bg-secondary">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Planes a tu Medida</h2>
          <p className="text-lg text-muted-foreground mt-2">Elige el plan que mejor se adapte a tu negocio.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {plans.map((plan) => (
            <Card key={plan.name} className={cn("flex flex-col h-full", plan.isFeatured && "border-primary border-2 shadow-2xl")}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.name !== "Básico" && <span className="text-muted-foreground">/alojamiento</span>}
                  {plan.trial && <p className="text-sm text-primary font-semibold mt-1">{plan.trial}</p>}
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                 <Button asChild className="w-full" variant={plan.isFeatured ? "default" : "outline"}>
                    <a href="#demo">
                        {plan.isFeatured ? "Comenzar Ahora" : "Elegir Plan"}
                    </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
