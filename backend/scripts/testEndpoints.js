const http = require('http');
const app = require('../src/app');
const connectDB = require('../src/db/connection');
const Dish = require('../src/models/Dish');
const mongoose = require('mongoose');

function request(server, method, path, body = null) {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = rawData ? JSON.parse(rawData) : null;
            resolve({ statusCode: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ statusCode: res.statusCode, raw: rawData });
          }
        });
      }
    );

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== Starting Backend Endpoint Tests ===');
  await connectDB();
  const server = app.listen(0); // Random free port

  try {
    // 1. GET /dishes
    console.log('\n[TEST 1] GET /dishes');
    const resAll = await request(server, 'GET', '/dishes');
    console.log(`Status: ${resAll.statusCode}`);
    if (resAll.statusCode === 200 && Array.isArray(resAll.data.dishes)) {
      console.log(`PASS: Found ${resAll.data.dishes.length} dishes`);
    } else {
      throw new Error(`FAIL: GET /dishes returned ${resAll.statusCode}`);
    }

    const testDish = resAll.data.dishes.find(d => d.dishId === '1') || resAll.data.dishes[0];
    const targetId = testDish.dishId;
    const initialVersion = testDish.version;
    console.log(`Using dish ${targetId} (${testDish.dishName}, Current Version: ${initialVersion})`);

    // 2. PATCH with matching expectedVersion -> Success 200
    console.log(`\n[TEST 2] PATCH /dishes/${targetId} with matching expectedVersion`);
    const updateRes = await request(server, 'PATCH', `/dishes/${targetId}`, {
      dishName: `${testDish.dishName} (Special)`,
      isPublished: true,
      expectedVersion: initialVersion
    });
    console.log(`Status: ${updateRes.statusCode}`);
    if (updateRes.statusCode === 200 && updateRes.data.dish.version === initialVersion + 1) {
      console.log(`PASS: Dish updated and version incremented to ${updateRes.data.dish.version}`);
    } else {
      throw new Error(`FAIL: PATCH failed: ${JSON.stringify(updateRes.data)}`);
    }

    // 3. PATCH with stale expectedVersion -> 409 Conflict
    console.log(`\n[TEST 3] PATCH /dishes/${targetId} with stale expectedVersion`);
    const conflictRes = await request(server, 'PATCH', `/dishes/${targetId}`, {
      dishName: 'Stale Edit',
      isPublished: true,
      expectedVersion: initialVersion // Stale version!
    });
    console.log(`Status: ${conflictRes.statusCode}`);
    if (conflictRes.statusCode === 409 && conflictRes.data.currentVersion === initialVersion + 1) {
      console.log(`PASS: Properly returned 409 Conflict with currentVersion: ${conflictRes.data.currentVersion}`);
    } else {
      throw new Error(`FAIL: Conflict test failed: ${JSON.stringify(conflictRes.data)}`);
    }

    // 4. PATCH non-existent dish -> 404 Not Found
    console.log('\n[TEST 4] PATCH /dishes/non-existent-dish');
    const notFoundRes = await request(server, 'PATCH', '/dishes/dish-99999', {
      dishName: 'Ghost Dish',
      isPublished: false,
      expectedVersion: 1
    });
    console.log(`Status: ${notFoundRes.statusCode}`);
    if (notFoundRes.statusCode === 404) {
      console.log('PASS: Correctly returned 404 Not Found');
    } else {
      throw new Error(`FAIL: Expected 404, got ${notFoundRes.statusCode}`);
    }

    // 5. PATCH published with empty trimmed name -> 400 Bad Request
    console.log(`\n[TEST 5] PATCH published dish with empty trimmed name`);
    const emptyNameRes = await request(server, 'PATCH', `/dishes/${targetId}`, {
      dishName: '   ',
      isPublished: true,
      expectedVersion: initialVersion + 1
    });
    console.log(`Status: ${emptyNameRes.statusCode}`);
    if (emptyNameRes.statusCode === 400) {
      console.log('PASS: Rejected empty trimmed name when publishing (400)');
    } else {
      throw new Error(`FAIL: Expected 400, got ${emptyNameRes.statusCode}`);
    }

    // 6. Test invalid image URL case
    console.log('\n[TEST 6] Testing invalid image URL case when isPublished: true');
    // Temporarily create a test item with invalid image URL
    await Dish.updateOne(
      { dishId: 'test-invalid-img' },
      {
        $set: {
          dishId: 'test-invalid-img',
          dishName: 'Test Invalid Dish',
          imageUrl: 'invalid-url-schema',
          isPublished: false,
          version: 1
        }
      },
      { upsert: true }
    );

    const invalidUrlRes = await request(server, 'PATCH', '/dishes/test-invalid-img', {
      dishName: 'Test Invalid Dish',
      isPublished: true,
      expectedVersion: 1
    });
    console.log(`Status: ${invalidUrlRes.statusCode}`);
    if (invalidUrlRes.statusCode === 400) {
      console.log(`PASS: Rejected publishing with invalid image URL (400): ${invalidUrlRes.data.error}`);
    } else {
      throw new Error(`FAIL: Expected 400 for invalid image URL, got ${invalidUrlRes.statusCode}`);
    }

    // Cleanup test item
    await Dish.deleteOne({ dishId: 'test-invalid-img' });

    // 7. PATCH with invalid payload types -> 400 Bad Request
    console.log(`\n[TEST 7] PATCH with invalid expectedVersion (string instead of integer)`);
    const badTypeRes = await request(server, 'PATCH', `/dishes/${targetId}`, {
      dishName: 'Valid Name',
      isPublished: true,
      expectedVersion: "one"
    });
    console.log(`Status: ${badTypeRes.statusCode}`);
    if (badTypeRes.statusCode === 400) {
      console.log('PASS: Rejected bad field type (400)');
    } else {
      throw new Error(`FAIL: Expected 400, got ${badTypeRes.statusCode}`);
    }

    console.log('\n=== ALL TESTS PASSED SUCCESSFULLY! ===');
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
