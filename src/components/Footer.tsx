import Link from 'next/link'
import FooterRecentContent from './FooterRecentContent'

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-dark-950 to-black border-t border-dark-700/50">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(74,123,183,0.1),transparent_50%)]"></div>
      
      <div className="container-custom py-12 relative">
        {/* Main footer content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-12">
          {/* Brand section */}
          <div className="lg:col-span-1 xl:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-serif font-bold text-2xl">EC</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary-400/20 to-primary-600/20 rounded-xl"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-serif font-semibold text-white">
                  East Coast Kink Events
                </span>
                <span className="text-sm text-gray-400 font-medium tracking-wide">
                  Community • Events • Education
                </span>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              Connecting kink communities across the East Coast. Find events, make friends, and explore safely with discretion and elegance.
            </p>
            
            {/* Social links */}
            <div className="flex items-center space-x-4">
              <a 
                href="https://discord.gg/xcnGGyGsmT" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative p-3 bg-dark-800/50 hover:bg-primary-600/20 rounded-xl transition-all duration-300 border border-dark-600 hover:border-primary-600/50"
                title="Join our Discord community"
              >
                <span className="sr-only">Discord</span>
                <svg className="w-6 h-6 text-gray-400 group-hover:text-primary-300 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                </svg>
                <div className="absolute inset-0 bg-gradient-to-br from-primary-400/10 to-primary-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
            </div>
          </div>

          {/* Links and Resources Section */}
          <div className="lg:col-span-1 xl:col-span-1">
            {/* Quick Links */}
            <div className="mb-6">
              <h3 className="text-lg font-serif font-semibold text-white mb-4 flex items-center">
                <span className="w-8 h-px bg-primary-500 mr-3"></span>
                Quick Links
              </h3>
              <ul className="space-y-3">
                {[
                  { href: '/events', label: 'Browse Events', icon: '🎪' },
                  { href: '/calendar', label: 'Event Calendar', icon: '📅' },
                  { href: '/events', label: 'Add Event', icon: '➕' },
                  { href: '/about', label: 'About Us', icon: 'ℹ️' }
                ].map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="flex items-center space-x-3 text-gray-300 hover:text-primary-300 transition-colors duration-300 group"
                    >
                      <span className="text-base opacity-60 group-hover:opacity-100 transition-opacity duration-300">{link.icon}</span>
                      <span className="font-medium text-base">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-serif font-semibold text-white mb-4 flex items-center">
                <span className="w-8 h-px bg-primary-500 mr-3"></span>
                Resources
              </h3>
              <ul className="space-y-3">
                {[
                  { href: '/dungeons', label: 'Dungeons', icon: '🏰' },
                  { href: '/education', label: 'Education', icon: '📚' },
                  { href: '/guidelines', label: 'Guidelines', icon: '📋' },
                  { href: '/contact', label: 'Contact', icon: '📧' }
                ].map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="flex items-center space-x-3 text-gray-300 hover:text-primary-300 transition-colors duration-300 group"
                    >
                      <span className="text-base opacity-60 group-hover:opacity-100 transition-opacity duration-300">{link.icon}</span>
                      <span className="font-medium text-base">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recent Content and Legal */}
          <div className="lg:col-span-1 xl:col-span-1">
            {/* Recent Content */}
            <FooterRecentContent />
            
            {/* Legal Links */}
            <div className="mt-6">
              <h3 className="text-lg font-serif font-semibold text-white mb-4 flex items-center">
                <span className="w-8 h-px bg-primary-500 mr-3"></span>
                Legal
              </h3>
              <ul className="space-y-3">
                {[
                  { href: '/privacy', label: 'Privacy Policy', icon: '🔒' },
                  { href: '/terms', label: 'Terms of Service', icon: '📄' },
                  { href: '/guidelines', label: 'Community Guidelines', icon: '🤝' }
                ].map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="flex items-center space-x-3 text-gray-300 hover:text-primary-300 transition-colors duration-300 group"
                    >
                      <span className="text-base opacity-60 group-hover:opacity-100 transition-opacity duration-300">{link.icon}</span>
                      <span className="font-medium text-base">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stay Connected */}
            <div className="mt-6">
              <h3 className="text-lg font-serif font-semibold text-white mb-4 flex items-center">
                <span className="w-8 h-px bg-primary-500 mr-3"></span>
                Stay Connected
              </h3>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Join our community for updates and event notifications.
              </p>
              <a 
                href="https://discord.gg/xcnGGyGsmT" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-outline text-sm px-4 py-2"
              >
                Join Discord
              </a>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-dark-700/50 mt-12 pt-6">
          {/* Disclaimer */}
          <div className="mb-6 p-4 bg-dark-900/50 border border-dark-700/50 rounded-xl backdrop-blur-sm">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
              <span className="w-4 h-px bg-primary-500 mr-2"></span>
              Important Disclaimer
            </h4>
            <div className="text-xs text-gray-400 space-y-2 leading-relaxed">
              <p>
                East Coast Kink Events is an event aggregator. Event listings do not constitute endorsements of events or organizers. 
                Always conduct your own due diligence when vetting events you plan to attend.
              </p>
              <p>
                We provide a community Discord free of organizer influence to help facilitate informed decision-making. 
                Your safety and informed choices are our priority.
              </p>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2024 East Coast Kink Events. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-gray-400 text-sm">
              <span>Made with ❤️ for the community</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 
