import "@nomicfoundation/hardhat-toolbox"
import "@openzeppelin/hardhat-upgrades"

import { HardhatUserConfig } from "hardhat/config"

import "hardhat-deploy"
import "@nomiclabs/hardhat-solhint"
import "hardhat-deploy"
import "solidity-coverage"

import "dotenv/config"

import "./tasks/accounts"
import "./tasks/balance"
import "./tasks/current-block-number"
import "./tasks/send-eth"

import "./tasks/77bit/deploy-with-proxy"
import "./tasks/77bit/upgrade"
import "./tasks/77bit/safe-mint"
import "./tasks/77bit/owner-of"
import "./tasks/77bit/add-minter"
import "./tasks/77bit/remove-minter"
import "./tasks/77bit/get-owner"
import "./tasks/77bit/set-approval-for-all"
import "./tasks/77bit/set-uri"
import "./tasks/77bit/get-token-uri"

import "./tasks/ragnarok-mock/mint"
import "./tasks/ragnarok-mock/balance-of"
import "./tasks/ragnarok-mock/set-uri"
import "./tasks/ragnarok-mock/get-uri"
import "./tasks/ragnarok-mock/set-approval-for-all"

import "./tasks/sld-chip-mock/sld-chip-mint"
import "./tasks/sld-chip-mock/sld-chip-add-minter"
import "./tasks/sld-chip-mock/sld-chip-burn"
import "./tasks/sld-chip-mock/set-approval-for-all"
import "./tasks/sld-chip-mock/balance-of"

import "./tasks/ragnarok-transform/deploy-with-proxy"
import "./tasks/ragnarok-transform/art-upgrade"
import "./tasks/ragnarok-transform/re-roll"
import "./tasks/ragnarok-transform/set-ragnarok-address"
import "./tasks/ragnarok-transform/set-77bit-address"
import "./tasks/ragnarok-transform/set-sld-chip-address"

import * as process from "process"

const config: HardhatUserConfig = {
	networks: {
		mainnet: {
			url: process.env.MAINNET_RPC_URL || "",
			accounts: { mnemonic: process.env.MNEMONIC || "" },
		},
		sepolia: {
			url: process.env.SEPOLIA_RPC_URL || "",
			accounts: { mnemonic: process.env.MNEMONIC || "" },
		},
	},
	namedAccounts: {
		deployer: {
			default: 0, // here this will by default take the first account as deployer
			mainnet: 0, // similarly on mainnet it will take the first account as deployer.
		},
		owner: {
			default: 0,
		},
	},
	solidity: {
		version: "0.8.24",
		settings: {
			optimizer: {
				enabled: true,
				runs: 200,
			},
		},
	},
}

export default config
