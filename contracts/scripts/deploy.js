const hre = require("hardhat");

async function main() {
    const AccessRegistry = await hre.ethers.getContractFactory("AccessRegistry");
    const accessRegistry = await AccessRegistry.deploy();

    await accessRegistry.waitForDeployment();

    console.log(
        `AccessRegistry deployed to ${accessRegistry.target}`
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
