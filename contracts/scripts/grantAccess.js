const hre = require("hardhat");

async function main() {
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const AccessRegistry = await hre.ethers.getContractFactory("AccessRegistry");
    const accessRegistry = AccessRegistry.attach(contractAddress);

    // Grant access to Account #1
    const accounts = await hre.ethers.getSigners();
    const user = accounts[1].address;

    console.log(`Granting access to ${user}...`);
    const tx = await accessRegistry.grantAccess(user);
    await tx.wait();

    console.log("Access granted!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
