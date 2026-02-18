import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { Sun, Moon, User, Bell } from 'lucide-react'

const SettingsPage = () => {
  const { darkMode, toggleTheme } = useTheme()
  const { user } = useAuth()

  return (
    <div className="min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Settings
          </h1>

          <div className="space-y-6">
            {/* Theme Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {darkMode ? (
                    <Moon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  ) : (
                    <Sun className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Theme
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {darkMode ? 'Dark mode' : 'Light mode'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  Switch to {darkMode ? 'Light' : 'Dark'} Mode
                </button>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Account Information
                </h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={user?.username || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    value={user?.role === 'admin' ? 'Administrator' : 'User'}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Notification settings coming soon...
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default SettingsPage

