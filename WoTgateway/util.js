const http = require('http');
const { Servient } = require("@node-wot/core");
const { HttpClientFactory } = require("@node-wot/binding-http");
const fetch = require('node-fetch');
var counter = 0;

var server = http.createServer(async function(request, response) {
    if (request.method === 'POST') {
        let body = '';

        request.on('data', chunk => {
            body += chunk.toString();
        });

        request.on('end', async () => {
            console.log('Received parameters:', body);
            
            
            const params = JSON.parse(body);
            let par = params.parameters;
            let action = params.action;
            console.log("params", par);
            console.log("action", action);

            try {
                console.log("Invoking Action ", action, " with parameter ", par);
                const servient = new Servient();
                servient.addClientFactory(new HttpClientFactory(null));

                const WoT = await servient.start();

                const tdUrl = "http://localhost:8080/mylamp";
                const tdResponse = await fetch(tdUrl); 

                if (!tdResponse.ok) {
                    throw new Error(`Failed to fetch Thing Description, status ${tdResponse.status}`);
                }

                const td = await tdResponse.json(); 
                console.log("Fetched Thing Description:", td);

                const thing = await WoT.consume(td);
                console.log("Consumed Thing");

                thing.observeProperty("status", async (data) => {             
                    console.log("status:", await data.value());        
                });         
                
                await new Promise(resolve => setTimeout(resolve, 500));          
                //await thing.invokeAction("toggle");  
                await thing.invokeAction(action);

            } catch (err) {
                console.error("Error:", err);
            }

            response.writeHead(200, {'Content-Type': 'text/plain'});
            response.write('Request processed with parameters: ' + body);

            counter = counter + 1;
            console.log(counter);

            response.end();
        });
    } else {
        response.writeHead(405, {'Content-Type': 'text/plain'});
        response.end('Method Not Allowed');
    }
});

const hostname = 'http://10.0.2.15';
server.listen(5000);