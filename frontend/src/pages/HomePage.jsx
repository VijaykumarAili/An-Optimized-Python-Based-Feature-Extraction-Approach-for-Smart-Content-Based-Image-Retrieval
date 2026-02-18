import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Search, Upload, Zap, Shield } from 'lucide-react'

const HomePage = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              VisionFind
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Content-Based Image Retrieval System
            </p>
            <p className="text-lg mb-12 max-w-2xl mx-auto text-primary-200">
              Find similar images instantly using advanced AI-powered deep learning. 
              Upload an image and discover visually similar content from your collection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <Link
                    to="/upload"
                    className="px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition shadow-lg"
                  >
                    Upload Images
                  </Link>
                  <Link
                    to="/search"
                    className="px-8 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-400 transition border-2 border-white"
                  >
                    Search Images
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition shadow-lg"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/about"
                    className="px-8 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-400 transition border-2 border-white"
                  >
                    Learn More
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Everything you need for intelligent image search
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Zap,
                title: 'GPU Accelerated',
                description: 'Lightning-fast search using CUDA when available',
              },
              {
                icon: Search,
                title: 'Deep Learning',
                description: 'CLIP ViT-B/32 for state-of-the-art feature extraction',
              },
              {
                icon: Upload,
                title: 'Easy Upload',
                description: 'Drag and drop interface for seamless image management',
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                description: 'Role-based access control and user data isolation',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl transition"
              >
                <feature.icon className="w-12 h-12 text-primary-600 dark:text-primary-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Upload Images',
                description: 'Add your images to the system. Features are automatically extracted using CLIP.',
              },
              {
                step: '2',
                title: 'Search',
                description: 'Upload a query image to find visually similar images from your collection.',
              },
              {
                step: '3',
                title: 'Get Results',
                description: 'Receive ranked results with similarity scores in milliseconds.',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage

