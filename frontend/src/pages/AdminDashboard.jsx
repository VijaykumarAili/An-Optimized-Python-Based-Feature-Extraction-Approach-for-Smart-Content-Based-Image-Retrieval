import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { statsAPI } from '../api/api'
import StatsCard from '../components/StatsCard'
import Loader from '../components/Loader'
import { Users, Image as ImageIcon, Search, Cpu, TrendingUp, Activity } from 'lucide-react'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const response = await statsAPI.getStats()
      setStats(response.data)
    } catch (error) {
      toast.error('Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return <Loader />
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            System statistics and analytics
          </p>
        </motion.div>

        {/* GPU Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cpu className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    GPU Status
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.gpu.available ? 'GPU Available' : 'CPU Mode'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`px-4 py-2 rounded-full ${
                  stats.gpu.available
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                }`}>
                  {stats.gpu.available ? 'Active' : 'Inactive'}
                </div>
                {stats.gpu.name && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {stats.gpu.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Users"
            value={stats.users.total}
            icon={Users}
            color="primary"
          />
          <StatsCard
            title="Total Images"
            value={stats.images.total}
            icon={ImageIcon}
            color="green"
          />
          <StatsCard
            title="Total Searches"
            value={stats.searches.total}
            icon={Search}
            color="blue"
          />
          <StatsCard
            title="Recent Uploads (7d)"
            value={stats.images.recent_uploads}
            icon={TrendingUp}
            color="purple"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              Users by Role
            </h3>
            <div className="space-y-3">
              {stats.users.by_role.map((role, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 capitalize">
                    {role.role}
                  </span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {role.count}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Recent Uploads (7d)
                </span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stats.images.recent_uploads}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Recent Searches (7d)
                </span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stats.searches.recent}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

