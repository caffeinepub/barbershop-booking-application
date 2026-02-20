import { useState, useEffect } from 'react';
import { useGetServices, useGetStylists, useBookAppointment, useGetAllSalons, useGetAllAppointments } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Loader2, ChevronLeft, ChevronRight, Building2, Scissors, User, CalendarIcon, Clock, Sparkles } from 'lucide-react';
import TimeSlotPicker from './TimeSlotPicker';
import AIStylingConsultationStep from './AIStylingConsultationStep';
import { useNavigate } from '@tanstack/react-router';

type BookingStep = 'salon' | 'ai-consultation' | 'service' | 'stylist' | 'date' | 'time';

interface BookingFormProps {
  preSelectedSalonId?: string;
}

export default function BookingForm({ preSelectedSalonId }: BookingFormProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<BookingStep>('salon');
  const [selectedSalonId, setSelectedSalonId] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedStylistId, setSelectedStylistId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [aiRecommendationUsed, setAiRecommendationUsed] = useState(false);

  const { data: salons, isLoading: salonsLoading } = useGetAllSalons();
  const { data: services, isLoading: servicesLoading } = useGetServices();
  const { data: stylists, isLoading: stylistsLoading } = useGetStylists();
  const { data: appointments } = useGetAllAppointments();
  const bookAppointment = useBookAppointment();

  // Handle pre-selected salon
  useEffect(() => {
    if (preSelectedSalonId && salons) {
      const salon = salons.find(s => s.id === preSelectedSalonId && s.verified);
      if (salon) {
        setSelectedSalonId(preSelectedSalonId);
        setCurrentStep('ai-consultation');
      }
    }
  }, [preSelectedSalonId, salons]);

  const steps: BookingStep[] = ['salon', 'ai-consultation', 'service', 'stylist', 'date', 'time'];
  const currentStepIndex = steps.indexOf(currentStep);

  const stepIcons = {
    salon: Building2,
    'ai-consultation': Sparkles,
    service: Scissors,
    stylist: User,
    date: CalendarIcon,
    time: Clock,
  };

  const stepLabels = {
    salon: 'Select Salon',
    'ai-consultation': 'AI Styling',
    service: 'Choose Service',
    stylist: 'Pick Stylist',
    date: 'Select Date',
    time: 'Choose Time',
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1]);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1]);
    }
  };

  const handleAIRecommendation = (serviceId: string, stylistId: string) => {
    setSelectedServiceId(serviceId);
    setSelectedStylistId(stylistId);
    setAiRecommendationUsed(true);
    setCurrentStep('date');
  };

  const handleSkipAI = () => {
    setCurrentStep('service');
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedSalonId) return;

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const appointmentDate = new Date(selectedDate);
    appointmentDate.setHours(hours, minutes, 0, 0);

    const dateTimeNanos = BigInt(appointmentDate.getTime()) * BigInt(1000000);

    try {
      await bookAppointment.mutateAsync({
        salonId: selectedSalonId,
        serviceId: selectedServiceId,
        stylistId: selectedStylistId,
        dateTime: dateTimeNanos,
      });
      navigate({ to: '/appointments' });
    } catch (error) {
      console.error('Booking failed:', error);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'salon':
        return !!selectedSalonId;
      case 'ai-consultation':
        return true; // Can always skip
      case 'service':
        return !!selectedServiceId;
      case 'stylist':
        return !!selectedStylistId;
      case 'date':
        return !!selectedDate;
      case 'time':
        return !!selectedTime;
      default:
        return false;
    }
  };

  const StepIcon = stepIcons[currentStep];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground overflow-x-auto pb-2">
        {steps.map((step, index) => {
          const Icon = stepIcons[step];
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          
          return (
            <div key={step} className="flex items-center gap-2 flex-shrink-0">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground font-medium'
                    : isCompleted
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{stepLabels[step]}</span>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <StepIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>{stepLabels[currentStep]}</CardTitle>
              <CardDescription>
                Step {currentStepIndex + 1} of {steps.length}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  index <= currentStepIndex ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === 'salon' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select a Salon</h3>
              {salonsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Select value={selectedSalonId} onValueChange={setSelectedSalonId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a salon" />
                  </SelectTrigger>
                  <SelectContent>
                    {salons?.filter(s => s.verified).map((salon) => (
                      <SelectItem key={salon.id} value={salon.id}>
                        {salon.name} - {salon.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {currentStep === 'ai-consultation' && services && stylists && (
            <AIStylingConsultationStep
              services={services}
              stylists={stylists}
              onAcceptRecommendation={handleAIRecommendation}
              onSkip={handleSkipAI}
              onBack={handleBack}
            />
          )}

          {currentStep === 'service' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Select a Service</h3>
                {aiRecommendationUsed && (
                  <div className="flex items-center gap-1 text-xs text-primary">
                    <Sparkles className="h-3 w-3" />
                    <span>AI Recommended</span>
                  </div>
                )}
              </div>
              {servicesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services?.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - ${Number(service.priceCents) / 100} ({Number(service.durationMinutes)} min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {currentStep === 'stylist' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Select a Stylist</h3>
                {aiRecommendationUsed && (
                  <div className="flex items-center gap-1 text-xs text-primary">
                    <Sparkles className="h-3 w-3" />
                    <span>AI Recommended</span>
                  </div>
                )}
              </div>
              {stylistsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Select value={selectedStylistId} onValueChange={setSelectedStylistId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a stylist" />
                  </SelectTrigger>
                  <SelectContent>
                    {stylists?.map((stylist) => (
                      <SelectItem key={stylist.id} value={stylist.id}>
                        {stylist.name} - {stylist.specialties.join(', ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {currentStep === 'date' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select a Date</h3>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </div>
            </div>
          )}

          {currentStep === 'time' && selectedDate && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select a Time</h3>
              <TimeSlotPicker
                selectedDate={selectedDate}
                stylistId={selectedStylistId}
                appointments={appointments || []}
                selectedTimeSlot={selectedTime}
                onSelectTimeSlot={setSelectedTime}
              />
            </div>
          )}

          {currentStep !== 'ai-consultation' && (
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStepIndex === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              {currentStep === 'time' ? (
                <Button
                  onClick={handleBooking}
                  disabled={!canProceed() || bookAppointment.isPending}
                >
                  {bookAppointment.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={!canProceed()}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
