'use strict';

const { Contract } = require('fabric-contract-api');


class DigitalTwin extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');

        const TDs =[{
            title: "My lamp",
            description: "Virtual lamp example Thing",
            "@context": ["https://www.w3.org/2019/wot/td/v1", { iot: "http://example.org/iot" }],
            properties: {
                status: {
                    type: "string",
                    description: "current value",
                    readOnly: true,
                },
            },
            actions: {
                toggle: {
                    description: "Switch on/off the lamp",
                    uriVariables: {
                        switch: { type: "int", enum: ["0", "1"]},
                    },
                },
            },
        }];

        for (let i = 0; i < TDs.length; i++) {
            TDs[i].docType = 'ThingDescription';
            await ctx.stub.putState('TD' + i, Buffer.from(JSON.stringify(TDs[i])));
            console.info('Added <--> ', TDs[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async getThingDescription(ctx) {
        const startKey = 'TD0';
        const endKey = 'TD999';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }
    
    async getActions(ctx, tdNumber) {
        const tdAsBytes = await ctx.stub.getState(tdNumber); 
        if (!tdAsBytes || tdAsBytes.length === 0) {
            throw new Error(`${tdNumber} does not exist`);
        }
        console.log(tdAsBytes.toString());
        const tdAsJSON = JSON.parse(tdAsBytes.toString());
        return tdAsJSON.actions;
    }

    async getAction(ctx, tdNumber, action) {
        const tdAsBytes = await ctx.stub.getState(tdNumber);
        if (!tdAsBytes || tdAsBytes.length === 0) {
            throw new Error(`${tdNumber} does not exist`);
        }
        console.log(tdAsBytes.toString());
        const tdAsJSON = JSON.parse(tdAsBytes.toString());
        return tdAsJSON.actions[action];
    }

    async getProperties(ctx, tdNumber) {
        const tdAsBytes = await ctx.stub.getState(tdNumber); 
        if (!tdAsBytes || tdAsBytes.length === 0) {
            throw new Error(`${tdNumber} does not exist`);
        }
        console.log(tdAsBytes.toString());
        const tdAsJSON = JSON.parse(tdAsBytes.toString());
        return tdAsJSON.properties;
    }

    async getProperty(ctx, tdNumber, property) {
        const tdAsBytes = await ctx.stub.getState(tdNumber);
        if (!tdAsBytes || tdAsBytes.length === 0) {
            throw new Error(`${tdNumber} does not exist`);
        }
        console.log(tdAsBytes.toString());
        const tdAsJSON = JSON.parse(tdAsBytes.toString());
        return tdAsJSON.properties[property];
    }

    async performActuation(ctx, tdNumber, action, parameters){
        const tdAsBytes = await ctx.stub.getState(tdNumber);
        if (!tdAsBytes || tdAsBytes.length === 0) {
            throw new Error(`${tdNumber} does not exist`);
        }
        console.log(tdAsBytes.toString());
        const tdAsJSON = JSON.parse(tdAsBytes.toString());
    
        if ((!(action in tdAsJSON.actions)) && (!(action in tdAsJSON.properties))) {
            console.log("Action does not exist!");
            return "Action does not exist";
        }
        else {
            if (tdAsJSON.actions[action]['uriVariables'] != null) {
                if (parameters.length != Object.keys(tdAsJSON.actions[action]['uriVariables']).length) {
                    console.log("The parameters are not valid!");
                    return "The parameters are not valid!";
                }
                else {
                    ctx.stub.setEvent('performActuation', Buffer.from(JSON.stringify(parameters)));
                    return {'action': action,'parameters': parameters};
                }
            }
        }
    }

    async addTD(ctx, tdNumber, td) {
        const temp = JSON.parse(td);
        await ctx.stub.putState(tdNumber, Buffer.from(JSON.stringify(temp)) )
    }

    async addAction(ctx, tdNumber, actionName, action) {
        const tdAsBytes = await ctx.stub.getState(tdNumber);
        if (!tdAsBytes || tdAsBytes.length === 0) {
            throw new Error(`${tdNumber} does not exist`);
        }
        console.log(tdAsBytes.toString());
        const tdAsJSON = JSON.parse(tdAsBytes.toString());
        const temp = JSON.parse(action);
        tdAsJSON['actions'][actionName] = temp;
        await ctx.stub.putState(tdNumber, Buffer.from(JSON.stringify(tdAsJSON)));
    }

    async addProperty(ctx, tdNumber, propertyName, property) {
        const tdAsBytes = await ctx.stub.getState(tdNumber);
        if (!tdAsBytes || tdAsBytes.length === 0) {
            throw new Error(`${tdNumber} does not exist`);
        }
        console.log(tdAsBytes.toString());
        const tdAsJSON = JSON.parse(tdAsBytes.toString());
        const temp = JSON.parse(property);
        tdAsJSON['properties'][propertyName] = temp;
        await ctx.stub.putState(tdNumber, Buffer.from(JSON.stringify(tdAsJSON)));
    }

}

module.exports = DigitalTwin;