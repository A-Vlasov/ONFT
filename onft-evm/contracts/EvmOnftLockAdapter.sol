// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { IERC721 } from "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v5.0.2/contracts/token/ERC721/IERC721.sol";

// LayerZero v2 OApp base (provides _lzSend, _quote, _setPeer, lzReceive plumbing)
import { OApp } from "https://raw.githubusercontent.com/LayerZero-Labs/LayerZero-v2/main/packages/oapp/contracts/oapp/OApp.sol";
import { Origin } from "https://raw.githubusercontent.com/LayerZero-Labs/LayerZero-v2/main/packages/layerzero-v2/evm/protocol/contracts/interfaces/IMessageLibManager.sol";
import { MessagingFee } from "https://raw.githubusercontent.com/LayerZero-Labs/LayerZero-v2/main/packages/oapp/contracts/oapp/libs/OAppOptionsType3.sol";

/// @title EvmOnftLockAdapter
/// @notice Адаптер (lock/unlock) для существующей ERC721: лочит токен на источнике и отправляет сообщение.
///         Пэйлоад совместим с Solana-программой: bytes32(to) + uint64(tokenId).
contract EvmOnftLockAdapter is OApp {
    IERC721 public immutable token; // исходная коллекция

    event OnftSent(bytes32 guid, uint32 dstEid, address from, bytes32 to, uint256 tokenId);
    event OnftReceived(bytes32 guid, uint32 srcEid, address to, uint256 tokenId);

    constructor(address _token, address _endpoint, address _delegate) OApp(_endpoint, _delegate) {
        token = IERC721(_token);
    }

    /// @notice Лочит tokenId и отправляет сообщение на dst
    /// @param dstEid EID целевой сети
    /// @param to Адрес получателя в виде bytes32 (левый паддинг для EVM адреса)
    /// @param tokenId Идентификатор токена (должен уместиться в uint64 для совместимости с Solana кодеком)
    /// @param extraOptions Опции исполнения (gas, airdrop и т.п.)
    function sendLock(
        uint32 dstEid,
        bytes32 to,
        uint256 tokenId,
        bytes calldata extraOptions
    ) external payable {
        require(token.ownerOf(tokenId) == msg.sender, "not owner");
        require(tokenId <= type(uint64).max, "tokenId>u64");

        // lock: перевести NFT на контракт-эскроу
        token.transferFrom(msg.sender, address(this), tokenId);

        // payload: [to(32)][tokenId(u64 BE)]
        bytes memory payload = abi.encodePacked(to, uint64(tokenId));

        // квота комиссии и отправка
        MessagingFee memory fee = _quote(dstEid, payload, extraOptions, false);
        require(msg.value >= fee.nativeFee, "insufficient fee");

        bytes32 guid = _lzSend(dstEid, payload, extraOptions, fee, payable(msg.sender));
        emit OnftSent(guid, dstEid, msg.sender, to, tokenId);
    }

    /// @notice Оценка комиссии для sendLock
    function quoteSendLock(
        uint32 dstEid,
        bytes32 to,
        uint256 tokenId,
        bytes calldata extraOptions
    ) external view returns (MessagingFee memory) {
        require(tokenId <= type(uint64).max, "tokenId>u64");
        bytes memory payload = abi.encodePacked(to, uint64(tokenId));
        return _quote(dstEid, payload, extraOptions, false);
    }

    /// @dev Приём сообщения: разблокировка токена из эскроу пользователю
    function _lzReceive(
        Origin calldata _origin,
        bytes32 _guid,
        bytes calldata _message,
        address /*_executor*/,
        bytes calldata /*_extraData*/
    ) internal override {
        require(_message.length == 40, "bad payload");

        // декодирование: адрес получателя (bytes32) -> address
        bytes32 toBytes32;
        uint64 tokenId64;
        assembly {
            toBytes32 := calldataload(_message.offset)
            tokenId64 := calldataload(add(_message.offset, 32))
        }
        address to = address(uint160(uint256(toBytes32)));
        uint256 tokenId = uint256(tokenId64);

        require(token.ownerOf(tokenId) == address(this), "escrow missing");
        token.transferFrom(address(this), to, tokenId);
        emit OnftReceived(_guid, _origin.srcEid, to, tokenId);
    }

    /// @notice Админ: указать пира (контракт на целевой сети)
    function setPeer(uint32 eid, bytes32 peer) external onlyOwner {
        _setPeer(eid, peer);
    }
}


