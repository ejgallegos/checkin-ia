export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t">
      <div className="container max-w-7xl flex items-center justify-center py-6 mx-auto">
        <p className="text-sm text-muted-foreground">
          &copy; {currentYear} Checkin IA. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}