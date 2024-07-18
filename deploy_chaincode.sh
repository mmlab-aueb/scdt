#!/bin/bash

set -e

# Navigate to the test network directory and bring the test network down 
cd ../fabric-samples/test-network
./network.sh down

# Bring the network up and create a channel with certificate authority
./network.sh up createChannel -c mychannel -ca

# Navigate to the smart contract directory and install dependencies
cd ../../scdt
npm install

# Navigate back to the test network directory
cd ../fabric-samples/test-network

# Set environment variables
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/

# Print peer version
peer version

# Package the chaincode
peer lifecycle chaincode package dt.tar.gz --path ../../scdt/ --lang node --label dt

# Set environment variables for Org1
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID=Org1MSP
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

# Install the chaincode on Org1 peer
peer lifecycle chaincode install dt.tar.gz

# Set environment variables for Org2
export CORE_PEER_LOCALMSPID=Org2MSP
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051

# Install the chaincode on Org2 peer
peer lifecycle chaincode install dt.tar.gz

# Query installed chaincodes to get the package ID
PACKAGE_ID=$(peer lifecycle chaincode queryinstalled | grep dt | awk -F "Package ID: " '{print $2}' | awk -F "," '{print $1}')
echo "Package ID is $PACKAGE_ID"

# Approve the chaincode definition for Org2
peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name dt --version 1.0 --package-id $PACKAGE_ID --sequence 1 --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"

# Set environment variables back to Org1
export CORE_PEER_LOCALMSPID=Org1MSP
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_ADDRESS=localhost:7051

# Approve the chaincode definition for Org1
peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name dt --version 1.0 --package-id $PACKAGE_ID --sequence 1 --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"

# Check commit readiness
peer lifecycle chaincode checkcommitreadiness --channelID mychannel --name dt --version 1.0 --sequence 1 --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" --output json

# Commit the chaincode definition
peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name dt --version 1.0 --sequence 1 --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt"

# Query committed chaincode
peer lifecycle chaincode querycommitted --channelID mychannel --name dt

# Delete the wallet folder 
rm -rf $(dirname "$PWD")/../scdt/client/wallet

# Navigate to the client directory
cd $(dirname "$PWD")/../scdt/client

# Run the specified Node.js scripts
node enrollAdmin.js
node registerUser.js
node invoke.js