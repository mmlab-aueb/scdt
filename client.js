const { Servient } = require("@node-wot/core");
const { HttpClientFactory } = require("@node-wot/binding-http");
const fetch = require('node-fetch');

const servient = new Servient();
servient.addClientFactory(new HttpClientFactory(null));

servient.start().then(async (WoT) => {
    try {

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

        // turn on the lights
        thing.observeProperty("status", async (data) => { console.log("status:", await data.value()); });
        for (let i = 0; i < 3; i++) {
            await thing.invokeAction("toggle");
        }
        
    } catch (err) {
        console.error("Error:", err);
    }
});