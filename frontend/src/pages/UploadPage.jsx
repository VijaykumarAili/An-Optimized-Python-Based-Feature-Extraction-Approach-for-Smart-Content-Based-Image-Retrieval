import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-toastify'
import { imageAPI } from '../api/api'
import { Upload, X, CheckCircle } from 'lucide-react'
import Loader from '../components/Loader'

const UploadPage = () => {
  const [uploading, setUploading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState([])

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return

    setUploading(true)
    const newImages = []

    for (const file of acceptedFiles) {
      try {
        const formData = new FormData()
        formData.append('image', file)

        const response = await imageAPI.upload(formData)
        newImages.push(response.data)
        toast.success(`Uploaded: ${file.name}`)
      } catch (error) {
        toast.error(`Failed to upload ${file.name}: ${error.response?.data?.error || 'Unknown error'}`)
      }
    }

    setUploadedImages([...newImages, ...uploadedImages])
    setUploading(false)
  }, [uploadedImages])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    multiple: true,
  })

  return (
    <div className="min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Upload Images
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Upload images to build your searchable collection. Features will be extracted automatically.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition ${
              isDragActive
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
            }`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div className="flex flex-col items-center">
                <Loader size="lg" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">Processing images...</p>
              </div>
            ) : (
              <>
                <Upload className="w-16 h-16 mx-auto text-primary-600 dark:text-primary-400 mb-4" />
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isDragActive ? 'Drop images here' : 'Drag & drop images here'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  or click to select files
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Supports: JPEG, PNG, GIF, WebP
                </p>
              </>
            )}
          </div>
        </motion.div>

        {uploadedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Recently Uploaded
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {uploadedImages.slice(0, 6).map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.image_url}
                    alt={image.filename}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                    <CheckCircle size={16} className="text-white" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default UploadPage

