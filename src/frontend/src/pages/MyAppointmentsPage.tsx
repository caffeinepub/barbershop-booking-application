import { useGetMyAppointments, useCancelAppointment } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { AppointmentStatus } from '../backend';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, User, X } from 'lucide-react';
import { format } from 'date-fns';

export default function MyAppointmentsPage() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: appointments, isLoading } = useGetMyAppointments();
  const cancelAppointment = useCancelAppointment();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  if (!isAuthenticated && isLoggingIn) {
    return (
      <div className="container-custom mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Login Required</CardTitle>
            <CardDescription>
              Please log in to view your appointments
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <button
              onClick={login}
              disabled={isLoggingIn}
              className="px-8 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 font-semibold disabled:opacity-50"
            >
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </button>
          </CardContent>
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

  const canCancelAppointment = (appointment: any) => {
    if (appointment.status === AppointmentStatus.canceled || appointment.status === AppointmentStatus.completed) {
      return false;
    }
    const appointmentDate = new Date(Number(appointment.dateTime / BigInt(1_000_000)));
    return appointmentDate > new Date();
  };

  const handleCancel = async (appointmentId: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      await cancelAppointment.mutateAsync(appointmentId);
    }
  };

  return (
    <div className="container-custom mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-sans font-bold text-foreground mb-3">
            My Appointments
          </h1>
          <p className="text-base text-muted-foreground">
            View and manage your upcoming and past appointments
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : appointments && appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((appointment) => {
              const appointmentDate = new Date(Number(appointment.dateTime / BigInt(1_000_000)));
              return (
                <Card key={appointment.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-primary" />
                          {format(appointmentDate, 'EEEE, MMMM dd, yyyy')}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <Clock className="w-4 h-4" />
                          {format(appointmentDate, 'hh:mm a')}
                        </CardDescription>
                      </div>
                      <Badge variant={getStatusBadgeVariant(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>Stylist ID: {appointment.stylistId}</span>
                        </div>
                        <div className="text-xs font-mono">
                          Booking ID: {appointment.id}
                        </div>
                      </div>
                      {canCancelAppointment(appointment) && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancel(appointment.id)}
                          disabled={cancelAppointment.isPending}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">You don't have any appointments yet</p>
              <Button onClick={() => window.location.href = '/book'}>
                Book Your First Appointment
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
