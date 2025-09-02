import { motion } from 'framer-motion'
import { Globe, Users, CheckCircle, Clock } from 'lucide-react'

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.1 }
  }
}

const stats = [
  { number: '10K+', label: 'Websites Created', icon: <Globe size={24} /> },
  { number: '50K+', label: 'Happy Customers', icon: <Users size={24} /> },
  { number: '5M+', label: 'Pages Published', icon: <CheckCircle size={24} /> },
  { number: '24/7', label: 'Support Available', icon: <Clock size={24} /> },
]

export default function Stats() {
  return (
    <section className="py-20 bg-gradient-to-r from-slate-900 to-slate-800">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-6">Trusted by Thousands</h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">Join the community of successful entrepreneurs and creators</p>
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div key={index} variants={fadeInUp} className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center text-white mx-auto mb-4">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stat.number}</div>
              <div className="text-slate-300">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
