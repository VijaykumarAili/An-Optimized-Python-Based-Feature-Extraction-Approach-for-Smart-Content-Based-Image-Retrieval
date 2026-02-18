import { motion } from 'framer-motion'
import { Code, Database, Cpu, Users } from 'lucide-react'

const AboutPage = () => {
  const techStack = [
    { name: 'Django 5', category: 'Backend' },
    { name: 'Django REST Framework', category: 'API' },
    { name: 'React + Vite', category: 'Frontend' },
    { name: 'TailwindCSS', category: 'Styling' },
    { name: 'OpenAI CLIP', category: 'AI/ML' },
    { name: 'FAISS', category: 'Vector Search' },
    { name: 'PyTorch', category: 'Deep Learning' },
    { name: 'SQLite3', category: 'Database' },
    { name: 'JWT', category: 'Authentication' },
  ]

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            About VisionFind
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            A modern Content-Based Image Retrieval (CBIR) system that leverages 
            state-of-the-art deep learning to find visually similar images.
          </p>
        </motion.div>

        {/* Overview */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Overview
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              VisionFind is a full-stack web application designed for content-based image retrieval. 
              It uses OpenAI's CLIP (Contrastive Language-Image Pre-training) model to extract 
              deep feature vectors from images, which are then indexed using FAISS for fast similarity search.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              The system supports GPU acceleration when available, enabling real-time image search 
              even with large image collections. With role-based access control, users can manage 
              their own image collections while administrators have system-wide oversight.
            </p>
          </div>
        </motion.section>

        {/* Tech Stack */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Code className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            Technology Stack
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {techStack.map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-xl transition"
              >
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {tech.category}
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {tech.name}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Features */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Cpu className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              'GPU-accelerated feature extraction with CUDA support',
              'FAISS-based similarity search with GPU fallback',
              'JWT-based authentication and authorization',
              'Role-based access control (Admin/User)',
              'RESTful API with Swagger documentation',
              'Responsive and modern UI with dark mode',
              'Real-time image upload and processing',
              'Similarity scoring and ranking',
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
              >
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0" />
                <p className="text-gray-700 dark:text-gray-300">{feature}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Architecture */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Database className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            Architecture
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Backend (Django)
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  RESTful API with Django REST Framework, JWT authentication, and CLIP integration. 
                  Images are processed and feature vectors are stored in SQLite3.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Frontend (React)
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Modern React application with Vite, TailwindCSS, and Framer Motion for smooth animations. 
                  Responsive design with dark mode support.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  AI/ML Pipeline
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  CLIP ViT-B/32 extracts 512-dimensional feature vectors. FAISS indexes these vectors 
                  for fast L2 distance computation and similarity search.
                </p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  )
}

export default AboutPage

