import { task } from "hardhat/config"
import { getDeployedContractAddress } from "../utils/utils"

/**
 Example:
 hh 77bit:upgrade --network sepolia
 */
task("77bit:upgrade", "Upgrade 77bit contract implementation behind proxy")
	.addParam<string>("owner", "owner of the contract", undefined, undefined, true)
	.setAction(async (taskArgs, hre) => {
		const contractAddress = await getDeployedContractAddress({ hre, name: "SevenSevenBit" })
		const SevenSevenBit = await hre.ethers.getContractAt("SevenSevenBit", contractAddress)
		const SevenSevenBitV2 = await hre.ethers.getContractFactory("SevenSevenBit")
		const sevenSevenBit = await hre.upgrades.upgradeProxy(SevenSevenBit, SevenSevenBitV2)
		await sevenSevenBit.waitForDeployment()
		console.log("SevenSevenBit upgraded at address", await sevenSevenBit.getAddress())
		await hre.deployments.save("SevenSevenBit", {
			address: await sevenSevenBit.getAddress(),
			abi: sevenSevenBit.interface.format(),
		})
		console.log("SevenSevenBit saved to deployments")
	})
