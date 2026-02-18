import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { imageAPI } from '../api/api'
import ImageCard from '../components/ImageCard'
import { User, Mail, Calendar } from 'lucide-react'

const ProfilePage = () => {
  const { user } = useAuth()
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      const response = await imageAPI.list()
      console.log('📸 [Profile] Fetched images:', response.data)
      setImages(response.data.results || []) // ✅ FIXED
    } catch (error) {
      console.error('🚫 [Profile] Error fetching images:', error)
      toast.error('Failed to load images')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await imageAPI.delete(id)
      setImages((prev) => prev.filter((img) => img.id !== id))
      toast.success('Image deleted successfully')
    } catch (error) {
      console.error('❌ [Profile] Failed to delete image:', error)
      toast.error('Failed to delete image')
    }
  }

  if (loading) {
    return <div className="text-white text-center mt-10">Loading...</div>
  }

  if (!user) {
    return <div className="text-white text-center mt-10">User not found</div>
  }

  return (
    <div className="min-h-screen py-12 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-8">Profile</h1>

          {/* USER INFO */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                <User size={40} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">{user.username}</h2>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    <span>{user.email || 'No email provided'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>
                      Joined{' '}
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* IMAGES */}
          <div>
            <h2 className="text-2xl font-bold mb-4">
              My Images ({images.length})
            </h2>

            {images.length === 0 ? (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                <p>No uploaded images yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {images.map((image) => (
                  <ImageCard
                    key={image.id}
                    image={image}
                    onDelete={handleDelete} // ✅ Deletion works now
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ProfilePage
