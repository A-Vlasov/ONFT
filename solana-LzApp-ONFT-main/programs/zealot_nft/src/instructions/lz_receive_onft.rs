use crate::*;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{self, Mint, MintTo, TokenAccount, TokenInterface, TransferChecked};
use oapp::endpoint::{cpi::accounts::Clear, instructions::ClearParams, ConstructCPIContext};
use mpl_token_metadata::instruction as mpl_ix;
use mpl_token_metadata::ID as METADATA_PROGRAM_ID;

#[derive(Accounts)]
#[instruction(params: LzReceiveParams)]
pub struct LzReceiveONft<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        seeds = [PEER_SEED, &ONft_config.key().to_bytes(), &params.src_eid.to_be_bytes()],
        bump = peer.bump,
        constraint = peer.address == params.sender @ONftError::InvalidSender
    )]
    pub peer: Account<'info, Peer>,
    #[account(
        seeds = [ONft_SEED, &get_ONft_config_seed(&ONft_config).to_bytes()],
        bump = ONft_config.bump
    )]
    pub ONft_config: Account<'info, ONftConfig>,
    #[account(
        init_if_needed,
        payer = payer,
        seeds = [ONft_SEED, b"mint", &onft_msg_codec::token_id_any_u64(&params.message).to_be_bytes()],
        bump,
        mint::decimals = 0,
        mint::authority = ONft_config,
        mint::freeze_authority = ONft_config,
        mint::token_program = token_program
    )]
    pub token_mint: InterfaceAccount<'info, Mint>,
    /// CHECK: the wallet address to receive the token
    #[account(address = Pubkey::from(onft_msg_codec::to_address_any(&params.message)) @ONftError::InvalidTokenDest)]
    pub to_address: AccountInfo<'info>,
    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = token_mint,
        associated_token::authority = ONft_config,
        associated_token::token_program = token_program
    )]
    pub token_escrow: Option<InterfaceAccount<'info, TokenAccount>>,
    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = token_mint,
        associated_token::authority = to_address,
        associated_token::token_program = token_program
    )]
    pub token_dest: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    /// CHECK: endpoint program for clear
    #[account(address = ONft_config.endpoint_program)]
    pub endpoint_program: UncheckedAccount<'info>,
    /// CHECK: event authority
    pub event_authority: UncheckedAccount<'info>,
    /// CHECK: program id
    pub program: UncheckedAccount<'info>,
}

impl LzReceiveONft<'_> {
    pub fn apply(ctx: &mut Context<LzReceiveONft>, params: &LzReceiveParams) -> Result<()> {
        // Addresses enforced by account constraints above
        let to_pubkey = Pubkey::from(onft_msg_codec::to_address_any(&params.message));

        // Native mode: mint exactly 1 token to destination
        match ctx.accounts.ONft_config.ext {
            ONftConfigExt::Native(_) => {
                // Create metadata account if missing (best-effort)
                let metadata_pda = Pubkey::find_program_address(
                    &[
                        b"metadata",
                        METADATA_PROGRAM_ID.as_ref(),
                        ctx.accounts.token_mint.key().as_ref(),
                    ],
                    &METADATA_PROGRAM_ID,
                )
                .0;
                // Minimal metadata init (name/symbol/uri из заглушек; можно расширить параметрами)
                // Пробуем создать, но если уже есть — игнорируем ошибку
                let name = "ONFT".to_string();
                let symbol = "ONFT".to_string();
                let uri = "".to_string();
                let ix = mpl_ix::create_metadata_accounts_v3(
                    METADATA_PROGRAM_ID,
                    metadata_pda,
                    ctx.accounts.token_mint.key(),
                    ctx.accounts.ONft_config.key(),
                    ctx.accounts.payer.key(),
                    ctx.accounts.ONft_config.key(),
                    name,
                    symbol,
                    uri,
                    None,
                    0,
                    true,
                    false,
                    None,
                    None,
                    None,
                );
                let _ = anchor_lang::solana_program::program::invoke_signed(
                    &ix,
                    &[
                        ctx.accounts.token_mint.to_account_info(),
                        ctx.accounts.ONft_config.to_account_info(),
                        ctx.accounts.payer.to_account_info(),
                    ],
                    &[&[
                        ONft_SEED,
                        &get_ONft_config_seed(&ctx.accounts.ONft_config).to_bytes(),
                        &[ctx.accounts.ONft_config.bump],
                    ]],
                );

                token_interface::mint_to(
                    CpiContext::new_with_signer(
                        ctx.accounts.token_program.to_account_info(),
                        MintTo {
                            mint: ctx.accounts.token_mint.to_account_info(),
                            to: ctx.accounts.token_dest.to_account_info(),
                            authority: ctx.accounts.ONft_config.to_account_info(),
                        },
                        &[&[
                            ONft_SEED,
                            &get_ONft_config_seed(&ctx.accounts.ONft_config).to_bytes(),
                            &[ctx.accounts.ONft_config.bump],
                        ]],
                    ),
                    1,
                )?;
            }
            ONftConfigExt::Adapter(escrow) => {
                // Lazy init: если в эскроу 0 — минт 1 в эскроу
                let escrow_acc = ctx
                    .accounts
                    .token_escrow
                    .as_ref()
                    .ok_or_else(|| error!(ONftError::InvalidTokenEscrow))?;

                if escrow_acc.amount == 0 {
                    token_interface::mint_to(
                        CpiContext::new_with_signer(
                            ctx.accounts.token_program.to_account_info(),
                            MintTo {
                                mint: ctx.accounts.token_mint.to_account_info(),
                                to: escrow_acc.to_account_info(),
                                authority: ctx.accounts.ONft_config.to_account_info(),
                            },
                            &[&[
                                ONft_SEED,
                                &get_ONft_config_seed(&ctx.accounts.ONft_config).to_bytes(),
                                &[ctx.accounts.ONft_config.bump],
                            ]],
                        ),
                        1,
                    )?;
                }

                let seeds: &[&[u8]] = &[ONft_SEED, &escrow.to_bytes(), &[ctx.accounts.ONft_config.bump]];
                token_interface::transfer_checked(
                    CpiContext::new(
                        ctx.accounts.token_program.to_account_info(),
                        TransferChecked {
                            from: escrow_acc.to_account_info(),
                            mint: ctx.accounts.token_mint.to_account_info(),
                            to: ctx.accounts.token_dest.to_account_info(),
                            authority: ctx.accounts.ONft_config.to_account_info(),
                        },
                    )
                    .with_signer(&[&seeds]),
                    1,
                    0,
                )?;
            }
        }

        // Clear any stored payload if needed (reuse existing pattern)
        let seeds: &[&[&[u8]]] = &[&[
            ONft_SEED,
            &get_ONft_config_seed(&ctx.accounts.ONft_config).to_bytes(),
            &[ctx.accounts.ONft_config.bump],
        ]];
        let cpi_ctx = ConstructCPIContext::new_with_signer(
            ctx.accounts.endpoint_program.to_account_info(),
            ctx.remaining_accounts,
            seeds,
        );
        oapp::endpoint_cpi::clear(cpi_ctx, ClearParams { guid: params.guid })?;

        emit!(ONftReceived {
            guid: params.guid,
            src_eid: params.src_eid,
            to: to_pubkey,
            amount_received_ld: 1,
        });

        Ok(())
    }
}

