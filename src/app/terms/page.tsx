export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container-custom py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">
              Terms of Service
            </h1>
            <p className="text-lg text-subtle max-w-3xl mx-auto">
              Please read these terms carefully before using our website.
            </p>
          </div>

          {/* Content */}
          <div className="card-elegant">
            <div className="prose prose-invert max-w-none">
              <div className="space-y-8 text-subtle leading-relaxed">
                
                <section>
                  <h2 className="text-2xl font-serif font-semibold text-white mb-4">
                    1. Information Disclaimer
                  </h2>
                  <p className="mb-4">
                    All information provided on this website is for informational purposes only. 
                    We do not verify, endorse, or guarantee the accuracy, completeness, or reliability 
                    of any information, events, venues, or services listed on this website.
                  </p>
                  <p>
                    Users are responsible for independently verifying all information before making 
                    any decisions or taking any actions based on the content provided on this website.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-serif font-semibold text-white mb-4">
                    2. No Liability
                  </h2>
                  <p className="mb-4">
                    By using this website, you acknowledge and agree that we are not responsible 
                    for any decisions you make or actions you take based on the information provided 
                    on this website.
                  </p>
                  <p>
                    We expressly disclaim all liability for any damages, losses, or injuries that 
                    may result from your use of this website or reliance on any information contained herein.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-serif font-semibold text-white mb-4">
                    3. User Responsibility
                  </h2>
                  <p className="mb-4">
                    You are solely responsible for your own safety, well-being, and compliance with 
                    all applicable laws and regulations when participating in any events or activities 
                    listed on this website.
                  </p>
                  <p>
                    We encourage all users to exercise due diligence, use common sense, and make 
                    informed decisions when engaging with any content or services found on this website.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-serif font-semibold text-white mb-4">
                    4. Third-Party Content
                  </h2>
                  <p className="mb-4">
                    This website may contain links to third-party websites, events, or services. 
                    We do not control, endorse, or assume responsibility for any third-party content, 
                    privacy policies, or practices.
                  </p>
                  <p>
                    Any interactions with third-party websites or services are at your own risk, 
                    and we are not liable for any issues that may arise from such interactions.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-serif font-semibold text-white mb-4">
                    5. Website Usage
                  </h2>
                  <p className="mb-4">
                    By using this website, you agree to use it only for lawful purposes and in 
                    accordance with these Terms of Service. You agree not to use the website in any 
                    way that could damage, disable, overburden, or impair our servers or networks.
                  </p>
                  <p>
                    We reserve the right to modify, suspend, or discontinue any part of this website 
                    at any time without notice.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-serif font-semibold text-white mb-4">
                    6. Privacy and Data
                  </h2>
                  <p className="mb-4">
                    Your privacy is important to us. Please review our Privacy Policy to understand 
                    how we collect, use, and protect your information.
                  </p>
                  <p>
                    By using this website, you consent to the collection and use of information 
                    as outlined in our Privacy Policy.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-serif font-semibold text-white mb-4">
                    7. Changes to Terms
                  </h2>
                  <p className="mb-4">
                    We reserve the right to modify these Terms of Service at any time. Changes 
                    will be effective immediately upon posting on this website.
                  </p>
                  <p>
                    Your continued use of the website after any changes constitutes acceptance 
                    of the modified terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-serif font-semibold text-white mb-4">
                    8. Contact Information
                  </h2>
                  <p>
                    If you have any questions about these Terms of Service, please contact us 
                    through our website's contact form.
                  </p>
                </section>

                <div className="border-t border-dark-600 pt-8 mt-12">
                  <p className="text-sm text-gray-400">
                    <strong>Last updated:</strong> {new Date().toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    By using this website, you acknowledge that you have read, understood, 
                    and agree to be bound by these Terms of Service.
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
