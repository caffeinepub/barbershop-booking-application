import { useNavigate } from '@tanstack/react-router';
import type { Service, StylistProfile, Salon } from '../backend';
import { CheckCircle, Calendar, Clock, User, Home, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface BookingConfirmationProps {
  bookingId: string;
  salon: Salon;
  service: Service;
  stylist: StylistProfile;
  dateTime: Date;
  timeSlot: string;
}

export default function BookingConfirmation({
  bookingId,
  salon,
  service,
  stylist,
  dateTime,
  timeSlot,
}: BookingConfirmationProps) {
  const navigate = useNavigate();

  const formattedDate = dateTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-2 border-primary/20">
        <CardContent className="pt-8 pb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <CheckCircle size={48} className="text-primary" />
            </div>

            <h2 className="text-3xl font-sans font-bold text-foreground mb-4">
              Booking Confirmed!
            </h2>
            <p className="text-muted-foreground mb-2">
              Your appointment has been successfully booked.
            </p>
            <p className="text-sm text-muted-foreground">
              Booking Reference: <span className="font-mono font-semibold text-foreground">{bookingId}</span>
            </p>
          </div>

          <div className="bg-muted/30 rounded-lg p-6 mb-8 space-y-4">
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Salon</div>
                <div className="font-semibold text-foreground">{salon.name}</div>
                <div className="text-sm text-muted-foreground">{salon.address}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar size={20} className="text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Date & Time</div>
                <div className="font-semibold text-foreground">
                  {formattedDate}
                </div>
                <div className="text-sm text-muted-foreground">at {timeSlot}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User size={20} className="text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Stylist</div>
                <div className="font-semibold text-foreground">{stylist.name}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock size={20} className="text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Service</div>
                <div className="font-semibold text-foreground">{service.name}</div>
                <div className="text-sm text-muted-foreground">
                  {Number(service.durationMinutes)} minutes · ${Number(service.priceCents) / 100}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate({ to: '/appointments' })}
              className="w-full"
              size="lg"
            >
              View My Appointments
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              onClick={() => navigate({ to: '/salons' })}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Home className="mr-2 h-4 w-4" />
              Book Another Appointment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
