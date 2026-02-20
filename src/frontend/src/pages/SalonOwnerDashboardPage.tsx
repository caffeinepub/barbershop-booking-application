import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAllSalons, useGetSalonDashboard } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, TrendingUp, Calendar, Star, AlertCircle } from 'lucide-react';
import MonthlySalesChart from '../components/MonthlySalesChart';
import MonthlyBookingsChart from '../components/MonthlyBookingsChart';
import ReviewsList from '../components/ReviewsList';
import { useNavigate } from '@tanstack/react-router';

export default function SalonOwnerDashboardPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: allSalons, isLoading: salonsLoading } = useGetAllSalons();
  const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null);

  const isAuthenticated = !!identity;

  // Find salons owned by the current user (matching by principal in ownerName field)
  const ownedSalons = allSalons?.filter(salon => 
    salon.ownerName === identity?.getPrincipal().toString()
  ) || [];

  // Auto-select first owned salon
  useEffect(() => {
    if (ownedSalons.length > 0 && !selectedSalonId) {
      setSelectedSalonId(ownedSalons[0].id);
    }
  }, [ownedSalons, selectedSalonId]);

  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useGetSalonDashboard(selectedSalonId || '');

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container-custom mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-4">
              Please log in to access your salon dashboard.
            </p>
            <Button onClick={() => navigate({ to: '/' })}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (salonsLoading) {
    return (
      <div className="container-custom mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  // Show no salon message if user doesn't own any salons
  if (ownedSalons.length === 0) {
    return (
      <div className="container-custom mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Salon Found</h2>
            <p className="text-muted-foreground mb-4">
              You don't have any registered salons yet. Please register your salon to access the dashboard.
            </p>
            <Button onClick={() => navigate({ to: '/' })}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedSalon = ownedSalons.find(s => s.id === selectedSalonId);

  // Show error if dashboard access is denied
  if (dashboardError) {
    return (
      <div className="container-custom mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto border-destructive">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You do not have permission to view this salon dashboard.
            </p>
            <Button onClick={() => navigate({ to: '/' })}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container-custom mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-sans font-bold text-foreground mb-3 flex items-center gap-3">
            <Building2 className="w-10 h-10 text-primary" />
            My Salon Dashboard
          </h1>
          <p className="text-base text-muted-foreground">
            Track your salon's performance, bookings, and customer feedback
          </p>
        </div>

        {/* Salon Selector (if multiple salons) */}
        {ownedSalons.length > 1 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                {ownedSalons.map(salon => (
                  <Button
                    key={salon.id}
                    variant={selectedSalonId === salon.id ? 'default' : 'outline'}
                    onClick={() => setSelectedSalonId(salon.id)}
                  >
                    {salon.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Salon Info */}
        {selectedSalon && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">{selectedSalon.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedSalon.address}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {selectedSalon.verified && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedSalon.status === 'approved' ? 'bg-green-100 text-green-800' :
                      selectedSalon.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedSalon.status.charAt(0).toUpperCase() + selectedSalon.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {dashboardLoading ? (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        ) : dashboardData ? (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${(dashboardData.monthlySales.reduce((sum, month) => sum + Number(month.totalRevenueCents), 0) / 100).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last 12 months
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData.monthlyBookings.reduce((sum, month) => sum + Number(month.totalBookings), 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last 12 months
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Customer Reviews</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData.reviews.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData.reviews.length > 0 && (
                      <>
                        Avg: {(dashboardData.reviews.reduce((sum, r) => sum + r.rating, 0) / dashboardData.reviews.length).toFixed(1)} ⭐
                      </>
                    )}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sales Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Sales Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MonthlySalesChart data={dashboardData.monthlySales} />
              </CardContent>
            </Card>

            {/* Booking Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Booking Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MonthlyBookingsChart data={dashboardData.monthlyBookings} />
              </CardContent>
            </Card>

            {/* Customer Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Customer Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ReviewsList reviews={dashboardData.reviews} />
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}
