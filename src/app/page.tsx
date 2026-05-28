import Hero from '@/components/Hero'
import CategoryPills from '@/components/CategoryPills'
import ProductsGrid from '@/components/ProductsGrid'
import Services from '@/components/Services'
import Contact from '@/components/Contact'
import Reveal from '@/components/ui/Reveal'

export default function Home() {
  return (
    <>
      <Hero />
      <Reveal>
        <CategoryPills />
      </Reveal>
      <Reveal delay={0.1}>
        <ProductsGrid />
      </Reveal>
      <Reveal delay={0.15}>
        <Services />
      </Reveal>
      <Reveal delay={0.2}>
        <Contact />
      </Reveal>
    </>
  )
}
