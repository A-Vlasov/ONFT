import { task } from "hardhat/config"
import { getDeployedContractAddress } from "../utils/utils"

const contractName = "RagnarokTransform"

/**
 Example:
 hh ragnarok-transform:deploy-with-proxy --network sepolia \
    --ragnarokAddress 0x1234567890123456789012345678901234567890 \
    --sldChipAddress 0x1234567890123456789012345678901234567890 \
    --initial77bitTokensOwnerAddress 0x1234567890123456789012345678901234567890
 */
task("ragnarok-transform:deploy-with-proxy", "Initial deploy RagnarokTransform contract")
	.addParam<string>(
		"ragnarokAddress",
		"address of deployed Ragnarok contract (RagnarokMock used by default)",
		undefined,
		undefined,
		true
	)
	.addParam<string>(
		"sldChipAddress",
		"address of deployed SecureLiquidDigitalChip contract (SecureLiquidDigitalChipMock used by default)",
		undefined,
		undefined,
		true
	)
	.setAction(async (taskArgs, hre) => {
		const ragnarokAddress =
			taskArgs.ragnarokAddress || (await getDeployedContractAddress({ hre, name: "RagnarokMock" }))
		const sldChipAddress =
			taskArgs.sldChipAddress || (await getDeployedContractAddress({ hre, name: "SecureLiquidDigitalChipMock" }))
		const sevenSevenBitAddress = await getDeployedContractAddress({ hre, name: "SevenSevenBit" })
		const Transform = await hre.ethers.getContractFactory(contractName)
		const transform = await hre.upgrades.deployProxy(Transform, [
			ragnarokAddress,
			sevenSevenBitAddress,
			sldChipAddress
		])
		await transform.waitForDeployment()
		console.log(`${contractName} deployed at address`, await transform.getAddress())
		await hre.deployments.save(contractName, {
			address: await transform.getAddress(),
			abi: transform.interface.format(),
		})
		console.log(`${contractName} saved to deployments`)
	})
