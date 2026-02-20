import { useGetStylists } from '../hooks/useQueries';
import StylistCard from './StylistCard';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StylistShowcase() {
  const { data: stylists, isLoading } = useGetStylists();
  const navigate = useNavigate();

  const featuredStylists = stylists?.slice(0, 3) || [];

  return (
    <section className="section-padding">
      <div className="container-custom mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-sans font-bold text-foreground mb-4">
            Expert Stylists Ready to Serve You
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Meet our talented team of {stylists?.length || 0} professional stylists dedicated to bringing your vision to life
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-96 bg-card rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {featuredStylists.map((stylist) => (
                <StylistCard key={stylist.id} stylist={stylist} />
              ))}
            </div>

            <div className="text-center">
              <Button
                onClick={() => navigate({ to: '/team' })}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                Meet Our Stylists
                <ArrowRight size={18} />
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
