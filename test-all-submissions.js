const testAllSubmissions = async () => {
  console.log('🧪 Testing Complete Submission System...\n')

  // Test data for different contact form types
  const contactTests = [
    {
      name: 'General Feedback Test',
      data: {
        contactType: 'General Feedback',
        name: 'Test User 1',
        email: 'feedback@example.com',
        subject: 'Website Feedback',
        message: 'This is a test general feedback submission. The website looks great and I love the new features!',
        contactMethod: 'email',
        contactMethodDetails: ''
      }
    },
    {
      name: 'Add Event Test',
      data: {
        contactType: 'Add my event',
        name: 'Event Organizer',
        email: 'organizer@example.com',
        subject: 'New Event Submission',
        message: 'I would like to submit my event for listing on your website. It meets all the requirements.',
        eventName: 'Test Kink Conference 2025',
        eventDate: '2025-06-15',
        eventLocation: 'New York, NY',
        eventWebsite: 'https://testevent.com',
        contactMethod: 'discord',
        contactMethodDetails: 'organizer#1234'
      }
    },
    {
      name: 'Add Dungeon Test',
      data: {
        contactType: 'Add my dungeon',
        name: 'Dungeon Owner',
        email: 'dungeon@example.com',
        subject: 'Dungeon Listing Request',
        message: 'I would like to list my dungeon on your website. We have a permanent location and website.',
        dungeonName: 'Test Dungeon Space',
        dungeonLocation: 'Los Angeles, CA',
        dungeonWebsite: 'https://testdungeon.com',
        contactMethod: 'phone',
        contactMethodDetails: '555-123-4567'
      }
    },
    {
      name: 'Admin Contact Test',
      data: {
        contactType: 'Contact site administration',
        name: 'Admin User',
        email: 'admin@example.com',
        subject: 'Administrative Question',
        message: 'I have a question about the website administration and would like to discuss some technical details.',
        contactMethod: 'email',
        contactMethodDetails: ''
      }
    }
  ]

  // Test data for article submissions
  const articleTests = [
    {
      name: 'Safety Article Test',
      data: {
        articleTitle: 'Essential Safety Guidelines for Kink Communities',
        articleExcerpt: 'A comprehensive guide to maintaining safety and consent in kink spaces.',
        articleContent: 'This is a detailed article about safety guidelines for kink communities. It covers topics like consent, communication, risk awareness, and community standards. The article provides practical advice for both newcomers and experienced practitioners. Safety should always be the top priority in any kink activity. This includes proper communication, understanding of risks, and having appropriate safety measures in place. Consent is fundamental and must be ongoing throughout any activity. Communication should be clear and honest about expectations, limits, and desires. Risk awareness involves understanding the potential physical and emotional risks of activities and taking steps to minimize them. Community standards help ensure that spaces are safe and welcoming for all participants. Regular check-ins during activities are essential for maintaining safety and consent. Aftercare is also crucial for emotional well-being after intense scenes. Education and training should be ongoing for all participants. Safety equipment should be properly maintained and used correctly. Emergency procedures should be known and practiced. Regular health check-ups are important for those engaging in physical activities. Mental health support should be available when needed. Community resources should be accessible and well-publicized. Ongoing dialogue about safety helps maintain high standards. Regular reviews of safety protocols ensure they remain effective. Feedback from community members helps improve safety measures. Documentation of safety procedures helps with consistency. Training programs should be regularly updated and improved. Safety should never be compromised for convenience or speed. All participants should feel empowered to speak up about safety concerns. Regular safety audits help identify potential issues before they become problems. Community leaders should model good safety practices. Safety education should be accessible to all community members. Regular safety workshops help maintain awareness. Emergency contacts should be readily available. Safety protocols should be clearly communicated to all participants. Regular safety drills help prepare for emergencies. Safety should be integrated into all aspects of community activities. Additionally, it is important to understand that safety is not just about physical well-being, but also emotional and psychological safety. Participants should feel comfortable expressing their needs and boundaries without fear of judgment or retaliation. Creating a culture of safety requires ongoing effort and commitment from all community members. Regular training and education help ensure that safety practices remain current and effective. Community feedback and input are essential for developing and maintaining appropriate safety standards. Documentation and clear communication of safety procedures help ensure consistency across different events and spaces. Regular reviews and updates of safety protocols help address emerging concerns and improve overall community safety. Building a strong safety culture requires leadership, education, and ongoing commitment from all participants.',
        authorName: 'Safety Expert',
        authorEmail: 'safety@example.com',
        authorBio: 'Experienced kink educator with 10+ years in the community',
        articleCategory: 'Safety',
        articleTags: 'safety, consent, guidelines',
        contactMethod: 'email',
        agreeToTerms: true
      }
    },
    {
      name: 'Education Article Test',
      data: {
        articleTitle: 'Introduction to Rope Bondage',
        articleExcerpt: 'A beginner-friendly guide to rope bondage techniques and safety.',
        articleContent: 'This article introduces readers to the basics of rope bondage. It covers essential safety information, basic techniques, and resources for further learning. Perfect for those new to rope work. Rope bondage is an art form that requires careful attention to safety and technique. Before beginning any rope work, it is essential to understand the risks involved and how to minimize them. Always have safety shears readily available when doing rope bondage. Never leave someone in rope bondage unattended. Regular communication is crucial during rope scenes. Check for circulation and sensation regularly. Learn proper techniques from experienced practitioners. Start with simple ties and gradually build complexity. Use appropriate rope materials for the intended purpose. Natural fiber ropes like hemp or jute are popular for their texture and grip. Synthetic ropes like nylon are smooth and easy to handle. Consider the diameter and length of rope needed for your project. Always inspect rope for damage before use. Proper rope care extends its lifespan and ensures safety. Store rope properly to prevent damage. Learn to tie basic knots safely before attempting complex patterns. Practice on yourself or consenting partners before trying new techniques. Understand the difference between decorative and functional ties. Decorative ties focus on aesthetics while functional ties provide restraint. Always have a plan for quick release in emergencies. Learn about nerve anatomy to avoid dangerous pressure points. Regular breaks during long scenes prevent circulation issues. Aftercare is especially important after rope scenes. Emotional support and physical care help with recovery. Communication about sensations and comfort is ongoing. Respect limits and boundaries at all times. Education should be ongoing and comprehensive. Safety should never be compromised for aesthetics. Regular practice improves both safety and skill. Community support helps maintain high standards. Documentation of techniques helps with learning. Regular safety reviews prevent complacency. Emergency procedures should be well-practiced. Health considerations should be discussed beforehand. Mental preparation is as important as physical technique. Regular check-ins maintain safety and consent. Additionally, rope bondage requires understanding of basic anatomy and physiology. Different body types and conditions may require adjustments to techniques. Communication about comfort and sensation is essential throughout any rope scene. Regular breaks help prevent circulation issues and allow for check-ins. Proper aftercare includes both physical and emotional support. Learning from experienced practitioners helps ensure safety and proper technique. Community resources and classes provide valuable education opportunities. Regular practice with consenting partners helps develop skills safely. Understanding the difference between decorative and functional ties is important for safety. Emergency procedures should be practiced regularly. Documentation of techniques and safety procedures helps with learning and consistency.',
        authorName: 'Rope Educator',
        authorEmail: 'rope@example.com',
        authorBio: 'Certified rope instructor and safety advocate',
        articleCategory: 'Education',
        articleTags: 'rope, bondage, beginner',
        contactMethod: 'discord',
        agreeToTerms: true
      }
    },
    {
      name: 'Community Article Test',
      data: {
        articleTitle: 'Building Inclusive Kink Spaces',
        articleExcerpt: 'How to create welcoming and inclusive environments for diverse kink communities.',
        articleContent: 'This article discusses the importance of inclusivity in kink spaces. It provides practical advice for organizers on creating welcoming environments for people of all backgrounds, abilities, and experience levels. Inclusivity in kink spaces is essential for building strong, supportive communities. Everyone should feel welcome and safe regardless of their background, identity, or experience level. Creating inclusive spaces requires intentional effort and ongoing commitment. Start by examining your own biases and assumptions. Listen to feedback from community members about their experiences. Make space for diverse voices and perspectives. Ensure that your events and spaces are accessible to people with disabilities. Provide clear information about accessibility features. Consider the needs of people with different mobility requirements. Offer alternative formats for information and communication. Create spaces that are welcoming to people of all gender identities and expressions. Use inclusive language in all communications. Provide gender-neutral facilities where possible. Respect people\'s chosen names and pronouns. Consider the needs of people from different cultural backgrounds. Be aware of cultural sensitivities and traditions. Provide information in multiple languages when possible. Create spaces that are welcoming to people of all ages (where legally appropriate). Consider the needs of older community members. Make space for younger participants who are legally able to participate. Ensure that your spaces are welcoming to people of all sexual orientations. Avoid assumptions about people\'s relationships or attractions. Create spaces that are welcoming to people of all relationship styles. Respect different approaches to relationships and commitment. Consider the needs of people with different economic circumstances. Offer sliding scale fees when possible. Provide information about community resources and support. Create spaces that are welcoming to people with different levels of experience. Provide opportunities for learning and growth. Avoid elitism or gatekeeping based on experience. Ensure that your spaces are welcoming to people with different body types and abilities. Avoid body shaming or size-based discrimination. Provide appropriate furniture and equipment. Consider the needs of people with different sensory sensitivities. Provide quiet spaces when possible. Offer information about potential triggers or intense content. Create spaces that are welcoming to people with different communication styles. Provide multiple ways to participate and contribute. Respect different approaches to social interaction. Regular feedback helps maintain inclusivity. Be open to criticism and suggestions for improvement. Ongoing education helps organizers stay informed about best practices. Community input should guide decision-making processes. Documentation helps maintain consistency and accountability. Regular reviews ensure that inclusivity efforts remain effective. Additionally, creating inclusive spaces requires ongoing education and self-reflection. Organizers should regularly examine their own biases and assumptions. Listening to feedback from community members is essential for understanding their needs and experiences. Making space for diverse voices and perspectives helps ensure that all community members feel represented and heard. Accessibility considerations should be integrated into all aspects of event planning and space design. Providing clear information about accessibility features helps participants make informed decisions about their participation. Considering the needs of people with different abilities and requirements helps create more welcoming environments. Offering alternative formats for information and communication ensures that all participants can access important information. Creating gender-inclusive spaces requires intentional effort and ongoing commitment to using inclusive language and providing appropriate facilities.',
        authorName: 'Community Organizer',
        authorEmail: 'community@example.com',
        authorBio: 'Long-time community organizer and inclusivity advocate',
        articleCategory: 'Community',
        articleTags: 'inclusivity, community, organization',
        contactMethod: 'email',
        agreeToTerms: true
      }
    }
  ]

  // Test contact form submissions
  console.log('📝 Testing Contact Form Submissions...')
  for (const test of contactTests) {
    try {
      console.log(`\n🔄 Testing: ${test.name}`)
      const response = await fetch('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(test.data),
      })

      const result = await response.json()
      
      if (response.ok) {
        console.log(`✅ ${test.name} - SUCCESS`)
        console.log(`   ID: ${result.submissionId}`)
      } else {
        console.log(`❌ ${test.name} - FAILED`)
        console.log(`   Error: ${result.error}`)
      }
    } catch (error) {
      console.error(`❌ ${test.name} - ERROR:`, error)
    }
  }

  // Test article submissions
  console.log('\n📝 Testing Article Submissions...')
  for (const test of articleTests) {
    try {
      console.log(`\n🔄 Testing: ${test.name}`)
      const response = await fetch('http://localhost:3000/api/education/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(test.data),
      })

      const result = await response.json()
      
      if (response.ok) {
        console.log(`✅ ${test.name} - SUCCESS`)
        console.log(`   ID: ${result.submissionId}`)
      } else {
        console.log(`❌ ${test.name} - FAILED`)
        console.log(`   Error: ${result.error}`)
      }
    } catch (error) {
      console.error(`❌ ${test.name} - ERROR:`, error)
    }
  }

  console.log('\n🎯 Testing Complete!')
  console.log('\n📋 Next Steps:')
  console.log('1. Go to http://localhost:3000/admin/review-submissions')
  console.log('2. Check that all submissions appear (4 contact + 3 articles)')
  console.log('3. Test filtering between Articles and Contact Forms')
  console.log('4. Test "Mark Responded" on contact forms')
  console.log('5. Test "Approve" on articles')
  console.log('6. Test "Reject" on both types')
  console.log('7. Verify status changes and history tracking')
}

// Run the test
testAllSubmissions()
