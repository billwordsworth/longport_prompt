const { HttpClient } = require("longport");

let http_cli = HttpClient.fromEnv();
http_cli
  .request("get", "/v1/trade/execution/today")
  .then((resp) => {
    console.log('Today\'s Trades:');
    console.log(JSON.stringify(resp, null, 2));
  })
  .catch(error => {
    console.error('Error:', error.message);
  });

