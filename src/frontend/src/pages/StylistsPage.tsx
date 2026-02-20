import { useGetStylists } from '../hooks/useQueries';
import StylistCard from '../components/StylistCard';
import { Users } from 'lucide-react';

export default function StylistsPage() {
  const { data: stylists, isLoading, error } = useGetStylists();

  return (
    <div className="min-h-screen">
      <section className="section-padding">
        <div className="container-custom mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-4">
              <Users size={32} className="text-secondary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-4">
              Our Expert Team
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Meet the talented stylists who bring passion, skill, and artistry to every appointment
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-card rounded-lg animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">Failed to load team members. Please try again later.</p>
            </div>
          ) : stylists && stylists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stylists.map((stylist) => (
                <StylistCard key={stylist.id} stylist={stylist} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No team members available at the moment.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
