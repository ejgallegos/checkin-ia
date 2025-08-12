import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="bg-background">
       <div className="container max-w-7xl py-12 md:py-24 text-center flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 animate-fade-in">
          Automatiza tu atención y aumenta tus reservas
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Checkin IA es la plataforma que se encarga de las consultas y reservas por WhatsApp, para que vos te dediques a brindar la mejor experiencia.
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
