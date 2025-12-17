const hre = require("hardhat");

async function main() {
    const AccessPolicy = await hre.ethers.getContractFactory("AccessPolicy");
    const accessPolicy = await AccessPolicy.deploy();

    await accessPolicy.waitForDeployment();

    console.log(`AccessPolicy deployed to ${await accessPolicy.getAddress()}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
