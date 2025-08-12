import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { PageClient } from '@/components/page-client';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <PageClient />
      </main>
      <Footer />
    </div>
  );
}
