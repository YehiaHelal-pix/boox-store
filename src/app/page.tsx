import HeroSection from '@/components/home/HeroSection'
import TrustBadges from '@/components/home/TrustBadges'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import ServicesSection from '@/components/home/ServicesSection'
import StatsSection from '@/components/home/StatsSection'
import LocationSection from '@/components/home/LocationSection'

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            <HeroSection />
            <TrustBadges />
            <FeaturedProducts />
            <ServicesSection />
            <StatsSection />
            <LocationSection />
        </div>
    )
}
