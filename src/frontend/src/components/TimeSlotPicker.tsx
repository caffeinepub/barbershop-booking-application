import type { Appointment } from '../backend';
import { AppointmentStatus } from '../backend';

interface TimeSlotPickerProps {
  selectedDate: Date;
  stylistId: string;
  appointments: Appointment[];
  selectedTimeSlot: string;
  onSelectTimeSlot: (slot: string) => void;
}

export default function TimeSlotPicker({
  selectedDate,
  stylistId,
  appointments,
  selectedTimeSlot,
  onSelectTimeSlot,
}: TimeSlotPickerProps) {
  const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let hour = 9; hour < 19; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const isSlotAvailable = (slot: string) => {
    const [hours, minutes] = slot.split(':').map(Number);
    const slotDateTime = new Date(selectedDate);
    slotDateTime.setHours(hours, minutes, 0, 0);
    const slotTime = BigInt(slotDateTime.getTime()) * BigInt(1_000_000);

    return !appointments.some((apt) => {
      if (apt.stylistId !== stylistId) return false;
      if (apt.status === AppointmentStatus.canceled) return false;

      const aptDate = new Date(Number(apt.dateTime / BigInt(1_000_000)));
      const aptDateOnly = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate());
      const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

      if (aptDateOnly.getTime() !== selectedDateOnly.getTime()) return false;

      return apt.dateTime === slotTime;
    });
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
      {timeSlots.map((slot) => {
        const available = isSlotAvailable(slot);
        return (
          <button
            key={slot}
            type="button"
            onClick={() => available && onSelectTimeSlot(slot)}
            disabled={!available}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedTimeSlot === slot
                ? 'bg-primary text-primary-foreground'
                : available
                ? 'bg-card border border-border hover:border-primary text-foreground'
                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
            }`}
          >
            {slot}
          </button>
        );
      })}
    </div>
  );
}
