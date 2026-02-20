import type { Service } from '../backend';
import { Clock, DollarSign } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const priceInDollars = (Number(service.priceCents) / 100).toFixed(2);

  return (
    <div className="bg-card rounded-lg p-6 border border-border card-hover shadow-sm">
      <h3 className="text-xl font-serif font-semibold text-foreground mb-3">
        {service.name}
      </h3>
      <p className="text-muted-foreground mb-4 text-sm leading-relaxed min-h-[60px]">
        {service.description}
      </p>
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock size={16} className="text-primary" />
          <span>{Number(service.durationMinutes)} min</span>
        </div>
        <div className="flex items-center gap-1 text-lg font-semibold text-primary">
          <DollarSign size={18} />
          <span>{priceInDollars}</span>
        </div>
      </div>
    </div>
  );
}
