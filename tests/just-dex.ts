import { join } from "path";
import { readFileSync } from "fs";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { JustDex } from "../target/types/just_dex";

import { assert } from "chai";
import * as token from "@solana/spl-token";
import * as web3 from "@solana/web3.js";
import { utf8 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";


describe("just_dex", async () => {
  // Configure the client to use the local cluster.
  let provider = anchor.AnchorProvider.env();
  let connection = provider.connection;
  anchor.setProvider(provider);
  
  const program = anchor.workspace.Ammv2 as Program<JustDex>;

  const WALLET_PATH = join(process.env["HOME"]!, ".config/solana/id.json");
  const admin = anchor.web3.Keypair.fromSecretKey(
    Buffer.from(JSON.parse(readFileSync(WALLET_PATH, { encoding: "utf-8" })))
  );

  const dex = anchor.web3.Keypair.generate();

  const [dexPDA] = await anchor.web3.PublicKey.findProgramAddressSync([
    utf8.encode("dex"),
    admin.publicKey.toBuffer(),
  ],
    program.programId
  );
  
  // TOKEN0 mint 
  let token0mintPubkey = await token.createMint(
    connection,
    admin,
    admin.publicKey,
    null,
    9
  );
  let mint0Account = await token.getMint(connection, token0mintPubkey);
  // console.log("token0 mint pubkey::", mint0Account);

  // TOKEN1 mint 
  let token1mintPubkey = await token.createMint(
    connection,
    admin,
    admin.publicKey,
    null,
    9
  );
  let mint1Account = await token.getMint(connection, token1mintPubkey);
  // console.log("token1 mint pubkey::", mint1Account);

  // TOKEN1 mint 
  let tokenLpMintPubkey = await token.createMint(
    connection,
    admin,
    admin.publicKey,
    null,
    9
  );
  let tokenLpMintAccount = await token.getMint(connection, tokenLpMintPubkey);
  // console.log("token1 mint pubkey::", tokenLpMintPubkey);

  // ADMIN Token0 account
  let adminToken0Acc = await token.createAssociatedTokenAccount(
    connection,
    admin,
    token0mintPubkey,
    admin.publicKey
  );
  let adminToken0AccData = await token.getAccount(
    connection,
    adminToken0Acc
  );
  // console.log("TOKEN0 ACCOUNT DATA::", adminToken0AccData);

  // ADMIN Token1 account
  let adminToken1Acc = await token.createAssociatedTokenAccount(
    connection,
    admin,
    token0mintPubkey,
    admin.publicKey
  );
  let adminToken1AccData = await token.getAccount(
    connection,
    adminToken1Acc
  );
  // console.log("TOKEN1 ACCOUNT DATA::", adminToken1AccData);

  // Token0 mint
  let token0MintToAdmin = await token.mintToChecked(
    connection,
    admin,
    token0mintPubkey,
    adminToken0Acc,
    admin.publicKey,
    100,
    9
  )
  let token0Amount = await connection.getTokenAccountBalance(adminToken0Acc);
  console.log("AMOUNT::", token0Amount);
    // Token0 mint
    let token1MintToAdmin = await token.mintToChecked(
      connection,
      admin,
      token0mintPubkey,
      adminToken0Acc,
      admin.publicKey,
      100,
      9
    )
    let token1Amount = await connection.getTokenAccountBalance(adminToken0Acc);
    console.log("AMOUNT::", token1Amount);

    /// DEX ATA accounts
    const dexToken0Acc = await token.createAssociatedTokenAccount(
      connection,
      admin,
      token0mintPubkey,
      dexPDA
    )

    const dexToken1Acc = await token.createAssociatedTokenAccount(
      connection,
      admin,
      token1mintPubkey,
      dexPDA
    )

    const dexTokenLpAcc = await token.createAssociatedTokenAccount(
      connection,
      admin,
      tokenLpMintPubkey,
      dexPDA
    )

  it("initialize dex", async () => {

    const dexTx = await program.methods.initializeDex().accounts({
      authority: admin.publicKey,
      dex: dexPDA,
      mintToken0: token0mintPubkey,
      mintToken1: token1mintPubkey,
      mintLp: tokenLpMintPubkey,
      accountToken0: dexToken0Acc,
      accountToken1: dexToken1Acc,
      accountLp: dexTokenLpAcc,
      token0Program: token.TOKEN_PROGRAM_ID,
      token1Program: token.TOKEN_PROGRAM_ID,
      lpProgram: token.TOKEN_PROGRAM_ID,
    })
  });

  it("Either me or you there is nothing in between", async () => {
    
  })
});
