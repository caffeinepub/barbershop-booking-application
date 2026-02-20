import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, ChevronLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CustomizationSelector from './CustomizationSelector';
import CustomizationPreview from './CustomizationPreview';
import type { CustomizationVariation } from '../backend';

interface PhotoCustomizationDisplayProps {
  originalPhotoUrl: string;
  customizations: CustomizationVariation[];
  isLoading?: boolean;
  onApplyCustomizations: (selected: CustomizationVariation[]) => void;
  onBack: () => void;
}

export default function PhotoCustomizationDisplay({
  originalPhotoUrl,
  customizations,
  isLoading = false,
  onApplyCustomizations,
  onBack,
}: PhotoCustomizationDisplayProps) {
  const [selectedCustomizations, setSelectedCustomizations] = useState<CustomizationVariation[]>([]);

  const handleApply = () => {
    onApplyCustomizations(selectedCustomizations);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="text-center">
                <p className="font-medium">Analyzing your photo...</p>
                <p className="text-sm text-muted-foreground">
                  Generating customization recommendations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (customizations.length === 0) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertDescription>
            No customization recommendations available. Please try uploading a different photo.
          </AlertDescription>
        </Alert>
        <div className="flex justify-start">
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Customize Your Look</h3>
        <p className="text-sm text-muted-foreground">
          Select the customizations you'd like to apply to your hairstyle
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Customization Selector */}
        <div>
          <CustomizationSelector
            customizations={customizations}
            selectedCustomizations={selectedCustomizations}
            onSelectionChange={setSelectedCustomizations}
          />
        </div>

        {/* Right: Preview */}
        <div>
          <CustomizationPreview
            originalPhotoUrl={originalPhotoUrl}
            selectedCustomizations={selectedCustomizations}
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleApply} disabled={selectedCustomizations.length === 0}>
          Continue with {selectedCustomizations.length > 0 ? `${selectedCustomizations.length} ` : ''}
          Customization{selectedCustomizations.length !== 1 ? 's' : ''}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
