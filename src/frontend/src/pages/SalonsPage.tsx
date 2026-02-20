import { useState, useEffect } from 'react';
import { useGetAllSalons } from '../hooks/useQueries';
import SalonCard from '../components/SalonCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, MapPin, AlertCircle } from 'lucide-react';
import type { Salon } from '../backend';

export default function SalonsPage() {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(true);

  const { data: allSalons, isLoading: salonsLoading } = useGetAllSalons();

  // Auto-detect location on component mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setIsDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsDetectingLocation(false);
      },
      (error) => {
        // Handle permission denial gracefully
        if (error.code === 1) {
          setLocationError('Location permission denied. Showing all salons without distance information.');
        } else if (error.code === 2) {
          setLocationError('Location unavailable. Showing all salons without distance information.');
        } else if (error.code === 3) {
          setLocationError('Location request timed out. Showing all salons without distance information.');
        } else {
          setLocationError('Unable to detect location. Showing all salons without distance information.');
        }
        setIsDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  // Filter approved salons and calculate distances
  const approvedSalons = allSalons?.filter(salon => salon.status === 'approved') || [];
  
  const salonsWithDistance = approvedSalons.map(salon => {
    if (!userLocation) {
      return { salon, distance: null };
    }
    
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      salon.latitude,
      salon.longitude
    );
    
    return { salon, distance };
  }).sort((a, b) => {
    // Sort by distance when available, otherwise keep original order
    if (a.distance === null || b.distance === null) return 0;
    return a.distance - b.distance;
  });

  const isLoading = salonsLoading || isDetectingLocation;

  return (
    <div className="container-custom mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-sans font-bold text-foreground mb-3 flex items-center gap-3">
            <Building2 className="w-10 h-10 text-primary" />
            Find Your Perfect Salon
          </h1>
          <p className="text-base text-muted-foreground">
            Discover verified salons {userLocation ? 'sorted by distance from your location' : 'and book your next appointment with ease'}
          </p>
        </div>

        {/* Location status message */}
        {locationError && (
          <Card className="mb-6 border-muted">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">{locationError}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {userLocation && !locationError && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                <p className="text-sm font-medium text-foreground">
                  Showing all salons sorted by distance from your location
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {isLoading ? (
              'Loading salons...'
            ) : (
              <>
                Showing <span className="font-semibold text-foreground">{salonsWithDistance.length}</span> approved salon
                {salonsWithDistance.length !== 1 ? 's' : ''}
              </>
            )}
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-72 w-full" />
            ))}
          </div>
        ) : salonsWithDistance.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {salonsWithDistance.map(({ salon, distance }) => (
              <SalonCard key={salon.id} salon={salon} distance={distance} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No approved salons available at the moment
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRadians = (deg: number) => (deg * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}
