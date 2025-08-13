import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="w-full bg-background">
      <div className="container max-w-7xl mx-auto py-12 md:py-24 text-center flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 animate-fade-in">
          Conversaciones que se convierten en reservas.
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Checkin IA es tu asistente virtual para alojamientos temporarios. Atiende consultas en WhatsApp de forma instantánea, brinda información clara y personalizada, y guía al viajero hasta confirmar su estadía. Todo de manera automatizada, eficiente y siempre disponible.
        </p>
        <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <Button size="lg" asChild>
            <a href="#contact">Pedir más información</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
