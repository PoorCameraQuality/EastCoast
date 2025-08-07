import { Metadata } from 'next'
import Breadcrumb from '@/components/Breadcrumb'
import ArticleSubmissionForm from '@/components/education/ArticleSubmissionForm'

export const metadata: Metadata = {
  title: 'Submit Article - Kink Education | East Coast Kink Events',
  description: 'Submit your educational article for review and potential publication on our kink education platform.',
  keywords: 'submit article, kink education, BDSM education, community contribution',
  openGraph: {
    title: 'Submit Article - Kink Education | East Coast Kink Events',
    description: 'Submit your educational article for review and potential publication on our kink education platform.',
    type: 'website',
    url: 'https://eastcoastkinkevents.com/education/submit',
    images: [
      {
        url: 'https://eastcoastkinkevents.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Submit Article - East Coast Kink Events',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Submit Article - Kink Education | East Coast Kink Events',
    description: 'Submit your educational article for review and potential publication.',
    images: ['https://eastcoastkinkevents.com/og-image.png'],
  },
}

export default function SubmitArticlePage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Education', href: '/education' },
    { label: 'Submit Article', current: true }
  ]

  return (
    <div className="min-h-screen bg-black">
      <div className="container-custom py-16">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
              Submit an Article
            </h1>
            <p className="text-lg text-subtle max-w-3xl mx-auto">
              Share your knowledge and contribute to the kink community through educational content.
            </p>
          </div>

          {/* Submission Guidelines */}
          <div className="card-elegant mb-8">
            <h2 className="text-2xl font-serif font-semibold text-white mb-6">
              Submission Guidelines
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Content Requirements:</h3>
                <ul className="space-y-2 text-subtle">
                  <li className="flex items-start">
                    <span className="text-primary-400 mr-2">✓</span>
                    Educational and informative content
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-400 mr-2">✓</span>
                    Safety-focused and evidence-based
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-400 mr-2">✓</span>
                    Inclusive and respectful language
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-400 mr-2">✓</span>
                    Minimum 500 words, maximum 3000 words
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-400 mr-2">✓</span>
                    Proper citations and references
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Topics We Accept:</h3>
                <ul className="space-y-2 text-subtle">
                  <li>• Safety and consent frameworks</li>
                  <li>• Negotiation and communication</li>
                  <li>• Aftercare and emotional health</li>
                  <li>• Community guidelines and etiquette</li>
                  <li>• Educational resources and tools</li>
                  <li>• Personal experiences (anonymized)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submission Form */}
          <ArticleSubmissionForm />
        </div>
      </div>
    </div>
  )
}
