use crate::*;

// Two compatible encodings:
// 1) Packed40: [to(32)][token_id(u64, BE)]
// 2) ABI64: abi.encode(bytes32 to, uint256 tokenId) → [to(32)][token_id(32 BE)]

const TO_OFFSET: usize = 0;
const PACKED_TOKEN_ID_OFFSET: usize = 32;
const PACKED_END_OFFSET: usize = 40;
const ABI_TOKEN_ID_OFFSET: usize = 32;
const ABI_END_OFFSET: usize = 64;

pub fn encode_packed(to: [u8; 32], token_id: u64) -> Vec<u8> {
    let mut encoded = Vec::with_capacity(PACKED_END_OFFSET);
    encoded.extend_from_slice(&to);
    encoded.extend_from_slice(&token_id.to_be_bytes());
    encoded
}

pub fn encode_abi(to: [u8; 32], token_id: u64) -> Vec<u8> {
    let mut encoded = Vec::with_capacity(ABI_END_OFFSET);
    encoded.extend_from_slice(&to);
    let mut padded = [0u8; 32];
    padded[24..32].copy_from_slice(&token_id.to_be_bytes());
    encoded.extend_from_slice(&padded);
    encoded
}

pub fn to_address_any(message: &[u8]) -> [u8; 32] {
    let mut to = [0u8; 32];
    if message.len() >= ABI_END_OFFSET {
        to.copy_from_slice(&message[TO_OFFSET..ABI_TOKEN_ID_OFFSET]);
    } else if message.len() >= PACKED_END_OFFSET {
        to.copy_from_slice(&message[TO_OFFSET..PACKED_TOKEN_ID_OFFSET]);
    }
    to
}

pub fn token_id_any_u64(message: &[u8]) -> u64 {
    if message.len() >= ABI_END_OFFSET {
        // take last 8 bytes of 32-byte uint256 (big-endian)
        let mut token_bytes = [0u8; 8];
        token_bytes.copy_from_slice(&message[ABI_TOKEN_ID_OFFSET + 24..ABI_TOKEN_ID_OFFSET + 32]);
        return u64::from_be_bytes(token_bytes);
    }
    if message.len() >= PACKED_END_OFFSET {
        let mut token_bytes = [0u8; 8];
        token_bytes.copy_from_slice(&message[PACKED_TOKEN_ID_OFFSET..PACKED_END_OFFSET]);
        return u64::from_be_bytes(token_bytes);
    }
    0
}

