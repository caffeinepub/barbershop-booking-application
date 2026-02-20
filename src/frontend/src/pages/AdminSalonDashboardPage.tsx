import { useState } from 'react';
import { useGetAllSalons, useIsCallerAdmin, useGetAllAppointments, useGetStylists } from '../hooks/useQueries';
import { RegistrationStatus, AppointmentStatus } from '../backend';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, MapPin, User, Search, Calendar, Users, CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Salon } from '../backend';
import { useNavigate } from '@tanstack/react-router';

export default function AdminSalonDashboardPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const { data: salons, isLoading } = useGetAllSalons();
  const { data: appointments } = useGetAllAppointments();
  const { data: stylists } = useGetStylists();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | RegistrationStatus>('all');
  const navigate = useNavigate();

  const isAuthenticated = !!identity;

  // Show loading while checking admin status
  if (!isAuthenticated || isAdminLoading) {
    return (
      <div className="container-custom mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  // Access denied screen for non-admin users
  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-destructive">Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to view this page. Admin access is required.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: RegistrationStatus): "default" | "secondary" | "destructive" => {
    switch (status) {
      case RegistrationStatus.approved:
        return 'default';
      case RegistrationStatus.rejected:
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Calculate metrics for each salon
  const getSalonMetrics = (salonId: string) => {
    const salonAppointments = appointments?.filter(apt => apt.salonId === salonId) || [];
    const salonStylists = stylists?.filter(s => s.id.startsWith(salonId)) || [];
    const recentActivity = salonAppointments.length > 0 
      ? new Date(Math.max(...salonAppointments.map(apt => Number(apt.dateTime) / 1000000)))
      : null;

    return {
      appointmentCount: salonAppointments.length,
      stylistCount: salonStylists.length,
      recentActivity,
    };
  };

  // Filter salons
  const filteredSalons = salons?.filter(salon => {
    const matchesSearch = searchTerm === '' || 
      salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salon.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salon.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || salon.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const pendingCount = salons?.filter(s => s.status === RegistrationStatus.pending).length || 0;
  const approvedCount = salons?.filter(s => s.status === RegistrationStatus.approved).length || 0;
  const rejectedCount = salons?.filter(s => s.status === RegistrationStatus.rejected).length || 0;
  const totalSalons = salons?.length || 0;
  const verificationRate = totalSalons > 0 ? Math.round((approvedCount / totalSalons) * 100) : 0;

  return (
    <div className="container-custom mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header with Hero Image Reference */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 opacity-5 rounded-lg overflow-hidden">
            <img 
              src="/assets/generated/dashboard-hero.dim_1200x600.png" 
              alt="" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative">
            <h1 className="text-4xl font-sans font-bold text-foreground mb-3">
              Salon Network Dashboard
            </h1>
            <p className="text-base text-muted-foreground">
              Centralized management hub for your salon partnerships and network operations
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                Active partnerships
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-yellow-500/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-sm font-medium">Pending</CardDescription>
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <CardTitle className="text-4xl font-bold text-yellow-600">{pendingCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Awaiting approval
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-green-500/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-sm font-medium">Verification Rate</CardDescription>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="text-4xl font-bold text-green-600">{verificationRate}%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {approvedCount} approved
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-blue-500/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-sm font-medium">Network Growth</CardDescription>
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-4xl font-bold text-blue-600">+{pendingCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                New registrations
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button 
            onClick={() => navigate({ to: '/admin/bookings' })}
            variant="outline" 
            className="h-auto py-4 flex flex-col items-start gap-2"
          >
            <Calendar className="h-5 w-5 text-primary" />
            <div className="text-left">
              <div className="font-semibold">Manage Bookings</div>
              <div className="text-xs text-muted-foreground">View all appointments</div>
            </div>
          </Button>
          <Button 
            onClick={() => navigate({ to: '/salons' })}
            variant="outline" 
            className="h-auto py-4 flex flex-col items-start gap-2"
          >
            <Building2 className="h-5 w-5 text-primary" />
            <div className="text-left">
              <div className="font-semibold">Partner Salons</div>
              <div className="text-xs text-muted-foreground">View salon network</div>
            </div>
          </Button>
          <Button 
            onClick={() => setSelectedStatus(RegistrationStatus.pending)}
            variant="outline" 
            className="h-auto py-4 flex flex-col items-start gap-2"
          >
            <Clock className="h-5 w-5 text-yellow-600" />
            <div className="text-left">
              <div className="font-semibold">Approve Salons</div>
              <div className="text-xs text-muted-foreground">{pendingCount} pending review</div>
            </div>
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              type="text"
              placeholder="Search by name, location, or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6" onValueChange={(value) => {
          if (value === 'all') setSelectedStatus('all');
          else if (value === 'pending') setSelectedStatus(RegistrationStatus.pending);
          else if (value === 'approved') setSelectedStatus(RegistrationStatus.approved);
          else if (value === 'rejected') setSelectedStatus(RegistrationStatus.rejected);
        }}>
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="all">All ({totalSalons})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-64" />
                ))}
              </div>
            ) : filteredSalons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSalons.map((salon) => {
                  const metrics = getSalonMetrics(salon.id);
                  return (
                    <Card key={salon.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">{salon.name}</CardTitle>
                            <Badge variant={getStatusBadgeVariant(salon.status)}>
                              {salon.status}
                            </Badge>
                          </div>
                          <Building2 className="h-6 w-6 text-muted-foreground" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{salon.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{salon.ownerName}</span>
                        </div>
                        <div className="pt-3 border-t border-border">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                <Calendar className="h-3 w-3" />
                                <span className="text-xs">Appointments</span>
                              </div>
                              <div className="font-semibold text-lg">{metrics.appointmentCount}</div>
                            </div>
                            <div>
                              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                <Users className="h-3 w-3" />
                                <span className="text-xs">Stylists</span>
                              </div>
                              <div className="font-semibold text-lg">{metrics.stylistCount}</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No salons found matching your criteria</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-64" />
                ))}
              </div>
            ) : filteredSalons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSalons.map((salon) => {
                  const metrics = getSalonMetrics(salon.id);
                  return (
                    <Card key={salon.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">{salon.name}</CardTitle>
                            <Badge variant={getStatusBadgeVariant(salon.status)}>
                              {salon.status}
                            </Badge>
                          </div>
                          <Building2 className="h-6 w-6 text-muted-foreground" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{salon.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{salon.ownerName}</span>
                        </div>
                        <div className="pt-3 border-t border-border">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                <Calendar className="h-3 w-3" />
                                <span className="text-xs">Appointments</span>
                              </div>
                              <div className="font-semibold text-lg">{metrics.appointmentCount}</div>
                            </div>
                            <div>
                              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                <Users className="h-3 w-3" />
                                <span className="text-xs">Stylists</span>
                              </div>
                              <div className="font-semibold text-lg">{metrics.stylistCount}</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No pending salons</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-64" />
                ))}
              </div>
            ) : filteredSalons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSalons.map((salon) => {
                  const metrics = getSalonMetrics(salon.id);
                  return (
                    <Card key={salon.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">{salon.name}</CardTitle>
                            <Badge variant={getStatusBadgeVariant(salon.status)}>
                              {salon.status}
                            </Badge>
                          </div>
                          <Building2 className="h-6 w-6 text-muted-foreground" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{salon.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{salon.ownerName}</span>
                        </div>
                        <div className="pt-3 border-t border-border">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                <Calendar className="h-3 w-3" />
                                <span className="text-xs">Appointments</span>
                              </div>
                              <div className="font-semibold text-lg">{metrics.appointmentCount}</div>
                            </div>
                            <div>
                              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                <Users className="h-3 w-3" />
                                <span className="text-xs">Stylists</span>
                              </div>
                              <div className="font-semibold text-lg">{metrics.stylistCount}</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No approved salons</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-64" />
                ))}
              </div>
            ) : filteredSalons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSalons.map((salon) => {
                  const metrics = getSalonMetrics(salon.id);
                  return (
                    <Card key={salon.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">{salon.name}</CardTitle>
                            <Badge variant={getStatusBadgeVariant(salon.status)}>
                              {salon.status}
                            </Badge>
                          </div>
                          <Building2 className="h-6 w-6 text-muted-foreground" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{salon.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{salon.ownerName}</span>
                        </div>
                        <div className="pt-3 border-t border-border">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                <Calendar className="h-3 w-3" />
                                <span className="text-xs">Appointments</span>
                              </div>
                              <div className="font-semibold text-lg">{metrics.appointmentCount}</div>
                            </div>
                            <div>
                              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                <Users className="h-3 w-3" />
                                <span className="text-xs">Stylists</span>
                              </div>
                              <div className="font-semibold text-lg">{metrics.stylistCount}</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No rejected salons</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
