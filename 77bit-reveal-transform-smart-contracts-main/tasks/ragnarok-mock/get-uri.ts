import { task } from "hardhat/config"
import { getDeployedContractAddress } from "../utils/utils"

/**
 Example:
 hh ragnarok-mock:get-uri --id 1 --network sepolia
 */
task("ragnarok-mock:get-uri", "Get uri for token")
	.addParam<string>("id", "id of token")
	.setAction(async (taskArgs, hre) => {
		console.log("aaaaaaaaaa")
		const contractAddress = await getDeployedContractAddress({ hre, name: "RagnarokMock" })
		const contract = await hre.ethers.getContractAt("RagnarokMock", contractAddress)
		const uri = await contract.uri(taskArgs.id)
		console.log(`Ragnarok URI for tokenId=${taskArgs.id} is`, uri)
	})
