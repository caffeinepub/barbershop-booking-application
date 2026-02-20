import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Check, ChevronLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Service, StylistProfile } from '../backend';
import { matchAllRecommendations, type AIRecommendation, type MatchedRecommendation } from '../utils/matchRecommendations';

interface AIStylingRecommendationsProps {
  recommendations: AIRecommendation[];
  services: Service[];
  stylists: StylistProfile[];
  userPhoto?: string;
  onAcceptRecommendation: (serviceId: string, stylistId: string) => void;
  onSkip: () => void;
  onBack: () => void;
}

export default function AIStylingRecommendations({
  recommendations,
  services,
  stylists,
  userPhoto,
  onAcceptRecommendation,
  onSkip,
  onBack,
}: AIStylingRecommendationsProps) {
  const matchedRecommendations = matchAllRecommendations(recommendations, services, stylists);

  const handleAccept = (recommendation: MatchedRecommendation) => {
    const serviceId = recommendation.matchedServices[0]?.id || recommendation.closestService?.id;
    const stylistId = recommendation.recommendedStylists[0]?.id || stylists[0]?.id;
    
    if (serviceId && stylistId) {
      onAcceptRecommendation(serviceId, stylistId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-semibold">Your Personalized Recommendations</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Based on your photo and preferences, here are our top style suggestions
        </p>
      </div>

      {userPhoto && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <img
                src={userPhoto}
                alt="Your photo"
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">Your Current Style</p>
                <p className="text-xs text-muted-foreground">
                  We analyzed your photo to find the best matches
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {matchedRecommendations.map((recommendation, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{recommendation.styleName}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {recommendation.confidenceScore}% Match
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {recommendation.description}
                  </p>
                </div>
                {recommendation.imageUrl && (
                  <img
                    src={recommendation.imageUrl}
                    alt={recommendation.styleName}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs font-medium mb-1">Why this style?</p>
                <p className="text-xs text-muted-foreground">{recommendation.reasoning}</p>
              </div>

              {recommendation.matchedServices.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium">Matching Services:</p>
                  <div className="flex flex-wrap gap-2">
                    {recommendation.matchedServices.slice(0, 3).map((service) => (
                      <Badge key={service.id} variant="outline" className="text-xs">
                        {service.name} - ${Number(service.priceCents) / 100}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : recommendation.closestService ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    No exact match found. Closest service: <strong>{recommendation.closestService.name}</strong>
                  </AlertDescription>
                </Alert>
              ) : null}

              {recommendation.recommendedStylists.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium">Recommended Stylists:</p>
                  <div className="flex flex-wrap gap-2">
                    {recommendation.recommendedStylists.slice(0, 3).map((stylist) => (
                      <Badge key={stylist.id} variant="secondary" className="text-xs">
                        {stylist.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                onClick={() => handleAccept(recommendation)}
                disabled={!recommendation.matchedServices[0] && !recommendation.closestService}
              >
                <Check className="mr-2 h-4 w-4" />
                Select This Style
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Preview
        </Button>
        <Button variant="ghost" onClick={onSkip}>
          Continue Manually
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
