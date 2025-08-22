# Solana ONFT (Omnichain Non-Fungible Token) Documentation

## 1. Project Overview

This project implements an Omnichain Non-Fungible Token (ONFT) on the Solana blockchain using LayerZero's cross-chain messaging protocol. Unlike the Ethereum implementation which uses contract inheritance, this Solana version utilizes LayerZero's Endpoint Cross Program Invocation (CPI) Helper to achieve cross-chain functionality.

## 2. Solana Program Structure

The Solana program is structured to work with LayerZero's messaging interface, allowing for sending and receiving arbitrary data between different blockchain networks. Here's an overview of the key components:

### Main Program Logic
- Location: `programs/zealot_nft/src/lib.rs`
- This file defines the program's entry points and interactions with the LayerZero Endpoint.

### Instruction Handlers
- Location: `programs/zealot_nft/src/instructions/`
- These files contain the logic for various operations:
  - `init_oft.rs` and `init_adapter_oft.rs`: Initialize the ONFT
  - `send.rs`: Handles sending tokens to other chains
  - `lz_receive.rs`: Processes incoming messages from other chains
  - `mint_to.rs`: Mints new tokens
  - `set_mint_authority.rs`: Sets the minting authority

### State Management
- Location: `programs/zealot_nft/src/state/`
- These files define the program's state:
  - `onft.rs`: ONFT configuration
  - `peer.rs`: Manages cross-chain peer information

## 3. Key Functionalities

The Solana program implements the following core functionalities:

1. Initialization: 
   - Sets up the ONFT configuration and LayerZero endpoint interaction
   - Implemented in `init_oft.rs` and `init_adapter_oft.rs`

2. Cross-Chain Operations:
   - Sending: `send.rs` prepares and sends messages through the LayerZero Endpoint
   - Receiving: `lz_receive.rs` handles incoming messages from other chains

3. Token Management:
   - Minting: `mint_to.rs` handles token creation
   - Authority Management: `set_mint_authority.rs` controls minting permissions

4. Administrative Functions:
   - Various files in `instructions/` handle admin operations like setting peers and enforcing options

## 4. LayerZero Integration

Unlike the Ethereum version which inherits from an OApp Standard, the Solana program directly interacts with the LayerZero Endpoint:

- The program uses LayerZero's Endpoint CPI Helper for cross-chain messaging
- `send.rs` and `lz_receive.rs` are key files that interact with the LayerZero Endpoint
- The program handles account management required for Solana's CPI model

## 5. Testing

The test file `tests/zealot_nft.ts` covers basic operations:
- Initializing the ONFT
- Sending tokens cross-chain
- Receiving tokens from other chains

These tests ensure that the program correctly interacts with the LayerZero Endpoint for cross-chain operations.