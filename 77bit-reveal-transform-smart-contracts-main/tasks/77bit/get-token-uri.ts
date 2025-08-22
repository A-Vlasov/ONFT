import { task } from "hardhat/config"
import { getDeployedContractAddress } from "../utils/utils"

/**
 Example:
 hh 77bit:get-token-uri --id 1 --network sepolia
 */
task("77bit:get-token-uri", "Get uri for token")
	.addParam<string>("id", "id of token")
	.setAction(async (taskArgs, hre) => {
		const contractAddress = await getDeployedContractAddress({ hre, name: "SevenSevenBit" })
		const contract = await hre.ethers.getContractAt("SevenSevenBit", contractAddress)
		const uri = await contract.tokenURI(taskArgs.id)
		console.log(`Ragnarok URI for tokenId=${taskArgs.id} is`, uri)
	})
