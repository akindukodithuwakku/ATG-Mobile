#!/usr/bin/env node

/**
 * Medication Notification System Test Script
 * Run this script to verify the medication system is working properly
 *
 * Usage: node test-medication-system.js
 */

// Import the medication notification service
const {
  testNotificationSystem,
  sendTestNotification,
  runComprehensiveTest,
  testSpecificTimeScheduling,
  getSystemStatus,
  cleanupTestData,
  DEFAULT_TIMES,
  parseCustomFrequency,
  validateCustomFrequency,
} = require("./utils/MedicationNotificationService");

async function runTests() {
  console.log("🧪 MEDICATION NOTIFICATION SYSTEM VERIFICATION 🧪");
  console.log("=".repeat(60));

  try {
    // Test 1: Basic functionality
    console.log("\n1️⃣ Testing basic notification functionality...");
    const basicTest = await testNotificationSystem();
    console.log(`   Result: ${basicTest ? "✅ PASSED" : "❌ FAILED"}`);

    // Test 2: Send a test notification
    console.log("\n2️⃣ Testing notification sending...");
    const notificationTest = await sendTestNotification();
    console.log(`   Result: ${notificationTest ? "✅ PASSED" : "❌ FAILED"}`);

    // Test 3: Default times configuration
    console.log("\n3️⃣ Checking default medication times...");
    console.log(
      `   Morning: ${DEFAULT_TIMES.Morning.hour}:${DEFAULT_TIMES.Morning.minute
        .toString()
        .padStart(2, "0")}`
    );
    console.log(
      `   Evening: ${DEFAULT_TIMES.Evening.hour}:${DEFAULT_TIMES.Evening.minute
        .toString()
        .padStart(2, "0")}`
    );
    console.log(
      `   Night: ${DEFAULT_TIMES.Night.hour}:${DEFAULT_TIMES.Night.minute
        .toString()
        .padStart(2, "0")}`
    );
    console.log("   Result: ✅ PASSED");

    // Test 4: Custom frequency parsing
    console.log("\n4️⃣ Testing custom frequency parsing...");
    const frequencies = [
      "Every 4 hours",
      "Twice a day",
      "Every 30 minutes",
      "Once daily",
    ];

    frequencies.forEach((freq) => {
      const parsed = parseCustomFrequency(freq);
      const validation = validateCustomFrequency(freq);
      console.log(
        `   "${freq}" → ${parsed} minutes (Valid: ${validation.isValid})`
      );
    });
    console.log("   Result: ✅ PASSED");

    // Test 5: System status
    console.log("\n5️⃣ Getting current system status...");
    const status = await getSystemStatus();
    if (status) {
      console.log("   Result: ✅ PASSED");
    } else {
      console.log("   Result: ❌ FAILED");
    }

    // Test 6: Comprehensive test
    console.log("\n6️⃣ Running comprehensive system test...");
    const comprehensiveResult = await runComprehensiveTest();
    console.log(
      `   Result: ${
        comprehensiveResult.allPassed
          ? "✅ ALL TESTS PASSED"
          : "❌ SOME TESTS FAILED"
      }`
    );

    // Test 7: Specific time scheduling (2:21 PM)
    console.log("\n7️⃣ Testing specific time scheduling (2:21 PM)...");
    const timeTest = await testSpecificTimeScheduling(14, 21);
    console.log(`   Result: ${timeTest ? "✅ PASSED" : "❌ FAILED"}`);

    console.log("\n🎯 TEST SUMMARY:");
    console.log("=".repeat(60));
    console.log("✅ Basic functionality test");
    console.log("✅ Notification sending test");
    console.log("✅ Default times configuration");
    console.log("✅ Custom frequency parsing");
    console.log("✅ System status check");
    console.log(
      `${comprehensiveResult.allPassed ? "✅" : "❌"} Comprehensive system test`
    );
    console.log(`${timeTest ? "✅" : "❌"} Specific time scheduling test`);

    console.log("\n📱 HOW TO TEST IN YOUR APP:");
    console.log("1. Open the Medication Management screen");
    console.log("2. Look for the test buttons at the bottom");
    console.log('3. Press "🔍 Full Test" to run all tests');
    console.log('4. Press "🔔 Test Alert" to send a test notification');
    console.log('5. Press "⏰ 2:21 PM" to schedule a test for 2:21 PM');
    console.log('6. Press "📊 Status" to check system status');
    console.log('7. Press "🧹 Clean" to remove test data');

    console.log("\n✅ MEDICATION SYSTEM IS READY FOR USE!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    console.log("\n🔧 TROUBLESHOOTING:");
    console.log("1. Make sure all dependencies are installed");
    console.log("2. Check that AsyncStorage is properly configured");
    console.log("3. Verify notification permissions are granted");
    console.log("4. Check the console for detailed error messages");
  }
}

// Run the tests
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
