// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

// ВНИМАНИЕ: импорт из официального репозитория LZ v2. Если Remix не подтянет зависимость,
// откройте файл и замените импорт на локальную копию из Quickstart.
import { ONFT721 } from "https://raw.githubusercontent.com/LayerZero-Labs/LayerZero-v2/main/packages/oapp/contracts/onft/ONFT721.sol";

// Базовый ONFT (burn & mint) для назначения (например, Abstract)
contract MyONFT721 is ONFT721 {
    constructor(
        string memory name_,
        string memory symbol_,
        address lzEndpoint_,
        address delegate_
    ) ONFT721(name_, symbol_, lzEndpoint_, delegate_) {}
}


