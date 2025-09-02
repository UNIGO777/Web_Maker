import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Wand2 } from 'lucide-react'

export default function CTA() {
  return (
    <section className="py-24 bg-gradient-to-br from-primary via-blue-600 to-purple-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative  mx-auto text-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold text-white mb-8">Ready to Build Your Website?</h2>
          <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of customers who have already created their websites with Web Maker and are growing their businesses online.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link 
              to="/dashboard" 
              className="inline-flex items-center justify-center gap-3 bg-white text-primary px-12 py-5 rounded-2xl text-xl font-bold hover:shadow-2xl transition-all duration-300 shadow-lg"
            >
              Start Building Now
              <ArrowRight size={24} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
