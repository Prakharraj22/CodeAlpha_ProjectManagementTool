import http from 'http';

// Simple Integration Test Suite runner for TaskPulse API
async function runTests() {
  console.log('🧪 Starting TaskPulse Enterprise Automated Test Suite...\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.log(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  };

  try {
    // Test 1: Health check
    const healthRes = await fetch('http://localhost:5000/api/health');
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'ok', 'Health Check API returns status 200 OK');

    // Test 2: Demo Auth Login
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'prakhar@example.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && Boolean(loginData.token), 'Auth API issues valid JWT token for demo account');

    const token = loginData.token;

    // Test 3: Fetch projects
    const projectsRes = await fetch('http://localhost:5000/api/projects', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const projectsData = await projectsRes.json();
    assert(projectsRes.status === 200 && Array.isArray(projectsData.projects), 'Projects API returns authorized user workspace projects');

    console.log(`\n📊 Test Execution Summary: ${passed} Passed, ${failed} Failed`);
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test Execution Error:', err);
    process.exit(1);
  }
}

runTests();
