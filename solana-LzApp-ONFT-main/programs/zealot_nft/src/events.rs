use crate::*;

#[event]
pub struct ONftSent {
    pub guid: [u8; 32],
    pub dst_eid: u32,
    pub from: Pubkey,
    pub amount_sent_ld: u64,
    pub amount_received_ld: u64,
}

#[event]
pub struct ONftReceived {
    pub guid: [u8; 32],
    pub src_eid: u32,
    pub to: Pubkey,
    pub amount_received_ld: u64,
}

#[event]
pub struct AdapterONftInitialized {
    pub ONft_config: Pubkey,
    pub token_mint: Pubkey,
    pub token_escrow: Pubkey,
    pub admin: Pubkey,
    pub shared_decimals: u8,
}

#[event]
pub struct ONftConfigInitialized {
    pub admin: Pubkey,
    pub endpoint_program: Pubkey,
    pub shared_decimals: u8,
    pub decimals: u8,
    pub ld2sd_rate: u64,
}
