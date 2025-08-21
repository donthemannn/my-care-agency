// Test script for Alabama insurance quotes
// Run with: node test-quote.js

const testQuote = async () => {
  const testData = {
    zipCode: '35201', // Birmingham, AL
    dateOfBirth: '1985-06-15', // 39 years old
    gender: 'male',
    annualIncome: 50000,
    householdSize: 1,
    isCitizen: true,
    isTribalMember: false,
    employmentStatus: 'employed',
    hasCurrentCoverage: false,
    willClaimDependents: false,
    filingStatus: 'single',
    tobaccoUse: false,
    isPregnant: false,
    hasDisability: false
  };

  try {
    console.log('🚀 Testing Alabama Insurance Quote System...\n');
    console.log('Test Data:', {
      zipCode: testData.zipCode,
      age: '39 years old',
      income: `$${testData.annualIncome.toLocaleString()}`,
      householdSize: testData.householdSize
    });
    console.log('\n⏳ Generating quote...\n');

    const response = await fetch('http://localhost:3000/api/quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Quote Generated Successfully!\n');
      console.log(`📍 Location: ${result.data.county} County, Alabama`);
      console.log(`📊 Total Plans Found: ${result.data.totalPlans}`);
      console.log(`🏥 FIPS Code: ${result.data.fips}\n`);

      if (result.data.plans && result.data.plans.length > 0) {
        console.log('🏆 Top 3 Plans:\n');
        result.data.plans.slice(0, 3).forEach((plan, index) => {
          console.log(`${index + 1}. ${plan.planName}`);
          console.log(`   Issuer: ${plan.issuerName}`);
          console.log(`   Metal Level: ${plan.metalLevel}`);
          console.log(`   Monthly Premium: $${plan.monthlyPremium}`);
          if (plan.subsidyAmount > 0) {
            console.log(`   Subsidy: $${plan.subsidyAmount}/month`);
            console.log(`   Your Cost: $${plan.monthlyPremium - plan.subsidyAmount}/month`);
          }
          console.log(`   Deductible: $${plan.deductible}`);
          console.log(`   Out-of-Pocket Max: $${plan.outOfPocketMax}\n`);
        });
      }

      console.log('🎉 Test Completed Successfully!');
      console.log('\n📋 Next Steps:');
      console.log('1. Run "npm run dev" to start the development server');
      console.log('2. Visit http://localhost:3000 to see the full application');
      console.log('3. Test the complete quote form in the dashboard');

    } else {
      console.log('❌ Quote Generation Failed');
      console.log('Error:', result.error);
      if (result.details) {
        console.log('Details:', result.details);
      }
    }

  } catch (error) {
    console.log('❌ Test Failed');
    console.log('Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the development server is running (npm run dev)');
    console.log('2. Check your .env.local file has all required API keys');
    console.log('3. Verify your internet connection for API calls');
  }
};

// Run the test
testQuote();
