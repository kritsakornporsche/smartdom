// Removed redundant fetch require

async function test() {
  const email = 'testowner@test.test';
  console.log(`Testing with email: ${email}`);

  try {
    // 1. Get Onboarding Status
    const obRes = await fetch(`http://localhost:3000/api/owner/onboarding?email=${email}`);
    const obData = await obRes.json();
    console.log('Onboarding Data:', JSON.stringify(obData, null, 2));

    if (obData.success && obData.hasDorm) {
      const dormId = obData.dorm.id;
      console.log(`Dorm ID found: ${dormId}`);

      // 2. Get Rooms
      const roomsRes = await fetch(`http://localhost:3000/api/rooms?dormId=${dormId}`);
      const roomsData = await roomsRes.json();
      console.log(`Rooms Status: ${roomsRes.status}`);
      console.log(`Room count for dorm ${dormId}: ${roomsData.data ? roomsData.data.length : 'N/A'}`);
      
      if (roomsData.data && roomsData.data.length > 0) {
        console.log('Sample Room:', JSON.stringify(roomsData.data[0], null, 2));
      }
    } else {
      console.log('User has no dorm or onboarding failed.');
    }
  } catch (err) {
    console.error('Fetch Error:', err.message);
  }
}

test();
