import { useNavigate } from '@tanstack/react-router';
import type { Salon } from '../backend';
import { MapPin, User, Phone, Mail, CheckCircle, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SalonCardProps {
  salon: Salon;
  distance?: number | null;
}

export default function SalonCard({ salon, distance }: SalonCardProps) {
  const navigate = useNavigate();

  // Parse contact info to extract phone and email
  const parseContactInfo = (contactInfo: string) => {
    const phoneMatch = contactInfo.match(/Phone:\s*([^\n,]+)/i);
    const emailMatch = contactInfo.match(/Email:\s*([^\n,]+)/i);
    
    return {
      phone: phoneMatch ? phoneMatch[1].trim() : null,
      email: emailMatch ? emailMatch[1].trim() : null,
    };
  };

  const { phone, email } = parseContactInfo(salon.contactInfo);

  const handleBookAppointment = () => {
    navigate({ to: '/book' });
  };

  return (
    <div className="bg-card rounded-lg p-6 border border-border card-hover shadow-sm flex flex-col h-full">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-sans font-semibold text-foreground flex-1">
          {salon.name}
        </h3>
        {salon.verified && (
          <Badge variant="default" className="ml-2 gap-1">
            <CheckCircle className="h-3 w-3" />
            Verified
          </Badge>
        )}
      </div>

      {distance !== null && distance !== undefined && (
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-primary">
          <Navigation className="h-4 w-4" />
          <span>{distance.toFixed(1)} km away</span>
        </div>
      )}
      
      <div className="space-y-3 mb-4 flex-1">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
          <span>{salon.address}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User size={16} className="text-primary flex-shrink-0" />
          <span>Owner: {salon.ownerName}</span>
        </div>
        
        {phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone size={16} className="text-primary flex-shrink-0" />
            <a href={`tel:${phone}`} className="hover:text-primary transition-colors">
              {phone}
            </a>
          </div>
        )}
        
        {email && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail size={16} className="text-primary flex-shrink-0" />
            <a href={`mailto:${email}`} className="hover:text-primary transition-colors break-all">
              {email}
            </a>
          </div>
        )}
      </div>

      <Button onClick={handleBookAppointment} className="w-full mt-auto">
        Book Appointment
      </Button>
    </div>
  );
}
