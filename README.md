# Smart Contract-Based Digital Twin (SCDT)

The "Experimentation: Smart Contract-based Digital Twins for the IoT" (SCDT) project assess the feasibility and evaluate the performance of a novel form of decentralized, transparent, auditable, interoperable, and secure digital twins for Internet of Things (IoT) devices.

This project leverages Hyperledger Fabric v2. For detailed release notes and additional information, you can visit the [Hyperledger Fabric release page](https://hyperledger-fabric.readthedocs.io/en/release-2.5/). 

**Clone the Repository:**

Clone the repository and navigate to the project folder
```bash
git clone https://github.com/mmlab-aueb/scdt.git
cd scdt
```
**Run the WoT gateway:**

To run the WoT gateway, navigate to the project folder and run the necessary files.
```bash
cd WoTgateway
node WoTgateway.js
```
In a new terminal, run the following commands to enable communication between the WoT gateway and the chaincode.
```bash
cd WoTgateway
node util.js
```
**Run the script:**

The deploy_chaincode.sh script packages, installs, approves and commits the chaincode definition to the channel.
To run the script, make sure you have the necessary permissions. You may need to make the script executable:
```bash
chmod +x deploy_chaincode.sh
```
Then, you can run it:
```bash
./deploy_chaincode.sh
```

**Deploy Chaincode:**

This script deploys the chaincode, deletes the wallet folder to allow authentication with new credentials and runs the client.
```bash
./deploy_chaincode.sh
```

**Run the client:**

If there are no changes made to the chaincode, you can manually delete the wallet folder and run the client with the following commands.

Navigate to the client folder and run the necessary files.
```bash
cd client
node enrollAdmin.js
node registerUser.js
node invoke.js
```

