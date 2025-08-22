import { task } from "hardhat/config"
import { getDefaultAccountIfEmpty, getDeployedContractAddress } from "../utils/utils"

/**
 Example:
 hardhat sld-chip-mock:burn \
 --contract 0x320bd6de80d3D5361e1c9bB4CF1D7D9Ef24F3Ac7 \
 --id 1 \
 --amount 10 \
 --network sepolia
 */
task("sld-chip-mock:burn", "Burn tokens")
	.addParam<string>("from", "Token Sender", undefined, undefined, true)
	.addParam<number>("id", "Token ID")
	.addParam<number>("amount", "Token Amount")
	.setAction(async (taskArgs, hre) => {
		const dead = "0x000000000000000000000000000000000000dEaD"

		const from = await getDefaultAccountIfEmpty({ hre, account: taskArgs.from, argName: "from" })
		const contractAddress = await getDeployedContractAddress({ hre, name: "SecureLiquidDigitalChipMock" })
		const contract = await hre.ethers.getContractAt("SecureLiquidDigitalChipMock", contractAddress)
		const mintTrx = await contract.safeTransferFrom(from, dead, taskArgs.id, taskArgs.amount, "0x")
		console.log(`Transaction Hash: ${mintTrx.hash}`)
		await mintTrx.wait(1)
		console.log("Transaction confirmed")
	})
