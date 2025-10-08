// Script to set up test data for Firebase
const { testDataGenerator } = require('./lib/setupTestData.ts');

async function setupTestData() {
  try {
    console.log('Setting up Firebase test data...');
    await testDataGenerator.setupTestData();
    console.log('✅ Test data setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up test data:', error);
    process.exit(1);
  }
}

setupTestData();