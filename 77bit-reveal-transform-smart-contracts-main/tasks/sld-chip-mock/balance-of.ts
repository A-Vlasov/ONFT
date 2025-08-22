import { task } from "hardhat/config"
import { getDefaultAccountIfEmpty, getDeployedContractAddress } from "../utils/utils"

/**
 Example:
 hh sld-chip-mock:balance-of --token-id 1 --network sepolia
 */
task("sld-chip-mock:balance-of", "Get balance")
	.addParam<string>("address", "address", undefined, undefined, true)
	.addParam<number>("tokenId", "Token Id")
	.setAction(async (taskArgs, hre) => {
		const address = await getDefaultAccountIfEmpty({ hre, account: taskArgs.address, argName: "address" })
		const tokenId = taskArgs.tokenId
		const contractAddress = await getDeployedContractAddress({ hre, name: "SecureLiquidDigitalChipMock" })
		const contract = await hre.ethers.getContractAt("SecureLiquidDigitalChipMock", contractAddress)
		const value = await contract.balanceOf(address, tokenId)
		console.log(`Balance of tokenId=${tokenId} on account=${address} is`, value)
	})
