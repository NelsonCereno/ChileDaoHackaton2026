use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("Edumint1111111111111111111111111111111111112");

pub const REGISTRY_SEED: &[u8] = b"registry";
pub const WORK_SEED: &[u8] = b"academic_work";
pub const ACCESS_SEED: &[u8] = b"access";

const TITLE_MAX: usize = 128;
const DESC_MAX: usize = 512;
const HASH_MAX: usize = 64;

#[program]
pub mod edumint {
    use super::*;

    pub fn initialize_registry(ctx: Context<InitializeRegistry>) -> Result<()> {
        let registry = &mut ctx.accounts.registry;
        registry.authority = ctx.accounts.authority.key();
        registry.next_work_id = 1;
        Ok(())
    }

    pub fn register_work(
        ctx: Context<RegisterWork>,
        title: String,
        description: String,
        content_hash: String,
        price_lamports: u64,
        price_usdc: u64,
    ) -> Result<()> {
        require!(title.as_bytes().len() <= TITLE_MAX, EduMintError::TitleTooLong);
        require!(description.as_bytes().len() <= DESC_MAX, EduMintError::DescriptionTooLong);
        require!(content_hash.as_bytes().len() <= HASH_MAX, EduMintError::HashTooLong);
        require!(price_lamports > 0, EduMintError::InvalidPrice);
        require!(price_usdc > 0, EduMintError::InvalidPrice);

        let registry = &mut ctx.accounts.registry;
        let work = &mut ctx.accounts.work;

        work.work_id = registry.next_work_id;
        work.professor = ctx.accounts.professor.key();
        work.title = title;
        work.description = description;
        work.content_hash = content_hash;
        work.price_lamports = price_lamports;
        work.price_usdc = price_usdc;
        work.created_at = Clock::get()?.unix_timestamp;
        work.access_count = 0;

        registry.next_work_id = registry
            .next_work_id
            .checked_add(1)
            .ok_or(EduMintError::Overflow)?;

        Ok(())
    }

    pub fn update_price(ctx: Context<UpdatePrice>, new_price_lamports: u64) -> Result<()> {
        require!(new_price_lamports > 0, EduMintError::InvalidPrice);
        let work = &mut ctx.accounts.work;
        require!(work.professor == ctx.accounts.professor.key(), EduMintError::Unauthorized);
        work.price_lamports = new_price_lamports;
        Ok(())
    }

    pub fn access_work(ctx: Context<AccessWork>) -> Result<()> {
        let work = &mut ctx.accounts.work;
        require!(work.professor == ctx.accounts.professor.key(), EduMintError::Unauthorized);
        require!(work.price_lamports > 0, EduMintError::InvalidPrice);

        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.payer.key(),
            &ctx.accounts.professor.key(),
            work.price_lamports,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.payer.to_account_info(),
                ctx.accounts.professor.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        work.access_count = work
            .access_count
            .checked_add(1)
            .ok_or(EduMintError::Overflow)?;

        let access = &mut ctx.accounts.access;
        access.work_id = work.work_id;
        access.student = ctx.accounts.payer.key();
        access.accessed_at = Clock::get()?.unix_timestamp;

        Ok(())
    }

    pub fn purchase_access_usdc(ctx: Context<PurchaseAccessUsdc>) -> Result<()> {
        let work = &mut ctx.accounts.work;
        require!(work.professor == ctx.accounts.professor.key(), EduMintError::Unauthorized);
        require!(work.price_usdc > 0, EduMintError::InvalidPrice);
        require!(ctx.accounts.usdc_mint.decimals == 6, EduMintError::InvalidUsdcMint);
        require!(
            ctx.accounts.payer_token.amount >= work.price_usdc,
            EduMintError::InsufficientFunds
        );

        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.payer_token.to_account_info(),
                to: ctx.accounts.professor_token.to_account_info(),
                authority: ctx.accounts.payer.to_account_info(),
            },
        );
        token::transfer(cpi_ctx, work.price_usdc)?;

        work.access_count = work
            .access_count
            .checked_add(1)
            .ok_or(EduMintError::Overflow)?;

        let access = &mut ctx.accounts.access;
        access.work_id = work.work_id;
        access.student = ctx.accounts.payer.key();
        access.accessed_at = Clock::get()?.unix_timestamp;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeRegistry<'info> {
    #[account(
        init,
        payer = authority,
        space = Registry::LEN,
        seeds = [REGISTRY_SEED],
        bump
    )]
    pub registry: Account<'info, Registry>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterWork<'info> {
    #[account(mut, seeds = [REGISTRY_SEED], bump)]
    pub registry: Account<'info, Registry>,
    #[account(
        init,
        payer = professor,
        space = AcademicWork::LEN,
        seeds = [WORK_SEED, &registry.next_work_id.to_le_bytes()],
        bump
    )]
    pub work: Account<'info, AcademicWork>,
    #[account(mut)]
    pub professor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdatePrice<'info> {
    #[account(mut, has_one = professor)]
    pub work: Account<'info, AcademicWork>,
    pub professor: Signer<'info>,
}

#[derive(Accounts)]
pub struct AccessWork<'info> {
    #[account(mut)]
    pub work: Account<'info, AcademicWork>,
    #[account(
        init,
        payer = payer,
        space = Access::LEN,
        seeds = [ACCESS_SEED, &work.work_id.to_le_bytes(), payer.key().as_ref()],
        bump
    )]
    pub access: Account<'info, Access>,
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: Verified against work.professor
    #[account(mut)]
    pub professor: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PurchaseAccessUsdc<'info> {
    #[account(mut)]
    pub work: Account<'info, AcademicWork>,
    #[account(
        init,
        payer = payer,
        space = Access::LEN,
        seeds = [ACCESS_SEED, &work.work_id.to_le_bytes(), payer.key().as_ref()],
        bump
    )]
    pub access: Account<'info, Access>,
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: Verified against work.professor
    #[account(mut)]
    pub professor: UncheckedAccount<'info>,
    #[account(
        mut,
        constraint = payer_token.owner == payer.key() @ EduMintError::Unauthorized,
        constraint = payer_token.mint == usdc_mint.key() @ EduMintError::InvalidUsdcMint
    )]
    pub payer_token: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = professor_token.owner == professor.key() @ EduMintError::Unauthorized,
        constraint = professor_token.mint == usdc_mint.key() @ EduMintError::InvalidUsdcMint
    )]
    pub professor_token: Account<'info, TokenAccount>,
    pub usdc_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Registry {
    pub authority: Pubkey,
    pub next_work_id: u64,
}

impl Registry {
    pub const LEN: usize = 8 + 32 + 8;
}

#[account]
pub struct AcademicWork {
    pub work_id: u64,
    pub professor: Pubkey,
    pub title: String,
    pub description: String,
    pub content_hash: String,
    pub price_lamports: u64,
    pub price_usdc: u64,
    pub created_at: i64,
    pub access_count: u64,
}

impl AcademicWork {
    pub const LEN: usize =
        8 + 8 + 32 + (4 + TITLE_MAX) + (4 + DESC_MAX) + (4 + HASH_MAX) + 8 + 8 + 8 + 8;
}

#[account]
pub struct Access {
    pub work_id: u64,
    pub student: Pubkey,
    pub accessed_at: i64,
}

impl Access {
    pub const LEN: usize = 8 + 8 + 32 + 8;
}

#[error_code]
pub enum EduMintError {
    #[msg("Title exceeds max length")]
    TitleTooLong,
    #[msg("Description exceeds max length")]
    DescriptionTooLong,
    #[msg("Content hash exceeds max length")]
    HashTooLong,
    #[msg("Price must be greater than zero")]
    InvalidPrice,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Invalid USDC mint")]
    InvalidUsdcMint,
    #[msg("Insufficient funds")]
    InsufficientFunds,
}
