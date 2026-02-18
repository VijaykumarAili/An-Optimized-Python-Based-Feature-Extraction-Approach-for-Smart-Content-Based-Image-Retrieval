import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

const ImageCard = ({ image, similarity, onDelete, showSimilarity = false }) => {
  const [isHovered, setIsHovered] = useState(false)

  // Match score color logic
  const getMatchColor = (score) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 50) return 'bg-yellow-500'
    if (score >= 20) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
    >
      <div className="aspect-square relative">
        <img
          src={image.url || image.image_url || image.image}
          alt={image.filename}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Similarity Percentage Badge */}
        {showSimilarity && similarity !== undefined && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0.9 }}
            className={`absolute top-2 right-2 ${getMatchColor(similarity)} text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md`}
          >
            {similarity.toFixed(1)}% match
          </motion.div>
        )}

        {/* Delete Button */}
        {onDelete && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            onClick={() => onDelete(image.id)}
            className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition"
          >
            <Trash2 size={16} />
          </motion.button>
        )}
      </div>

      {/* File Info */}
      <div className="p-3 text-center">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {image.filename}
        </p>

        {/* Folder / Class name */}
        {image.folder && (
          <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">
            Class: {image.folder}
          </p>
        )}

        {/* Upload date (for uploaded images) */}
        {image.uploaded_at && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {new Date(image.uploaded_at).toLocaleDateString()}
          </p>
        )}
      </div>
    </motion.div>
  )
}

export default ImageCard
