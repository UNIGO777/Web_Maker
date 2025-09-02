import { motion } from 'framer-motion'
import { Zap, Palette, Smartphone, Globe, Wand2, CheckCircle } from 'lucide-react'

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const features = [
  { icon: <Zap size={24} />, title: 'Lightning Fast', description: 'Build and deploy your website in minutes, not hours. Our intuitive interface makes it simple.', color: 'from-blue-500 to-cyan-500' },
  { icon: <Palette size={24} />, title: 'Beautiful Templates', description: 'Choose from hundreds of professionally designed templates that look great on any device.', color: 'from-purple-500 to-pink-500' },
  { icon: <Smartphone size={24} />, title: 'Mobile First', description: 'All websites are automatically optimized for mobile devices and tablets.', color: 'from-green-500 to-emerald-500' },
  { icon: <Globe size={24} />, title: 'Instant Publishing', description: 'Your website goes live instantly with our global CDN and reliable hosting.', color: 'from-orange-500 to-red-500' },
  { icon: <Wand2 size={24} />, title: 'AI Powered', description: 'Smart suggestions and auto-completion help you create content faster than ever.', color: 'from-indigo-500 to-purple-500' },
  { icon: <CheckCircle size={24} />, title: 'No Code Required', description: 'Drag and drop interface means anyone can create a professional website without coding.', color: 'from-teal-500 to-blue-500' },
]

export default function Features() {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl font-bold text-slate-900 mb-6">Everything You Need to Build</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">Powerful features that make website creation effortless and enjoyable</p>
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="group bg-white p-8 rounded-3xl border border-slate-200 hover:shadow-2xl transition-all duration-500"
            >
              <div className={`h-16 w-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
