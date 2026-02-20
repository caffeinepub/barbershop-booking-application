import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface StylePreview {
  styleName: string;
  imageUrl?: string;
  confidenceScore: number;
}

interface StylePreviewToggleProps {
  previews: StylePreview[];
  activeIndex: number;
  onSelectPreview: (index: number) => void;
}

export default function StylePreviewToggle({
  previews,
  activeIndex,
  onSelectPreview,
}: StylePreviewToggleProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">
        Select a style to preview:
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {previews.map((preview, index) => (
          <Card
            key={index}
            className={`cursor-pointer transition-all hover:shadow-md ${
              activeIndex === index
                ? 'ring-2 ring-primary shadow-md'
                : 'hover:ring-1 hover:ring-primary/50'
            }`}
            onClick={() => onSelectPreview(index)}
          >
            <div className="relative">
              {preview.imageUrl ? (
                <img
                  src={preview.imageUrl}
                  alt={preview.styleName}
                  className="w-full h-24 object-cover rounded-t-lg"
                />
              ) : (
                <div className="w-full h-24 bg-muted rounded-t-lg flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">No preview</span>
                </div>
              )}
              {activeIndex === index && (
                <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </div>
            <div className="p-2 space-y-1">
              <p className="text-xs font-medium truncate">{preview.styleName}</p>
              <Badge variant="secondary" className="text-xs">
                {preview.confidenceScore}% match
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
