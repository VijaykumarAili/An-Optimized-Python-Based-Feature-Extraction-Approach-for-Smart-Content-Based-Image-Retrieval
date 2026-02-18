import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, ArrowLeft } from 'lucide-react'
import ImageCard from '../components/ImageCard'

const ResultsPage = () => {
  const [results, setResults] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const storedResults = sessionStorage.getItem('searchResults')
    if (storedResults) {
      const data = JSON.parse(storedResults)
      // ✅ Handle both backend formats
      setResults(data.results || data || [])
    } else {
      navigate('/search')
    }
  }, [navigate])

  if (!results || results.length === 0) {
    return (
      <div className="min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/search')}
            className="mb-6 flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            <ArrowLeft size={20} />
            Back to Search
          </button>
          <div className="text-center py-20">
            <p className="text-lg text-gray-600 dark:text-gray-400">No results found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/search')}
            className="mb-6 flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            <ArrowLeft size={20} />
            Back to Search
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Search Results
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Found {results.length} similar image{results.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => navigate('/search')}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              <Search size={20} />
              New Search
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {results.map((result, index) => (
            <motion.div
              key={result.filename || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ImageCard
                // ✅ Adjust props to match backend output
                image={{ url: result.image_url, filename: result.filename }}
                similarity={result.score}
                showSimilarity={true}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export default ResultsPage
