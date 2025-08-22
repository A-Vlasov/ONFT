use crate::*;
use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, Burn, Mint, TokenAccount, TokenInterface, TransferChecked};
use oapp::endpoint::{instructions::SendParams as EndpointSendParams, MessagingReceipt};

#[event_cpi]
#[derive(Accounts)]
#[instruction(params: SendONftParams)]
pub struct SendONft<'info> {
    pub signer: Signer<'info>,
    #[account(
        mut,
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
    #[account(
        seeds = [ONft_SEED, &get_ONft_config_seed(&ONft_config).to_bytes()],
        bump = ONft_config.bump
    )]
    pub ONft_config: Account<'info, ONftConfig>,
    #[account(
        mut,
        token::authority = signer,
        token::mint = token_mint,
        token::token_program = token_program,
    )]
    pub token_source: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub token_mint: InterfaceAccount<'info, Mint>,
    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = token_mint,
        associated_token::authority = ONft_config,
        associated_token::token_program = token_program
    )]
    pub token_escrow: Option<InterfaceAccount<'info, TokenAccount>>,
    pub token_program: Interface<'info, TokenInterface>,
}

impl SendONft<'_> {
    pub fn apply(ctx: &mut Context<SendONft>, params: &SendONftParams) -> Result<MessagingReceipt> {
        // Validate token_mint is the expected PDA for token_id
        let (expected_mint, _mint_bump) = Pubkey::find_program_address(
            &[ONft_SEED, b"mint", &params.token_id.to_be_bytes()],
            ctx.program_id,
        );
        require_keys_eq!(expected_mint, ctx.accounts.token_mint.key(), ONftError::InvalidTokenMint);

        // Only Native mode supported for ONFT send in this MVP
        match ctx.accounts.ONft_config.ext {
            ONftConfigExt::Native(_) => {
                // burn 1 token from signer
                token_interface::burn(
                    CpiContext::new(
                        ctx.accounts.token_program.to_account_info(),
                        Burn {
                            mint: ctx.accounts.token_mint.to_account_info(),
                            from: ctx.accounts.token_source.to_account_info(),
                            authority: ctx.accounts.signer.to_account_info(),
                        },
                    ),
                    1,
                )?;
            }
            ONftConfigExt::Adapter(_) => {
                // transfer 1 token from signer to escrow (lock)
                let escrow_acc = ctx
                    .accounts
                    .token_escrow
                    .as_ref()
                    .ok_or_else(|| error!(ONftError::InvalidTokenEscrow))?;
                token_interface::transfer_checked(
                    CpiContext::new(
                        ctx.accounts.token_program.to_account_info(),
                        TransferChecked {
                            from: ctx.accounts.token_source.to_account_info(),
                            mint: ctx.accounts.token_mint.to_account_info(),
                            to: escrow_acc.to_account_info(),
                            authority: ctx.accounts.signer.to_account_info(),
                        },
                    ),
                    1,
                    0, // decimals
                )?;
            }
        }

        // Send message via endpoint
        let receipt = oapp::endpoint_cpi::send(
            ctx.accounts.ONft_config.endpoint_program,
            ctx.accounts.ONft_config.key(),
            ctx.remaining_accounts,
            &[
                ONft_SEED,
                &get_ONft_config_seed(&ctx.accounts.ONft_config).to_bytes(),
                &[ctx.accounts.ONft_config.bump],
            ],
            EndpointSendParams {
                dst_eid: params.dst_eid,
                receiver: ctx.accounts.peer.address,
                // используем ABI-совместимый формат (bytes32, uint256) для LZ v2 ONFT
                message: onft_msg_codec::encode_abi(params.to, params.token_id),
                options: ctx
                    .accounts
                    .enforced_options
                    .get_enforced_options(&None),
                native_fee: params.native_fee,
                lz_token_fee: params.lz_token_fee,
            },
        )?;

        Ok(receipt)
    }
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct SendONftParams {
    pub dst_eid: u32,
    pub to: [u8; 32],
    pub token_id: u64,
    pub native_fee: u64,
    pub lz_token_fee: u64,
}

