import { useState } from 'react';
import { useGetAllAppointments, useGetAllSalons, useGetStylists, useIsCallerAdmin } from '../hooks/useQueries';
import { AppointmentStatus } from '../backend';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Calendar, Building2, User, Clock, Download, Filter, TrendingUp } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { format } from 'date-fns';

export default function BookingManagementPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const { data: appointments, isLoading: appointmentsLoading } = useGetAllAppointments();
  const { data: salons } = useGetAllSalons();
  const { data: stylists } = useGetStylists();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AppointmentStatus>('all');
  const [salonFilter, setSalonFilter] = useState<string>('all');

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

  const getStatusBadgeVariant = (status: AppointmentStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case AppointmentStatus.confirmed:
        return 'default';
      case AppointmentStatus.completed:
        return 'secondary';
      case AppointmentStatus.canceled:
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getSalonName = (salonId: string) => {
    return salons?.find(s => s.id === salonId)?.name || salonId;
  };

  const getStylistName = (stylistId: string) => {
    return stylists?.find(s => s.id === stylistId)?.name || stylistId;
  };

  // Filter appointments
  const filteredAppointments = appointments?.filter(apt => {
    const matchesSearch = searchTerm === '' || 
      apt.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getSalonName(apt.salonId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getStylistName(apt.stylistId).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    const matchesSalon = salonFilter === 'all' || apt.salonId === salonFilter;
    
    return matchesSearch && matchesStatus && matchesSalon;
  }) || [];

  // Sort by date (most recent first)
  const sortedAppointments = [...filteredAppointments].sort((a, b) => 
    Number(b.dateTime) - Number(a.dateTime)
  );

  const stats = {
    total: appointments?.length || 0,
    pending: appointments?.filter(a => a.status === AppointmentStatus.pending).length || 0,
    confirmed: appointments?.filter(a => a.status === AppointmentStatus.confirmed).length || 0,
    completed: appointments?.filter(a => a.status === AppointmentStatus.completed).length || 0,
    canceled: appointments?.filter(a => a.status === AppointmentStatus.canceled).length || 0,
  };

  const handleExport = () => {
    // Placeholder for export functionality
    console.log('Exporting bookings data...');
  };

  return (
    <div className="container-custom mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-sans font-bold text-foreground mb-3">
            Cross-Salon Booking Management
          </h1>
          <p className="text-base text-muted-foreground">
            Centralized oversight and management of all appointments across your salon network
          </p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium">Total Bookings</CardDescription>
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold">{stats.total}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Network-wide
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 hover:border-yellow-500/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium">Pending</CardDescription>
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-yellow-600">{stats.pending}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Needs review
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 hover:border-green-500/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium">Confirmed</CardDescription>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-green-600">{stats.confirmed}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Active
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 hover:border-blue-500/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium">Completed</CardDescription>
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-blue-600">{stats.completed}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Finished
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 hover:border-red-500/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium">Canceled</CardDescription>
                <Clock className="h-4 w-4 text-red-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-red-600">{stats.canceled}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Cancelled
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Filters with Bulk Actions */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Advanced Filters</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                type="text"
                placeholder="Search by ID, salon, or stylist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={AppointmentStatus.pending}>Pending</SelectItem>
                <SelectItem value={AppointmentStatus.confirmed}>Confirmed</SelectItem>
                <SelectItem value={AppointmentStatus.completed}>Completed</SelectItem>
                <SelectItem value={AppointmentStatus.canceled}>Canceled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={salonFilter} onValueChange={setSalonFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by salon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Salons</SelectItem>
                {salons?.map(salon => (
                  <SelectItem key={salon.id} value={salon.id}>{salon.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Appointments Table with Enhanced Layout */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Network Appointments</CardTitle>
                <CardDescription>
                  Showing {sortedAppointments.length} of {stats.total} bookings across all partner salons
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : sortedAppointments.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Salon</TableHead>
                      <TableHead>Stylist</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedAppointments.map((appointment) => (
                      <TableRow key={appointment.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-xs">{appointment.id.slice(0, 12)}...</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{getSalonName(appointment.salonId)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span>{getStylistName(appointment.stylistId)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">
                              {format(new Date(Number(appointment.dateTime) / 1000000), 'MMM dd, yyyy HH:mm')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No appointments found matching your criteria</p>
                <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
