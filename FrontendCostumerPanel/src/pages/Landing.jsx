import Header from '../components/Header'
import Hero from '../components/Hero'
import Features from '../components/Features'
import HowItWorks from '../components/HowItWorks'
import Stats from '../components/Stats'
import CTA from '../components/CTA'
import Footer from '../components/Footer'

export default function Landing() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <Stats />
      <CTA />
      <Footer />
    </div>
  )
}
