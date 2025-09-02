import { motion } from 'framer-motion'
import { Users, Palette, Globe } from 'lucide-react'

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

const steps = [
  { number: '1', title: 'Sign Up', description: 'Create your free account in seconds with just your email and password.', icon: <Users size={20} /> },
  { number: '2', title: 'Choose Template', description: 'Pick from our collection of beautiful, responsive templates.', icon: <Palette size={20} /> },
  { number: '3', title: 'Customize & Launch', description: 'Add your content, customize colors, and publish instantly.', icon: <Globe size={20} /> },
]

export default function HowItWorks() {
  return (
    <section className="py-24">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl font-bold text-slate-900 mb-6">How It Works</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">Three simple steps to get your website online and start growing your business</p>
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-12"
        >
          {steps.map((step, index) => (
            <motion.div key={index} variants={fadeInUp} className="text-center relative">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[55%] w-full h-0.5 bg-gradient-to-r from-primary to-blue-600 mt-2 transform -translate-y-[80%] z-0"></div>
              )}
              <motion.div whileHover={{ scale: 1.1 }} className="h-20 w-20 rounded-full bg-gradient-to-r from-primary to-blue-600 text-white flex items-center justify-center text-3xl font-bold mx-auto mb-8 relative z-10 shadow-lg">
                {step.number}
              </motion.div>
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
                {step.icon}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed max-w-xs mx-auto">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
