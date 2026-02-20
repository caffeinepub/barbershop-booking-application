import { useNavigate } from '@tanstack/react-router';
import { MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  const navigate = useNavigate();

  const handleFindNearby = () => {
    navigate({ to: '/salons' });
    // Trigger location request after navigation
    setTimeout(() => {
      const locationBtn = document.querySelector('[data-location-trigger]') as HTMLButtonElement;
      locationBtn?.click();
    }, 100);
  };

  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/assets/generated/hero-barbershop.dim_1920x800.png)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container-custom mx-auto px-4 py-20">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-sans font-bold text-foreground mb-6 leading-tight">
            Discover and Book Your Perfect Salon Experience
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed">
            Find verified salons near you, browse expert stylists, and book appointments with ease. Your next great look is just a click away.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              onClick={handleFindNearby}
              className="text-lg px-8 py-6 gap-2"
            >
              <MapPin className="h-5 w-5" />
              Find Salons Near Me
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate({ to: '/salons' })}
              className="text-lg px-8 py-6 gap-2"
            >
              <Search className="h-5 w-5" />
              Browse All Salons
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
