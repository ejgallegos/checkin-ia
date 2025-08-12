import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Ana Pérez",
    role: "Anfitriona de 5 propiedades",
    testimonial: "“Checkin IA revolucionó mi negocio. Ahora tengo más tiempo libre y mis ingresos aumentaron un 20%. ¡Es increíble!”",
    avatar: "AP",
    image: "https://placehold.co/100x100.png",
    aiHint: "woman portrait"
  },
  {
    name: "Carlos Gómez",
    role: "Gestor de alquileres temporarios",
    testimonial: "“La implementación fue súper sencilla. El soporte al cliente es excelente y la plataforma es muy intuitiva. Lo recomiendo 100%.”",
    avatar: "CG",
    image: "https://placehold.co/100x100.png",
    aiHint: "man portrait"
  },
  {
    name: "Sofía Rodríguez",
    role: "Dueña de un apart hotel",
    testimonial: "“Mis huéspedes están encantados con la rapidez de las respuestas. La profesionalidad que aporta Checkin IA es un gran valor añadido.”",
    avatar: "SR",
    image: "https://placehold.co/100x100.png",
    aiHint: "woman smiling"
  },
];

export function TestimonialsSection() {
  return (
    <div className="py-12 md:py-24 bg-secondary">
      <div className="container max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Lo que dicen nuestros clientes</h2>
          <p className="text-lg text-muted-foreground mt-2">Historias de éxito de anfitriones como vos.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <Card key={index} className="flex flex-col justify-between shadow-lg">
              <CardContent className="pt-6">
                <p className="text-muted-foreground italic">"{item.testimonial}"</p>
              </CardContent>
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar>
                  <AvatarImage src={item.image} alt={item.name} data-ai-hint={item.aiHint} />
                  <AvatarFallback>{item.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.role}</p>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
