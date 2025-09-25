// Quick setup script to check environment variables
console.log('Environment Variables Check:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Set' : '✗ Missing');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('\n❌ Missing environment variables!');
  console.log('\nPlease set them first:');
  console.log('Windows (PowerShell):');
  console.log('$env:NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"');
  console.log('$env:SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"');
  console.log('\nOr create a .env.local file in your project root with:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
  process.exit(1);
} else {
  console.log('\n✅ Environment variables are set! Ready to proceed.');
}
