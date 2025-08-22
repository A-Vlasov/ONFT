import { task } from "hardhat/config"
import { getDeployedContractAddress } from "../utils/utils"

/**
 Example:
 hh ragnarok-mock:set-uri \
 --uri https://ipfs.io/ipfs/new-base-uri-ipfs-hash/{id} \
 --network sepolia
 */
task("ragnarok-mock:set-uri", "Set new base URI")
	.addParam<string>("uri", "New Base URI")
	.setAction(async (taskArgs, hre) => {
		const contractAddress = await getDeployedContractAddress({ hre, name: "RagnarokMock" })

		const contract = await hre.ethers.getContractAt("RagnarokMock", contractAddress)
		const trx = await contract.setURI(taskArgs.uri)

		console.log(`Transaction Hash: ${trx.hash}`)
		await trx.wait(1)
		console.log("Transaction confirmed")
	})
