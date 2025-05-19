const { Config, TradeContext } = require('longport')

/**
 * LongPort Trading API Account Asset Example
 * 
 * Required Environment Variables:
 * - LONGPORT_APP_KEY: Your application key from the LongPort user center
 * - LONGPORT_APP_SECRET: Your application secret from the LongPort user center
 * - LONGPORT_ACCESS_TOKEN: Your access token from the LongPort user center
 * 
 * Set these using:
 * export LONGPORT_APP_KEY="your_app_key"
 * export LONGPORT_APP_SECRET="your_app_secret"
 * export LONGPORT_ACCESS_TOKEN="your_access_token"
 */

// Check if required environment variables are set
const requiredEnvVars = ['LONGPORT_APP_KEY', 'LONGPORT_APP_SECRET', 'LONGPORT_ACCESS_TOKEN'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Error: Missing required environment variables:');
  missingEnvVars.forEach(varName => {
    console.error(`  - ${varName}`);
  });
  console.error('\nPlease set them using:');
  missingEnvVars.forEach(varName => {
    console.error(`  export ${varName}="your_value_here"`);
  });
  process.exit(1);
}

// Try to initialize config from environment variables
let config;
try {
  config = Config.fromEnv();
  console.log('Successfully loaded configuration from environment variables.');
} catch (error) {
  console.error('Error loading configuration:', error.message);
  console.error('Please check your environment variables and try again.');
  process.exit(1);
}

// Alternative method to initialize config without environment variables:
// let config = new Config({ 
//   appKey: "YOUR_APP_KEY", 
//   appSecret: "YOUR_APP_SECRET", 
//   accessToken: "YOUR_ACCESS_TOKEN" 
// });

// Fetch account balance information
console.log('Fetching account balance information...');
TradeContext.new(config)
  .then((ctx) => {
    console.log('Successfully connected to LongPort API.');
    return ctx.accountBalance();
  })
  .then((resp) => {
    console.log('\n--- Account Balance Information ---');
    if (resp.length === 0) {
      console.log('No account balance information found.');
    } else {
      for (let obj of resp) {
        // First log the raw object as a string
        const objString = obj.toString();
        console.log(objString);
        
        // Extract information from the string representation
        console.log('\nKey Account Details:');
        
        // Extract key values using regex
        const extractValue = (key) => {
          const match = objString.match(new RegExp(`${key}: ([^,}]+)`));
          return match ? match[1] : 'N/A';
        };
        
        // Get currency (remove quotes)
        const currency = extractValue('currency').replace(/"/g, '');
        
        console.log(`Total Cash: ${extractValue('total_cash')} ${currency}`);
        console.log(`Net Assets: ${extractValue('net_assets')} ${currency}`);
        console.log(`Buy Power: ${extractValue('buy_power')} ${currency}`);
        console.log(`Risk Level: ${extractValue('risk_level')}`);
        console.log(`Max Finance Amount: ${extractValue('max_finance_amount')} ${currency}`);
        console.log(`Remaining Finance Amount: ${extractValue('remaining_finance_amount')} ${currency}`);
        
        // Extract cash info
        console.log('\nCash Information by Currency:');
        const cashInfoRegex = /CashInfo\s*{\s*withdraw_cash:\s*([^,]+),\s*available_cash:\s*([^,]+),\s*frozen_cash:\s*([^,]+),\s*settling_cash:\s*([^,]+),\s*currency:\s*"([^"]+)"\s*}/g;
        let cashMatch;
        let foundCashInfo = false;
        
        while ((cashMatch = cashInfoRegex.exec(objString)) !== null) {
          foundCashInfo = true;
          const [_, withdrawCash, availableCash, frozenCash, settlingCash, cashCurrency] = cashMatch;
          console.log(`  ${cashCurrency}: Available: ${availableCash}, Withdraw: ${withdrawCash}, Frozen: ${frozenCash}, Settling: ${settlingCash}`);
        }
        
        if (!foundCashInfo) {
          console.log('  No detailed cash information available');
        }
      }
    }
  })
  .catch((error) => {
    console.error('Error fetching account balance:', error.message);
    if (error.message.includes('authentication')) {
      console.error('Authentication failed. Please check your API credentials.');
    }
    process.exit(1);
  });