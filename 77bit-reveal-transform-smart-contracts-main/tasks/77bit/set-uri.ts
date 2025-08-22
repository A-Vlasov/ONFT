import { task } from "hardhat/config"
import { getDeployedContractAddress } from "../utils/utils"

/**
 Example:
 hh 77bit:set-uri \
 --uri https://ipfs.io/ipfs/new-base-uri-ipfs-hash/{id} \
 --network sepolia
 */
task("77bit:set-uri", "Set new base token URI")
	.addParam<string>("uri", "New Base URI")
	.setAction(async (taskArgs, hre) => {
		const contractAddress = await getDeployedContractAddress({ hre, name: "SevenSevenBit" })
		const contract = await hre.ethers.getContractAt("SevenSevenBit", contractAddress)

		// doesn't work currently: ProviderError: execution reverted
		const trx = await contract.setBaseTokenURI(taskArgs.uri)

		console.log(`Transaction Hash: ${trx.hash}`)
		await trx.wait(1)
		console.log("Transaction confirmed")
	})
