import { Link } from 'react-router-dom'
import { Github, Linkedin, Mail } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Project Info */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">VisionFind</h3>
            <p className="text-sm leading-relaxed">
              Advanced Content-Based Image Retrieval System powered by
              <span className="text-primary-400"> CLIP </span>
              and
              <span className="text-primary-400"> FAISS</span>.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-primary-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary-400 transition">
                  About
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-primary-400 transition">
                  Search
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary-400 transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Connect</h4>
            <div className="flex space-x-4">
              <a
                href="https://github.com/vishnu-R2005"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-400 transition"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>

              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-400 transition"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>

              {/* REAL EMAIL LINK */}
              <a
                href="mailto:vishu19042005@gmail.com?subject=VisionFind%20Query"
                className="hover:text-primary-400 transition"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>

            {/* Email text */}
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} VisionFind.  
            Built by <span className="text-white font-medium">Vishnu</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
