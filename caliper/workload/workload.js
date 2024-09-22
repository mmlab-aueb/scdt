'use strict';

const { WorkloadModuleInterface } = require('@hyperledger/caliper-core');

class MyWorkload extends WorkloadModuleInterface {
    constructor() {
        super();
    	this.txIndex = -1;
        //this.workerIndex = -1;
        //this.totalWorkers = -1;
        //this.roundIndex = -1;
        //this.roundArguments = undefined;
        //this.sutAdapter = undefined;
        //this.sutContext = undefined;
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        this.workerIndex = workerIndex;
        this.totalWorkers = totalWorkers;
        this.roundIndex = roundIndex;
        this.roundArguments = roundArguments;
        this.sutAdapter = sutAdapter;
        this.sutContext = sutContext;
        console.info('Worker ${workerIndex} is initialized with roundIndex: ${roundIndex}');
    }

    async submitTransaction() {
    	this.txIndex++;
        // Set parameters for the performActuation function
        const contractFunction = 'performActuation';
        const tdNumber = 'TD0'; // Specify the Thing Description ID you want to act on
        const action = 'toggle'; // Specify the action you want to perform
	const parameters = '1'; // Example parameters for the action (you may adjust this based on your contract)

	const request = {
	    contractId: 'dt', // The smart contract ID
	    contractFunction: 'performActuation', // Version of the contract
	    invokerIdentity: 'admin1',
	    contractArguments: [tdNumber, action, parameters], // Arguments for the function
	    readOnly: false // Indicate this is an invoke (not a query)
	};
	
	let invoke_imeout = 120*10000;
	/*if (this.roundIndex > 0){
	    console
	    invoke_imeout = 10000;
	}*/

	console.info(this.txIndex);
        // Use sendRequests to invoke the smart contract
        await this.sutAdapter.sendRequests(request);
        await new Promise(resolve => setTimeout(resolve, invoke_imeout));
        //return ret;
    }


    async cleanupWorkloadModule() {
        // NOOP
    }
}

function createWorkloadModule() {
    return new MyWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;


