import { task } from "hardhat/config"
import { getDefaultAccountIfEmpty } from "../utils/utils"

/**
 Example:
 hh 77bit:deploy-with-proxy --uri http://example.com/ --network sepolia
 */
task("77bit:deploy-with-proxy", "Initial deploy 77bit contract")
	.addParam<string>("uri", "base uri for token")
	.addParam<string>("owner", "owner of the contract", undefined, undefined, true)
	.setAction(async (taskArgs, hre) => {
		const owner = await getDefaultAccountIfEmpty({ hre, account: taskArgs.owner, argName: "owner" })
		const SevenSevenBit = await hre.ethers.getContractFactory("SevenSevenBit")
		const sevenSevenBit = await hre.upgrades.deployProxy(SevenSevenBit, [owner, taskArgs.uri])
		await sevenSevenBit.waitForDeployment()
		console.log("SevenSevenBit deployed at address", await sevenSevenBit.getAddress())
		await hre.deployments.save("SevenSevenBit", {
			address: await sevenSevenBit.getAddress(),
			abi: sevenSevenBit.interface.format(),
		})
		console.log("SevenSevenBit saved to deployments")
	})
