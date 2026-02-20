import { useState } from 'react';
import { Sparkles, Loader2, ArrowRight, SkipForward, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import PhotoUploadStep from './PhotoUploadStep';
import StylePreviewToggle from './StylePreviewToggle';
import AIStylingRecommendations from './AIStylingRecommendations';
import PhotoCustomizationDisplay from './PhotoCustomizationDisplay';
import type { Service, StylistProfile, CustomizationVariation } from '../backend';
import { ExternalBlob } from '../backend';
import { useUploadHairstylePhoto, useGetCustomizationRecommendations } from '../hooks/useQueries';

interface AIRecommendation {
  styleName: string;
  description: string;
  confidenceScore: number;
  reasoning: string;
  matchingServiceIds: string[];
  recommendedStylistIds: string[];
  imageUrl?: string;
}

interface AIStylingConsultationStepProps {
  services: Service[];
  stylists: StylistProfile[];
  onAcceptRecommendation: (serviceId: string, stylistId: string) => void;
  onSkip: () => void;
  onBack: () => void;
}

type ConsultationView = 'upload' | 'customization' | 'preview' | 'recommendations';

export default function AIStylingConsultationStep({
  services,
  stylists,
  onAcceptRecommendation,
  onSkip,
  onBack,
}: AIStylingConsultationStepProps) {
  const [currentView, setCurrentView] = useState<ConsultationView>('upload');
  const [userPhoto, setUserPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [uploadedBlob, setUploadedBlob] = useState<ExternalBlob | null>(null);
  const [styleDescription, setStyleDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [selectedCustomizations, setSelectedCustomizations] = useState<CustomizationVariation[]>([]);
  const [customizationRecommendations, setCustomizationRecommendations] = useState<CustomizationVariation[]>([]);
  const [isLoadingCustomizations, setIsLoadingCustomizations] = useState(false);
  
  const uploadPhotoMutation = useUploadHairstylePhoto();
  const getCustomizationsMutation = useGetCustomizationRecommendations();

  const handlePhotoSelected = (file: File, preview: string) => {
    setUserPhoto(file);
    setPhotoPreview(preview);
  };

  const handleRemovePhoto = () => {
    setUserPhoto(null);
    setPhotoPreview('');
    setUploadedBlob(null);
  };

  const generateMockRecommendations = (description: string): AIRecommendation[] => {
    const mockRecommendations: AIRecommendation[] = [];
    const desc = description.toLowerCase();

    if (desc.includes('fade') || desc.includes('modern') || desc.includes('short')) {
      mockRecommendations.push({
        styleName: 'Modern Fade',
        description: 'A contemporary fade haircut with clean lines and sharp edges, perfect for a professional yet stylish look.',
        confidenceScore: 92,
        reasoning: 'Based on your photo and preferences for modern styling, this cut will complement your face shape and lifestyle.',
        matchingServiceIds: services.filter(s => s.name.toLowerCase().includes('cut')).map(s => s.id),
        recommendedStylistIds: stylists.filter(s => s.specialties.some(sp => sp.toLowerCase().includes('fade'))).map(s => s.id),
        imageUrl: '/assets/generated/style-rec-fade.dim_400x400.png',
      });
    }

    if (desc.includes('pompadour') || desc.includes('volume') || desc.includes('classic')) {
      mockRecommendations.push({
        styleName: 'Classic Pompadour',
        description: 'A timeless, sophisticated style with volume and height, perfect for making a statement.',
        confidenceScore: 88,
        reasoning: 'Your preference for classic styling with volume suggests this iconic look would suit you perfectly.',
        matchingServiceIds: services.filter(s => s.name.toLowerCase().includes('cut')).map(s => s.id),
        recommendedStylistIds: stylists.filter(s => s.specialties.some(sp => sp.toLowerCase().includes('classic'))).map(s => s.id),
        imageUrl: '/assets/generated/style-rec-pompadour.dim_400x400.png',
      });
    }

    if (desc.includes('crop') || desc.includes('textured') || desc.includes('casual')) {
      mockRecommendations.push({
        styleName: 'Textured Crop',
        description: 'A modern, low-maintenance cut with natural texture and movement for an effortlessly cool look.',
        confidenceScore: 85,
        reasoning: 'Based on your style preferences, this versatile cut offers easy styling with a contemporary edge.',
        matchingServiceIds: services.filter(s => s.name.toLowerCase().includes('cut')).map(s => s.id),
        recommendedStylistIds: stylists.slice(0, 2).map(s => s.id),
        imageUrl: '/assets/generated/style-rec-crop.dim_400x400.png',
      });
    }

    if (desc.includes('undercut') || desc.includes('slicked') || desc.includes('edgy')) {
      mockRecommendations.push({
        styleName: 'Undercut Style',
        description: 'A bold, edgy cut with short sides and longer top, perfect for a modern, confident look.',
        confidenceScore: 87,
        reasoning: 'Your desire for an edgy style suggests this contemporary cut would match your personality.',
        matchingServiceIds: services.filter(s => s.name.toLowerCase().includes('cut')).map(s => s.id),
        recommendedStylistIds: stylists.slice(0, 2).map(s => s.id),
        imageUrl: '/assets/generated/style-rec-undercut.dim_400x400.png',
      });
    }

    // Default recommendations if no keywords match
    if (mockRecommendations.length === 0) {
      mockRecommendations.push(
        {
          styleName: 'Modern Fade',
          description: 'A contemporary fade haircut with clean lines and sharp edges.',
          confidenceScore: 85,
          reasoning: 'Based on your consultation, this versatile style would complement your features.',
          matchingServiceIds: services.slice(0, 1).map(s => s.id),
          recommendedStylistIds: stylists.slice(0, 1).map(s => s.id),
          imageUrl: '/assets/generated/style-rec-fade.dim_400x400.png',
        },
        {
          styleName: 'Classic Pompadour',
          description: 'A timeless style with volume and sophistication.',
          confidenceScore: 82,
          reasoning: 'This classic look offers versatility and timeless appeal.',
          matchingServiceIds: services.slice(0, 1).map(s => s.id),
          recommendedStylistIds: stylists.slice(0, 1).map(s => s.id),
          imageUrl: '/assets/generated/style-rec-pompadour.dim_400x400.png',
        },
        {
          styleName: 'Textured Crop',
          description: 'A modern, low-maintenance cut with natural texture.',
          confidenceScore: 80,
          reasoning: 'Perfect for a contemporary, effortless look.',
          matchingServiceIds: services.slice(0, 1).map(s => s.id),
          recommendedStylistIds: stylists.slice(0, 1).map(s => s.id),
          imageUrl: '/assets/generated/style-rec-crop.dim_400x400.png',
        }
      );
    }

    return mockRecommendations.slice(0, 5);
  };

  const handleAnalyze = async () => {
    if (!userPhoto && !styleDescription.trim()) {
      return;
    }

    setIsAnalyzing(true);
    setUploadProgress(0);

    try {
      // Upload photo to backend if provided
      if (userPhoto) {
        const arrayBuffer = await userPhoto.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
        
        await uploadPhotoMutation.mutateAsync(blob);
        setUploadedBlob(blob);

        // Fetch customization recommendations
        setIsLoadingCustomizations(true);
        try {
          const customizations = await getCustomizationsMutation.mutateAsync(blob);
          setCustomizationRecommendations(customizations);
        } catch (error) {
          console.error('Failed to get customizations:', error);
          setCustomizationRecommendations([]);
        } finally {
          setIsLoadingCustomizations(false);
        }
      }

      // Simulate AI analysis
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      setUploadProgress(100);

      // Move to customization view
      setCurrentView('customization');
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyCustomizations = (selected: CustomizationVariation[]) => {
    setSelectedCustomizations(selected);
    
    // Generate style recommendations based on customizations and description
    const generatedRecs = generateMockRecommendations(styleDescription);
    setRecommendations(generatedRecs);
    setActivePreviewIndex(0);
    
    // Move to preview gallery
    setCurrentView('preview');
  };

  const handleViewRecommendations = () => {
    setCurrentView('recommendations');
  };

  const handleBackFromCustomization = () => {
    setCurrentView('upload');
    setUploadedBlob(null);
  };

  const handleBackFromPreview = () => {
    setCurrentView('customization');
  };

  const handleBackFromRecommendations = () => {
    setCurrentView('preview');
  };

  // Recommendations view
  if (currentView === 'recommendations') {
    return (
      <AIStylingRecommendations
        recommendations={recommendations}
        services={services}
        stylists={stylists}
        userPhoto={photoPreview}
        onAcceptRecommendation={onAcceptRecommendation}
        onSkip={onSkip}
        onBack={handleBackFromRecommendations}
      />
    );
  }

  // Preview gallery view
  if (currentView === 'preview' && recommendations.length > 0) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-semibold">AI Analysis Complete</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Here's how different styles would look on you
          </p>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Original Photo */}
              <div className="relative bg-muted p-6">
                <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                  Your Photo
                </div>
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Your current style"
                    className="w-full h-80 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-80 bg-muted rounded-lg flex items-center justify-center">
                    <img
                      src="/assets/generated/comparison-frame.dim_800x600.png"
                      alt="Placeholder"
                      className="w-full h-full object-cover rounded-lg opacity-50"
                    />
                  </div>
                )}
              </div>

              {/* Styled Preview */}
              <div className="relative bg-muted p-6">
                <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                  {recommendations[activePreviewIndex].styleName}
                </div>
                {recommendations[activePreviewIndex].imageUrl ? (
                  <img
                    src={recommendations[activePreviewIndex].imageUrl}
                    alt={recommendations[activePreviewIndex].styleName}
                    className="w-full h-80 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-80 bg-muted rounded-lg flex items-center justify-center">
                    <img
                      src="/assets/generated/comparison-frame.dim_800x600.png"
                      alt="Style preview"
                      className="w-full h-full object-cover rounded-lg opacity-50"
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <StylePreviewToggle
          previews={recommendations.map(rec => ({
            styleName: rec.styleName,
            imageUrl: rec.imageUrl,
            confidenceScore: rec.confidenceScore,
          }))}
          activeIndex={activePreviewIndex}
          onSelectPreview={setActivePreviewIndex}
        />

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={handleBackFromPreview}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={handleViewRecommendations}>
            View Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Customization view
  if (currentView === 'customization') {
    return (
      <PhotoCustomizationDisplay
        originalPhotoUrl={photoPreview}
        customizations={customizationRecommendations}
        isLoading={isLoadingCustomizations}
        onApplyCustomizations={handleApplyCustomizations}
        onBack={handleBackFromCustomization}
      />
    );
  }

  // Upload view (default)
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-semibold">AI Styling Consultation</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Upload your photo and describe your desired style for personalized recommendations
        </p>
      </div>

      <PhotoUploadStep
        onPhotoSelected={handlePhotoSelected}
        onRemovePhoto={handleRemovePhoto}
        currentPhoto={userPhoto}
        currentPreview={photoPreview}
      />

      <div className="space-y-2">
        <Label htmlFor="style-description">Style Preferences (Optional)</Label>
        <Textarea
          id="style-description"
          placeholder="Describe your desired style... (e.g., 'modern fade', 'classic pompadour', 'textured crop')"
          value={styleDescription}
          onChange={(e) => setStyleDescription(e.target.value)}
          rows={4}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Keywords like "fade", "pompadour", "crop", "undercut", "beard" help us recommend better
        </p>
      </div>

      {isAnalyzing && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-center gap-3">
              <img
                src="/assets/generated/ai-analysis-icon.dim_128x128.png"
                alt="AI Analysis"
                className="h-12 w-12 animate-pulse"
              />
              <div className="text-center">
                <p className="font-medium">Analyzing your style...</p>
                <p className="text-sm text-muted-foreground">This may take a moment</p>
              </div>
            </div>
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-xs text-center text-muted-foreground">
              {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Processing...'}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} disabled={isAnalyzing}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onSkip} disabled={isAnalyzing}>
            <SkipForward className="mr-2 h-4 w-4" />
            Skip AI Consultation
          </Button>
          <Button
            onClick={handleAnalyze}
            disabled={(!userPhoto && !styleDescription.trim()) || isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Get Recommendations
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
