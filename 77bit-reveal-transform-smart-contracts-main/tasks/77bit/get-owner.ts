import { task } from "hardhat/config"
import { getDeployedContractAddress } from "../utils/utils"

/**
 Example:
 hh 77bit:get-owner \
 --uri https://ipfs.io/ipfs/new-base-uri-ipfs-hash/{id} \
 --network sepolia
 */
task("77bit:get-owner", "Get owner").setAction(async (taskArgs, hre) => {
	const contractAddress = await getDeployedContractAddress({ hre, name: "SevenSevenBit" })
	const contract = await hre.ethers.getContractAt("SevenSevenBit", contractAddress)
	const owner = await contract.owner()
	console.log(`Owner is ${owner}`)
})
