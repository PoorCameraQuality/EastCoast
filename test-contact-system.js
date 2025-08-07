const testContactSubmission = async () => {
  console.log('🧪 Testing Contact Form Submission System...\n')

  // Test contact form submission
  const testSubmission = {
    contactType: 'General Feedback',
    name: 'Test User',
    email: 'test@example.com',
    subject: 'Test Contact Form',
    message: 'This is a test submission to verify the contact form is working correctly with the new database integration.',
    contactMethod: 'discord',
    contactMethodDetails: 'testuser#1234'
  }

  try {
    console.log('📝 Submitting test contact form...')
    const response = await fetch('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testSubmission),
    })

    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Contact form submission successful!')
      console.log('📊 Response:', result)
      console.log('\n🎯 Next Steps:')
      console.log('1. Go to http://localhost:3000/admin/review-submissions')
      console.log('2. Look for the "Contact" submission')
      console.log('3. Test the "Mark Responded" button')
      console.log('4. Check that it updates the status to "responded"')
    } else {
      console.log('❌ Contact form submission failed:', result)
    }
  } catch (error) {
    console.error('❌ Error testing contact form:', error)
  }
}

// Run the test
testContactSubmission()
