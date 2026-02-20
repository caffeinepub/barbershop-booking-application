import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { CustomizationVariation } from '../backend';

interface CustomizationPreviewProps {
  originalPhotoUrl: string;
  selectedCustomizations: CustomizationVariation[];
}

export default function CustomizationPreview({
  originalPhotoUrl,
  selectedCustomizations,
}: CustomizationPreviewProps) {
  // Determine which preview image to show based on selections
  const getPreviewImage = (): string => {
    if (selectedCustomizations.length === 0) {
      return originalPhotoUrl;
    }

    // Check if any customization has a color-related name
    const hasColorCustomization = selectedCustomizations.some((c) =>
      c.variationName.toLowerCase().includes('color') ||
      c.variationName.toLowerCase().includes('highlight') ||
      c.variationName.toLowerCase().includes('balayage')
    );

    // Check if any customization has a style-related name
    const hasStyleCustomization = selectedCustomizations.some((c) =>
      c.variationName.toLowerCase().includes('style') ||
      c.variationName.toLowerCase().includes('layer') ||
      c.variationName.toLowerCase().includes('texture')
    );

    // Prioritize showing color variation if selected
    if (hasColorCustomization) {
      return '/assets/generated/hairstyle-color-variation.dim_600x800.png';
    }

    // Otherwise show style variation
    if (hasStyleCustomization) {
      return '/assets/generated/hairstyle-style-variation.dim_600x800.png';
    }

    // Default to style variation for any other customizations
    return '/assets/generated/hairstyle-style-variation.dim_600x800.png';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Preview</h3>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Before */}
            <div className="relative bg-muted p-6">
              <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium z-10">
                Before
              </div>
              <img
                src="/assets/generated/hairstyle-before.dim_600x800.png"
                alt="Original hairstyle"
                className="w-full h-80 object-cover rounded-lg"
              />
            </div>

            {/* After */}
            <div className="relative bg-muted p-6">
              <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium z-10">
                {selectedCustomizations.length > 0 ? 'After' : 'Original'}
              </div>
              <img
                src={getPreviewImage()}
                alt="Customized hairstyle"
                className="w-full h-80 object-cover rounded-lg"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedCustomizations.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <h4 className="text-sm font-semibold">Applied Customizations</h4>
            <Separator />
            <div className="space-y-3">
              {selectedCustomizations.map((customization, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {customization.variationName}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {customization.description}
                  </p>
                  {customization.customizationDetails.length > 0 && (
                    <ul className="text-xs text-muted-foreground pl-4 space-y-0.5">
                      {customization.customizationDetails.map((detail, idx) => (
                        <li key={idx} className="list-disc">
                          {detail}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedCustomizations.length === 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground text-center">
              Select customizations to see a preview of the changes
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
