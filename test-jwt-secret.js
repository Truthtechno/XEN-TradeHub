const jwt = require('jsonwebtoken')

// Test JWT secret
const JWT_SECRET = "your-jwt-secret-here-development-only-very-long-and-secure-key"

console.log('🔐 Testing JWT Secret...')

try {
  // Test creating a token
  const payload = { id: 'test-user-id', role: 'STUDENT' }
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
  console.log('✅ JWT token created successfully')
  console.log('Token:', token.substring(0, 50) + '...')

  // Test verifying the token
  const decoded = jwt.verify(token, JWT_SECRET)
  console.log('✅ JWT token verified successfully')
  console.log('Decoded payload:', decoded)

  console.log('\n🎉 JWT Secret is working correctly!')
} catch (error) {
  console.error('❌ JWT Secret test failed:', error.message)
}
