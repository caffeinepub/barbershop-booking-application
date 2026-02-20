import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw } from 'lucide-react';
import type { CustomizationVariation } from '../backend';

interface CustomizationSelectorProps {
  customizations: CustomizationVariation[];
  selectedCustomizations: CustomizationVariation[];
  onSelectionChange: (selected: CustomizationVariation[]) => void;
}

export default function CustomizationSelector({
  customizations,
  selectedCustomizations,
  onSelectionChange,
}: CustomizationSelectorProps) {
  const isSelected = (customization: CustomizationVariation) => {
    return selectedCustomizations.some(
      (selected) => selected.variationName === customization.variationName
    );
  };

  const handleToggle = (customization: CustomizationVariation) => {
    if (isSelected(customization)) {
      onSelectionChange(
        selectedCustomizations.filter(
          (selected) => selected.variationName !== customization.variationName
        )
      );
    } else {
      onSelectionChange([...selectedCustomizations, customization]);
    }
  };

  const handleReset = () => {
    onSelectionChange([]);
  };

  const getCustomizationType = (name: string): string => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('color') || nameLower.includes('highlight') || nameLower.includes('balayage')) {
      return 'color';
    }
    if (nameLower.includes('cut') || nameLower.includes('bob') || nameLower.includes('pixie')) {
      return 'cut';
    }
    if (nameLower.includes('texture') || nameLower.includes('layer')) {
      return 'texture';
    }
    if (nameLower.includes('style') || nameLower.includes('styling')) {
      return 'style';
    }
    return 'style';
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'color':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'cut':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'texture':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'style':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Select Customizations</h3>
        {selectedCustomizations.length > 0 && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        )}
      </div>

      <div className="grid gap-3">
        {customizations.map((customization, index) => {
          const selected = isSelected(customization);
          const type = getCustomizationType(customization.variationName);

          return (
            <Card
              key={index}
              className={`cursor-pointer transition-all ${
                selected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'hover:border-primary/50 hover:shadow-sm'
              }`}
              onClick={() => handleToggle(customization)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center pt-1">
                    <Checkbox checked={selected} onCheckedChange={() => handleToggle(customization)} />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <img
                        src="/assets/generated/ai-customization-icon.dim_64x64.png"
                        alt="AI Customization"
                        className="h-8 w-8"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold">{customization.variationName}</h4>
                          <Badge className={`text-xs ${getTypeColor(type)}`}>
                            {type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {customization.description}
                        </p>
                      </div>
                    </div>

                    {customization.customizationDetails.length > 0 && (
                      <div className="pl-10">
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {customization.customizationDetails.map((detail, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-primary mt-0.5">•</span>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedCustomizations.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-sm font-medium mb-2">
            {selectedCustomizations.length} customization{selectedCustomizations.length !== 1 ? 's' : ''} selected
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedCustomizations.map((customization, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {customization.variationName}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
