import HeroSection from '@/components/features/homepage/hero-section'
import FeatureHighlights from '@/components/features/homepage/feature-highlights'
import LatestOpportunities from '@/components/features/homepage/latest-opportunities'
import TrendingTopics from '@/components/features/homepage/trending-topics'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeatureHighlights />
      <LatestOpportunities />
      <TrendingTopics />
    </div>
  )
}
