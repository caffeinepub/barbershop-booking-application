import type { StylistProfile } from '../backend';
import { User } from 'lucide-react';

interface StylistCardProps {
  stylist: StylistProfile;
}

export default function StylistCard({ stylist }: StylistCardProps) {
  const photoUrl = stylist.photo?.getDirectURL();

  return (
    <div className="bg-card rounded-lg overflow-hidden border border-border card-hover shadow-sm">
      <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={stylist.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <User size={80} className="text-muted-foreground" />
        )}
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-serif font-semibold text-foreground mb-3">
          {stylist.name}
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {stylist.specialties.map((specialty, index) => (
            <span
              key={index}
              className="px-3 py-1 rounded-full bg-accent/20 text-accent-foreground text-xs font-medium"
            >
              {specialty}
            </span>
          ))}
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {stylist.bio}
        </p>
      </div>
    </div>
  );
}
