// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ONFT721Adapter } from "@layerzerolabs/onft-evm/contracts/onft721/ONFT721Adapter.sol";

contract MyONFT721Adapter is ONFT721Adapter {
    constructor(
        address existingErc721,
        address lzEndpoint_,
        address delegate_
    ) ONFT721Adapter(existingErc721, lzEndpoint_, delegate_) {}
}


