import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
	const { deployer } = await hre.getNamedAccounts()

	await hre.deployments.deploy("SecureLiquidDigitalChipMock", {
		from: deployer,
		args: ["http://example.com/"],
		log: true,
	})
}

export default func
func.tags = ["sld-chip-mock"]
