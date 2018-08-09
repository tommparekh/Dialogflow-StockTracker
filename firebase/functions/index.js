// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const https = require('https');
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  function GetStockPrice(agent) {
      
      const type = agent.parameters.price_type;
      const name = agent.parameters.company_name;
      const stock_date = agent.parameters.date;
      
      const action = agent.action;
       
      console.log("*****************************************************************************************");
      
      if(action == "input.getStockPrice") {
          
          console.log("input.getStockPrice is called");
          console.log("fn_getStockPrice is started");
          
         var tickerMap = {
              "apple": "AAPL",
              "microsoft": "MSFT",
              "ibm": "IBM",
              "google": "GOOG",
              "facebook": "FB",
              "amazon": "AMZN"
            };
      
          var priceMap = {
            "opening": "open_price",
            "closing": "close_price",
            "maximum": "high_price",
            "high": "high_price",
            "low": "low_price",
            "minimum": "low_price"
          };
      
      var stockTicker = tickerMap[name.toLowerCase()];
      var priceTypeCode = priceMap[type.toLowerCase()];
      
      var pathString = "/historical_data?identifier=" + stockTicker + 
            "&item=" + priceTypeCode +
            "&start_date=" + stock_date +
            "&end_date=" + stock_date;
        
      
      var username = "8fbe51ae06bb99f9ea12359da2ac66b0";
      var password = "5b39377ca9dcaa55fa66efdf0338ffd7";
      
      var auth = "Basic " + new Buffer(username + ":" + password).toString('base64');
      
      
        console.log ('The Response is '  + request);
          console.log("fn_getStockPrice is completed");
          
	  return fetchStockPrice(pathString, auth, type, name, stock_date).then((output) => {
	        console.log("RESPONSE OUTPUT IS " + output);
	        agent.add(output);
	   //     response.json({ 'fulfillmentText': output });
	    }).catch(() => {
	        agent.add("Did not understand the action");
 //   response.json({ 'fulfillmentText': `I don't know the weather but I hope it's good!` });
  });
	    
	    
        
        
          
      } else {
          agent.add("Did not understand the action");
      }
  }
  
  
  function fetchStockPrice(pathString, auth, type, name, stock_date) {
	  
	  return new Promise((resolve, reject) => {
	  
		var request = https.get({
			host: "api.intrinio.com",
			path: pathString,
			headers: {
				"Authorization": auth
				}
			},	function(response) {
                	var json = "";
          			
					response.on('data', function(chunk) {
						json += chunk;
					});
          
					response.on('end', function(agent) {
              
						var jsonData = JSON.parse(json);
						var stockPrice = jsonData.data[0].value;
              
						console.log("The stock price received is: " + stockPrice);
              
						var chat = "The " + type + " price for " + name + " on " + stock_date + " was " + stockPrice;
                                                    
						console.log(chat);
           
                        resolve(chat);
					});
					
					 response.on('error', (error) => {
                        console.log(`Error calling the weather API: ${error}`)
                        reject();
                     });
           
				});
			});
        
  }
  
  
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
}


  // // Uncomment and edit to make your own intent handler
  // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function yourFunctionHandler(agent) {
  //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
  //   agent.add(new Card({
  //       title: `Title: this is a card title`,
  //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
  //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
  //       buttonText: 'This is a button',
  //       buttonUrl: 'https://assistant.google.com/'
  //     })
  //   );
  //   agent.add(new Suggestion(`Quick Reply`));
  //   agent.add(new Suggestion(`Suggestion`));
  //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
  // }

  // // Uncomment and edit to make your own Google Assistant intent handler
  // // uncomment `intentMap.set('your intent name here', googleAssistantHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function googleAssistantHandler(agent) {
  //   let conv = agent.conv(); // Get Actions on Google library conv instance
  //   conv.ask('Hello from the Actions on Google client library!') // Use Actions on Google library
  //   agent.add(conv); // Add Actions on Google library responses to your agent's response
  // }
  // // See https://github.com/dialogflow/dialogflow-fulfillment-nodejs/tree/master/samples/actions-on-google
  // // for a complete Dialogflow fulfillment library Actions on Google client library v2 integration sample

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('GetStockPrice', GetStockPrice);
  // intentMap.set('your intent name here', yourFunctionHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});
