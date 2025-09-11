import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "¿Necesito conocimientos técnicos para usar Checkin IA?",
    answer: "No, para nada. La plataforma está diseñada para ser muy intuitiva y fácil de usar. La configuración inicial te tomará solo unos minutos."
  },
  {
    question: "¿En qué idiomas puede responder la IA?",
    answer: "Nuestra IA está preparada para comunicarse fluidamente en español, inglés y portugués. Estamos trabajando para añadir más idiomas próximamente."
  },
  {
    question: "¿Qué número de WhatsApp necesito para el asistente?",
    answer: "Necesitarás un número de teléfono exclusivo para tu asistente de Checkin IA. No puede ser tu número personal, ya que este se convertirá en el canal de comunicación automatizado con tus huéspedes."
  },
  {
    question: "¿Cómo se integra con mi cuenta de WhatsApp?",
    answer: "La integración es muy sencilla y segura. Simplemente escaneas un código QR desde la aplicación de WhatsApp en el teléfono que dedicarás al asistente y la conexión queda establecida."
  },
  {
    question: "¿Qué pasa si la IA no sabe responder una pregunta?",
    answer: "Si la IA encuentra una consulta que no puede resolver, te notificará inmediatamente para que puedas intervenir y responder personalmente al huésped."
  },
  {
    question: "¿Hay un período de prueba?",
    answer: "Sí, ofrecemos una prueba gratuita de 7 días sin compromiso para que puedas experimentar todo el potencial de Checkin IA en tu negocio."
  }
];

export function FaqSection() {
  return (
    <div className="w-full py-12 md:py-24 bg-background">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Preguntas Frecuentes</h2>
          <p className="text-lg text-muted-foreground mt-2">Resolvemos tus dudas más comunes.</p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="text-lg text-left">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
