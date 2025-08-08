import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-dark-950 text-white border-t border-dark-700">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-primary-600 rounded-none flex items-center justify-center">
                <span className="text-white font-serif font-bold text-lg">EC</span>
              </div>
              <span className="text-xl font-serif font-semibold">East Coast Kink Events</span>
            </div>
            <p className="text-gray-300 mb-8 max-w-md leading-relaxed">
              Connecting kink communities across the East Coast. Find events, make friends, and explore safely with discretion and elegance.
            </p>
            <div className="flex space-x-6">
              <a 
                href="https://discord.gg/xcnGGyGsmT" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-400 transition-colors duration-300 discord-glow"
                title="Join our Discord community"
              >
                <span className="sr-only">Discord</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.019 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-serif font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/events" className="text-gray-300 hover:text-primary-400 transition-colors duration-300">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link href="/calendar" className="text-gray-300 hover:text-primary-400 transition-colors duration-300">
                  Event Calendar
                </Link>
              </li>
              <li>
                            <Link href="/contact" className="text-gray-300 hover:text-primary-400 transition-colors duration-300">
              Submit Event
            </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-primary-400 transition-colors duration-300">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-serif font-semibold mb-6">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-primary-400 transition-colors duration-300">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="text-gray-300 hover:text-primary-400 transition-colors duration-300">
                  Community Guidelines
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-primary-400 transition-colors duration-300">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-primary-400 transition-colors duration-300">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-700 mt-12 pt-8">
          {/* Disclaimer */}
          <div className="mb-6 p-4 bg-dark-900 border border-dark-600 rounded-none">
            <h4 className="text-sm font-semibold text-white mb-2">Important Disclaimer</h4>
            <div className="text-xs text-gray-400 space-y-2">
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
          
          <div className="text-center">
            <p className="text-gray-400">
              © 2024 East Coast Kink Events. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
} 
