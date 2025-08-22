use crate::*;
use oapp::endpoint::{instructions::QuoteParams as EndpointQuoteParams, MessagingFee};

#[derive(Accounts)]
#[instruction(params: QuoteOnftMsgParams)]
pub struct QuoteOnftMsg<'info> {
    #[account(
        seeds = [ONft_SEED, &get_ONft_config_seed(&ONft_config).to_bytes()],
        bump = ONft_config.bump
    )]
    pub ONft_config: Account<'info, ONftConfig>,
    #[account(
        seeds = [
            PEER_SEED,
            &ONft_config.key().to_bytes(),
            &params.dst_eid.to_be_bytes()
        ],
        bump = peer.bump
    )]
    pub peer: Account<'info, Peer>,
    #[account(
        seeds = [
            ENFORCED_OPTIONS_SEED,
            &ONft_config.key().to_bytes(),
            &params.dst_eid.to_be_bytes()
        ],
        bump = enforced_options.bump
    )]
    pub enforced_options: Account<'info, EnforcedOptions>,
}

impl QuoteOnftMsg<'_> {
    pub fn apply(ctx: &Context<QuoteOnftMsg>, params: &QuoteOnftMsgParams) -> Result<MessagingFee> {
        oapp::endpoint_cpi::quote(
            ctx.accounts.ONft_config.endpoint_program,
            ctx.remaining_accounts,
            EndpointQuoteParams {
                sender: ctx.accounts.ONft_config.key(),
                dst_eid: params.dst_eid,
                receiver: ctx.accounts.peer.address,
                message: onft_msg_codec::encode(params.to, params.token_id),
                pay_in_lz_token: params.pay_in_lz_token,
                options: ctx
                    .accounts
                    .enforced_options
                    .get_enforced_options(&None),
            },
        )
    }
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct QuoteOnftMsgParams {
    pub dst_eid: u32,
    pub to: [u8; 32],
    pub token_id: u64,
    pub pay_in_lz_token: bool,
}

