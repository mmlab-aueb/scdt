const Servient = require("@node-wot/core").Servient;
const HttpServer = require("@node-wot/binding-http").HttpServer;

const servient = new Servient();
servient.addServer(new HttpServer());

servient.start().then(async (WoT) => {
    let status = 0; // initial status of the lamp: 0 (off)

    const thing = await WoT.produce({
        "@context": "https://www.w3.org/2022/wot/td/v1.1",
        title: "MyLamp",
        description: "A virtual lamp that can be switched on or off",
        properties: {
            status: {
                type: "integer",
                description: "Current status of the lamp: 0 (off) or 1 (on)",
                readOnly: true,
                observable: true 
            }
        },
        actions: {
            toggle: {
                description: "Switch the lamp on or off",
                input: { type: "integer", enum: [0, 1] }
            }
        }
    });


    thing.setPropertyReadHandler("status", () => { return status; });

    thing.setActionHandler("toggle", () => { 
        console.log("Status of lamp before toggle operation: ",status);
        status = status === 0 ? 1 : 0;
        console.log("Status of lamp after toggle operation: ",status);
        thing.emitPropertyChange("status"); 
    });

    await thing.expose();
    console.log("Thing exposed successfully");
});
