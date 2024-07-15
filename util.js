const { Servient } = require("@node-wot/core");
const { HttpClientFactory } = require("@node-wot/binding-http");
const fetch = require('node-fetch');


const servient = new Servient();
servient.addClientFactory(new HttpClientFactory(null));

servient.start().then(async (WoT) => {
    try {

        console.log(ctx, action, parameter)
        const tdUrl = "http://localhost:8080/mylamp";
        const tdResponse = await fetch(tdUrl); 

        if (!tdResponse.ok) {
            throw new Error(`Failed to fetch Thing Description, status ${tdResponse.status}`);
        }

        const td = await tdResponse.json(); 

        console.log("Fetched Thing Description:", td);


        // Consume the Thing Description
        const thing = await WoT.consume(td);
        console.log("Consumed Thing");
                
        // Observe the status property        
        thing.observeProperty("status", async (data) => {             
            console.log("status:", await data.value());        
        });         
                
        // Toggle the lamp to switch on/off
        await new Promise(resolve => setTimeout(resolve, 500));          
        await thing.invokeAction("toggle");             
                
            
            
    } catch (err) {
        console.error("Error:", err);
    }
});