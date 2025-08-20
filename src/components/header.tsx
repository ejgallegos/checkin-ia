"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { MessageSquareMore } from "lucide-react";

export function Header() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center justify-between mx-auto">
        <div className="flex items-center gap-2">
          <MessageSquareMore className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">Checkin IA</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="/#benefits" className="transition-colors hover:text-foreground/80 text-foreground/60">Beneficios</a>
          <a href="/#testimonials" className="transition-colors hover:text-foreground/80 text-foreground/60">Testimonios</a>
          <a href="/#faq" className="transition-colors hover:text-foreground/80 text-foreground/60">FAQs</a>
          <a href="/#demo" className="transition-colors hover:text-foreground/80 text-foreground/60">Demo IA</a>
        </nav>
        <div className="flex items-center gap-4">
           {user ? (
             <Button asChild>
                <a href="/dashboard">Mi Panel</a>
              </Button>
           ) : (
            <Button asChild>
                <a href="/login">Iniciar Sesión</a>
            </Button>
           )}
        </div>
      </div>
    </header>
  );
}
