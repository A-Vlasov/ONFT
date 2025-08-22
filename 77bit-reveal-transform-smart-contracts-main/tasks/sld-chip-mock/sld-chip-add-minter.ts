import { task } from "hardhat/config"
import { getDefaultAccountIfEmpty, getDeployedContractAddress } from "../utils/utils"

/**
 Example:
 hh sld-chip-mock:add-minter --network sepolia
 */
task("sld-chip-mock:add-minter", "SldChip set minter")
	.addParam<string>("address", "Address of minter", undefined, undefined, true)
	.setAction(async (taskArgs, hre) => {
		const minterAddress = await getDefaultAccountIfEmpty({ hre, account: taskArgs.minter, argName: "address" })
		const contractAddress = await getDeployedContractAddress({ hre, name: "SecureLiquidDigitalChipMock" })
		const contract = await hre.ethers.getContractAt("SecureLiquidDigitalChipMock", contractAddress)
		const mintTrx = await contract.addMinter(minterAddress)
		console.log(`Transaction Hash: ${mintTrx.hash}`)
		await mintTrx.wait(1)
		console.log("Transaction confirmed")
	})
