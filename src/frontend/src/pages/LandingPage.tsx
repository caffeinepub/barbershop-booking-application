import HeroSection from '../components/HeroSection';
import ServicesOverview from '../components/ServicesOverview';
import StylistShowcase from '../components/StylistShowcase';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin, useGetAllSalons, useGetAllAppointments } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Calendar, CheckCircle, Clock } from 'lucide-react';
import { RegistrationStatus, AppointmentStatus } from '../backend';

export default function LandingPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: salons } = useGetAllSalons();
  const { data: appointments } = useGetAllAppointments();

  const isAuthenticated = !!identity;

  // Calculate platform statistics
  const totalSalons = salons?.length || 0;
  const pendingSalons = salons?.filter(s => s.status === RegistrationStatus.pending).length || 0;
  const approvedSalons = salons?.filter(s => s.status === RegistrationStatus.approved).length || 0;
  const totalBookings = appointments?.length || 0;
  const pendingBookings = appointments?.filter(a => a.status === AppointmentStatus.pending).length || 0;
  const confirmedBookings = appointments?.filter(a => a.status === AppointmentStatus.confirmed).length || 0;

  return (
    <div className="w-full">
      <HeroSection />
      
      {/* Platform Statistics Section - Only for authenticated admins */}
      {isAuthenticated && isAdmin && (
        <section className="section-padding bg-muted/30">
          <div className="container-custom mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-sans font-bold text-foreground mb-4">
                Platform Overview
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Real-time insights into your salon network performance and operations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-sm font-medium">Total Salons</CardDescription>
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-4xl font-bold">{totalSalons}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <span className="text-green-600 font-semibold">{approvedSalons}</span> approved
                    {pendingSalons > 0 && (
                      <span className="ml-2">
                        · <span className="text-yellow-600 font-semibold">{pendingSalons}</span> pending
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-sm font-medium">Total Bookings</CardDescription>
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-4xl font-bold">{totalBookings}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Across all partner salons
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-sm font-medium">Confirmed</CardDescription>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <CardTitle className="text-4xl font-bold text-green-600">{confirmedBookings}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Active appointments
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-sm font-medium">Pending Review</CardDescription>
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <CardTitle className="text-4xl font-bold text-yellow-600">{pendingBookings}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Awaiting confirmation
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      <ServicesOverview />
      <StylistShowcase />
    </div>
  );
}
