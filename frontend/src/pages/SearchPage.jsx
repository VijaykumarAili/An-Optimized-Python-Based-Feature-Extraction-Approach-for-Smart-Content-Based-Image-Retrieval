import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-toastify'
import { searchAPI } from '../api/api'
import { Search } from 'lucide-react'
import LoaderComponent from '../components/Loader'

const SearchPage = () => {
  const [searching, setSearching] = useState(false)
  const [queryImage, setQueryImage] = useState(null)
  const [topK, setTopK] = useState(25) // ✅ default search result count
  const navigate = useNavigate()

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      setQueryImage(URL.createObjectURL(file))
      setSearching(true)

      try {
        const formData = new FormData()
        formData.append('image', file)

        const response = await searchAPI.search(formData, topK)

        // Store results and navigate
        sessionStorage.setItem('searchResults', JSON.stringify(response.data))
        navigate('/results')
      } catch (error) {
        console.error('❌ [Search] Error:', error)
        toast.error(error.response?.data?.error || 'Search failed')
        setSearching(false)
      }
    },
    [navigate, topK]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    multiple: false,
    disabled: searching,
  })

  return (
    <div className="min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Search Similar Images
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Upload a query image to find visually similar ones from your collection.
          </p>

          {/* ✅ Top K Selector */}
          <div className="flex justify-center items-center mb-4">
            <label className="mr-3 text-gray-700 dark:text-gray-300 font-medium">
              Results count:
            </label>
            <select
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            >
              <option value={10}>Top 10</option>
              <option value={25}>Top 25</option>
              <option value={50}>Top 50</option>
              <option value={100}>Top 100</option>
            </select>
          </div>
        </motion.div>

        {/* ✅ Search Area */}
        {searching ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <LoaderComponent size="lg" />
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-400">
              Searching top {topK} matches...
            </p>
            {queryImage && (
              <div className="mt-8">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Query Image:
                </p>
                <img
                  src={queryImage}
                  alt="Query"
                  className="max-w-xs rounded-lg shadow-md border border-gray-300 dark:border-gray-700"
                />
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-16 text-center cursor-pointer transition ${isDragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                }`}
            >
              <input {...getInputProps()} />
              <Search className="w-20 h-20 mx-auto text-blue-600 dark:text-blue-400 mb-6" />
              <p className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isDragActive
                  ? 'Drop image here'
                  : 'Drag & drop your query image here'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                or click to select a file
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default SearchPage
