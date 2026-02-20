import type { Service, StylistProfile } from '../backend';

export interface AIRecommendation {
  styleName: string;
  description: string;
  confidenceScore: number;
  reasoning: string;
  matchingServiceIds: string[];
  recommendedStylistIds: string[];
  imageUrl?: string;
}

export interface MatchedRecommendation extends AIRecommendation {
  matchedServices: Service[];
  recommendedStylists: StylistProfile[];
  closestService?: Service;
}

/**
 * Fuzzy match a style name with service names
 */
function fuzzyMatchService(styleName: string, service: Service): number {
  const styleWords = styleName.toLowerCase().split(/\s+/);
  const serviceName = service.name.toLowerCase();
  const serviceDesc = service.description.toLowerCase();
  
  let score = 0;
  
  for (const word of styleWords) {
    if (serviceName.includes(word)) score += 3;
    if (serviceDesc.includes(word)) score += 1;
  }
  
  return score;
}

/**
 * Match AI recommendations with available services
 */
export function matchRecommendationWithServices(
  recommendation: AIRecommendation,
  allServices: Service[]
): Service[] {
  // First try exact ID matches
  const exactMatches = allServices.filter(service =>
    recommendation.matchingServiceIds.includes(service.id)
  );
  
  if (exactMatches.length > 0) {
    return exactMatches;
  }
  
  // Fallback to fuzzy matching
  const scoredServices = allServices.map(service => ({
    service,
    score: fuzzyMatchService(recommendation.styleName, service),
  }));
  
  // Return services with score > 0, sorted by score
  return scoredServices
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.service);
}

/**
 * Find stylists who specialize in the recommended style
 */
export function matchRecommendationWithStylists(
  recommendation: AIRecommendation,
  allStylists: StylistProfile[]
): StylistProfile[] {
  // First try exact ID matches
  const exactMatches = allStylists.filter(stylist =>
    recommendation.recommendedStylistIds.includes(stylist.id)
  );
  
  if (exactMatches.length > 0) {
    return exactMatches;
  }
  
  // Fallback to specialty matching
  const styleKeywords = recommendation.styleName.toLowerCase().split(/\s+/);
  
  return allStylists.filter(stylist =>
    stylist.specialties.some(specialty =>
      styleKeywords.some(keyword =>
        specialty.toLowerCase().includes(keyword)
      )
    )
  );
}

/**
 * Get the closest matching service when no exact match exists
 */
export function getClosestService(
  recommendation: AIRecommendation,
  allServices: Service[]
): Service | undefined {
  if (allServices.length === 0) return undefined;
  
  const scoredServices = allServices.map(service => ({
    service,
    score: fuzzyMatchService(recommendation.styleName, service),
  }));
  
  scoredServices.sort((a, b) => b.score - a.score);
  
  return scoredServices[0].service;
}

/**
 * Match all recommendations with services and stylists
 */
export function matchAllRecommendations(
  recommendations: AIRecommendation[],
  services: Service[],
  stylists: StylistProfile[]
): MatchedRecommendation[] {
  return recommendations.map(recommendation => {
    const matchedServices = matchRecommendationWithServices(recommendation, services);
    const recommendedStylists = matchRecommendationWithStylists(recommendation, stylists);
    const closestService = matchedServices.length === 0
      ? getClosestService(recommendation, services)
      : undefined;
    
    return {
      ...recommendation,
      matchedServices,
      recommendedStylists,
      closestService,
    };
  });
}
