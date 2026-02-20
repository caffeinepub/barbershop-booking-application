import { useGetServices } from '../hooks/useQueries';
import ServiceCard from './ServiceCard';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ServicesOverview() {
  const { data: services, isLoading } = useGetServices();
  const navigate = useNavigate();

  const featuredServices = services?.slice(0, 4) || [];

  return (
    <section className="section-padding bg-muted/30">
      <div className="container-custom mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-sans font-bold text-foreground mb-4">
            Popular Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our wide range of professional salon services. From classic cuts to modern styling, we've got you covered.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-card rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {featuredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>

            <div className="text-center">
              <Button
                onClick={() => navigate({ to: '/services' })}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                View All Services
                <ArrowRight size={18} />
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
