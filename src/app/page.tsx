import StarsCanvas from '@/components/StarsCanvas'
import Preloader from '@/components/Preloader'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import CategoryPills from '@/components/CategoryPills'
import CommerceHighlights from '@/components/CommerceHighlights'
import ProductsGrid from '@/components/ProductsGrid'
import Services from '@/components/Services'
import MaintenanceForm from '@/components/MaintenanceForm'
import TradeForm from '@/components/TradeForm'
import Contact from '@/components/Contact'
import BottomNav from '@/components/BottomNav'
import ToastContainer from '@/components/Toast'
import ScrollObserver from '@/components/ScrollObserver'

import AnnouncementBar from '@/components/AnnouncementBar'

export default function Home() {
  return (
    <>
      <Preloader />
      <StarsCanvas />
      
      <Navbar />
      <AnnouncementBar />
      
      <main>
        {/* Notice we group Hero and CategoryPills together, 
            as CategoryPills was originally at the bottom of the home section */}
        <Hero />
        <CategoryPills />
        <CommerceHighlights />

        <ProductsGrid />
        <Services />
        <MaintenanceForm />
        <TradeForm />
        <Contact />
      </main>

      <BottomNav />
      <ToastContainer />
      <ScrollObserver />
    </>
  )
}
