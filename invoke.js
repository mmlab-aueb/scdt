'use strict';

const path = require('path');
const os = require('os');
const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');


async function main() {
    try {
        // Load the network configuration
        const ccpPath = path.resolve(os.homedir(), 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system-based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUser');
        console.log("cred");
        console.log(identity.credentials);

        
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        const gateway = new Gateway();

        try {
            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });
            console.log('Gateway connected:', gateway);

            // Get the network (channel) our contract is deployed to.
            const network = await gateway.getNetwork('mychannel');

            // Get the contract from the network.
            const contract = network.getContract('dt');

            contract.addContractListener(async (event) => {
                console.log(event.eventName, event.payload.toString("utf-8"));
            })
            
            // Initialize the ledger
            await contract.submitTransaction('initLedger');         
            console.log('Ledger has been initialized');

            // Toggle the lamp status (assuming 0 is off and 1 is on)
            const result = await contract.submitTransaction('performActuation', 'TD0', 'toggle', '1');
            console.log(`Transaction has been submitted, result is: ${result.toString()}`);

            await new Promise(resolve => setTimeout(resolve, 10000));

            // Disconnect from the gateway.
            await gateway.disconnect();
        } catch (error) {
            console.error('Failed to connect gateway:', error);
        }
            

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();