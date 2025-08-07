const fs = require('fs');
const path = require('path');

// Load environment variables
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const cleanLine = trimmed.replace(/^\uFEFF/, '');
        const [key, ...valueParts] = cleanLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=');
          process.env[key] = value;
        }
      }
    });
  }
}

loadEnvFile();

async function testSubmissionProcess() {
  console.log('🧪 TESTING EDUCATION SUBMISSION PROCESS\n');

  try {
    // Test submission data
    const testSubmission = {
      authorName: 'Dr. Emily Rodriguez',
      authorEmail: 'emily.rodriguez@example.com',
      authorCredentials: 'Certified BDSM Educator & Safety Consultant',
      authorBio: 'Dr. Rodriguez has over 15 years of experience in BDSM education and safety training. She specializes in consent frameworks and risk-aware consensual kink (RACK) practices.',
      contactMethod: 'email',
      contactInfo: 'emily.rodriguez@example.com',
      articleTitle: 'Aftercare Essentials: Building Connection After Intense Scenes',
      articleCategory: 'Safety',
      articleExcerpt: 'Aftercare is a crucial component of responsible BDSM practice. This comprehensive guide covers the physical, emotional, and psychological aspects of proper aftercare.',
      articleContent: `# Aftercare Essentials: Building Connection After Intense Scenes

Aftercare is one of the most important aspects of responsible BDSM practice. It's not just about physical recovery—it's about emotional connection, psychological safety, and building trust between partners. Without proper aftercare, even the most consensual and well-planned scenes can leave participants feeling disconnected, vulnerable, or emotionally drained.

## What is Aftercare?

Aftercare refers to the care and attention given to partners after a BDSM scene or intense sexual activity. It's designed to help both partners transition from the heightened emotional and physical state of the scene back to their normal baseline. This transition period is crucial for maintaining healthy relationships and ensuring that BDSM remains a positive experience for everyone involved.

## Physical Aftercare

Always have water available during and after scenes. Consider light snacks to restore blood sugar, and avoid alcohol immediately after intense scenes. Many people experience temperature drops after scenes, so have blankets, warm clothing, or heating pads available. Check for any marks, bruises, or injuries and clean any broken skin with appropriate antiseptics.

Physical aftercare also includes monitoring vital signs, especially after intense scenes. Some people may experience drops in blood pressure or blood sugar levels. Having basic first aid supplies and knowing how to use them is essential for responsible BDSM practice.

## Emotional Aftercare

Provide verbal reassurance that both partners are safe and cared for. Offer physical affection appropriate to your relationship and acknowledge the scene's intensity and impact. Discuss what worked well in the scene, address any concerns or unexpected reactions, and plan for future scenes based on current experience.

Allow time for both partners to process their emotions. Some people need quiet time, others need to talk. Respect different processing styles and be patient with each other's needs. Remember that emotional aftercare isn't just for the submissive partner—dominants also need reassurance and care after intense scenes.

## Psychological Aftercare

Sub drop can occur hours or days after a scene. Maintain communication and check-ins, and be prepared to provide additional support. Tops can also experience emotional drops, so don't assume the dominant partner doesn't need care. Mutual aftercare is often beneficial and can strengthen your relationship.

Psychological aftercare also includes debriefing sessions where partners can discuss what worked, what didn't, and how to improve future scenes. This open communication helps build trust and ensures that both partners feel heard and valued.

## Creating Your Aftercare Plan

Talk about aftercare needs before the scene. Establish clear expectations and boundaries, and plan for different possible outcomes. Include water and light snacks, comfortable clothing and blankets, first aid supplies, and comfort items in your aftercare kit.

Have trusted friends or community members available. Know when to seek professional help and maintain a support network. If you experience persistent negative emotions after scenes, difficulty returning to baseline, relationship conflicts related to BDSM, or physical injuries that don't heal properly, consider seeking professional help.

## Conclusion

Aftercare is not optional—it's essential for responsible BDSM practice. By prioritizing aftercare, you're building trust, strengthening your relationship, and ensuring that BDSM remains a positive and enriching part of your life. Good aftercare leads to better scenes, stronger relationships, and a healthier BDSM practice overall.`,
      articleTags: 'aftercare, safety, emotional health, BDSM basics, relationship building',
      agreeToTerms: true
    };

    console.log('📝 Step 1: Submitting test article...');
    
    // Submit the article
    const response = await fetch('http://localhost:3001/api/education/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testSubmission)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Submission successful!');
      console.log(`📋 Submission ID: ${result.id}`);
      console.log(`📄 Article: ${testSubmission.articleTitle}`);
      console.log(`👤 Author: ${testSubmission.authorName}`);
      console.log(`📊 Word Count: ${testSubmission.articleContent.split(' ').length}`);
      
      console.log('\n🔗 Next Steps:');
      console.log('1. Visit: http://localhost:3001/admin/review-submissions');
      console.log('2. Find the submission: "Aftercare Essentials: Building Connection After Intense Scenes"');
      console.log('3. Click "Review" to see the full submission');
      console.log('4. Click "Approve" to publish the article');
      console.log('5. Visit: http://localhost:3001/education to see the published article');
      
      console.log('\n📚 Test URLs:');
      console.log('• Submit Page: http://localhost:3001/education/submit');
      console.log('• Admin Review: http://localhost:3001/admin/review-submissions');
      console.log('• Education Page: http://localhost:3001/education');
      
    } else {
      console.log('❌ Submission failed:', result.error);
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('\n💡 Make sure your development server is running: npm run dev');
  }
}

testSubmissionProcess();
