/**
 * ============================================================================
 * ENVIRONMENT VALIDATION
 * ============================================================================
 * Validates that all required environment variables are present.
 * Run this before build to catch missing configuration early.
 */

const requiredEnvVars = {
  // Clerk - Required for authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'Clerk publishable key (get from https://dashboard.clerk.com)',
  CLERK_SECRET_KEY: 'Clerk secret key (get from https://dashboard.clerk.com)',
  
  // Firebase - Required for database
  NEXT_PUBLIC_FIREBASE_API_KEY: 'Firebase API key',
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'Firebase auth domain',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'Firebase project ID',
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'Firebase storage bucket',
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: 'Firebase messaging sender ID',
  NEXT_PUBLIC_FIREBASE_APP_ID: 'Firebase app ID',
};

const optionalEnvVars = {
  // GitHub
  GITHUB_CLIENT_ID: 'GitHub OAuth client ID',
  GITHUB_CLIENT_SECRET: 'GitHub OAuth client secret',
  
  // Firebase Admin
  FIREBASE_PROJECT_ID: 'Firebase project ID for admin SDK',
  FIREBASE_CLIENT_EMAIL: 'Firebase service account email',
  FIREBASE_PRIVATE_KEY: 'Firebase service account private key',
  
  // AI Services
  GOOGLE_API_KEY: 'Google Gemini API key',
  
  // Email
  RESEND_API_KEY: 'Resend email API key',
  
  // Blockchain
  NEXT_PUBLIC_SEPOLIA_RPC_URL: 'Sepolia RPC URL',
  NEXT_PUBLIC_EQUITY_TOKEN_ADDRESS: 'Equity token contract address',
};

function validateEnvironment() {
  console.log('🔍 Validating environment variables...\n');
  
  const missing = [];
  const warnings = [];
  
  // Skip validation if explicitly disabled
  if (process.env.SKIP_ENV_VALIDATION === 'true') {
    console.log('⏭️  Skipping environment validation (SKIP_ENV_VALIDATION=true)\n');
    return;
  }
  
  // Auto-skip validation in Railway/CI environments unless explicitly enabled
  const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID;
  const isCI = process.env.CI === 'true';
  
  if ((isRailway || isCI) && process.env.REQUIRE_ENV_VALIDATION !== 'true') {
    console.log('⏭️  Skipping environment validation in CI/Railway build\n');
    console.log('💡 Environment variables will be validated at runtime\n');
    console.log('   To enforce validation in CI, set REQUIRE_ENV_VALIDATION=true\n');
    return;
  }
  
  // Check required variables
  for (const [key, description] of Object.entries(requiredEnvVars)) {
    if (!process.env[key]) {
      missing.push({ key, description });
    }
  }
  
  // Check optional variables
  for (const [key, description] of Object.entries(optionalEnvVars)) {
    if (!process.env[key]) {
      warnings.push({ key, description });
    }
  }
  
  // Report results
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:\n');
    missing.forEach(({ key, description }) => {
      console.error(`  ${key}`);
      console.error(`    → ${description}\n`);
    });
    
    console.error('\n📝 To fix this:');
    console.error('1. Copy .env.example to .env.local');
    console.error('2. Fill in the required values');
    console.error('3. Restart the development server\n');
    
    console.error('For production/Railway deployment:');
    console.error('Set these variables in Railway dashboard → Variables tab\n');
    
    console.error('To skip validation (not recommended):');
    console.error('Set SKIP_ENV_VALIDATION=true\n');
    
    process.exit(1);
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️  Optional environment variables not set:\n');
    warnings.forEach(({ key, description }) => {
      console.warn(`  ${key}`);
      console.warn(`    → ${description}`);
    });
    console.warn('\n  Some features may not work without these variables.\n');
  }
  
  console.log('✅ All required environment variables are present!\n');
  
  // Additional validation for format
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (clerkKey && !clerkKey.startsWith('pk_')) {
    console.error('❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY should start with "pk_"');
    process.exit(1);
  }
  
  const clerkSecret = process.env.CLERK_SECRET_KEY;
  if (clerkSecret && !clerkSecret.startsWith('sk_')) {
    console.error('❌ CLERK_SECRET_KEY should start with "sk_"');
    process.exit(1);
  }
}

// Run validation
validateEnvironment();
