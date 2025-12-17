const hre = require("hardhat");

async function main() {
    const [deployer, user1] = await hre.ethers.getSigners();
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const AccessPolicy = await hre.ethers.getContractFactory("AccessPolicy");
    const contract = AccessPolicy.attach(contractAddress);

    console.log(`Setting role USER for ${user1.address}...`);
    const tx = await contract.setUserRole(user1.address, "USER");
    await tx.wait();

    console.log("Role granted!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
