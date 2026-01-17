import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/v1';

async function testIntegration() {
  console.log('🧪 Starting Integration Tests...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣  Testing Health Check...');
    const healthResponse = await axios.get('http://localhost:3000/health');
    console.log('✅ Health Check:', healthResponse.data);
    console.log('');

    // Test 2: Create Activity
    console.log('2️⃣  Testing Create Activity...');
    const createResponse = await axios.post(`${BASE_URL}/activities`, {
      userId: 'test-user-001',
      activityType: 'LOGIN',
      metadata: { device: 'desktop', browser: 'Chrome' },
      sessionId: 'session-test-001',
    });
    console.log('✅ Created Activity:', createResponse.data);
    console.log('');

    // Test 3: Get Activities
    console.log('3️⃣  Testing Get Activities...');
    const getResponse = await axios.get(`${BASE_URL}/activities?page=1&limit=5`);
    console.log('✅ Retrieved Activities:', {
      count: getResponse.data.data.length,
      pagination: getResponse.data.pagination,
    });
    console.log('');

    // Test 4: Get Activity Stats
    console.log('4️⃣  Testing Get Activity Stats...');
    const statsResponse = await axios.get(`${BASE_URL}/activities/stats/test-user-001`);
    console.log('✅ Activity Stats:', statsResponse.data.data);
    console.log('');

    console.log('🎉 All Integration Tests Passed!');
  } catch (error: any) {
    console.error('❌ Test Failed:', error.response?.data || error.message);
  }
}

testIntegration();