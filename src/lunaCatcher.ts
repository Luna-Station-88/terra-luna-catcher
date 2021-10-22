import * as crypto from 'crypto'
import * as Bluebird from 'bluebird'
import * as promptly from 'promptly'
import * as ks from './keystore'
import {
    LCDClient,
    RawKey,
    Wallet,
    Fee,
    isTxError,
    LCDClientConfig,
    MsgSend,
    Coin
} from '@terra-money/terra.js'
import * as packageInfo from '../package.json'


async function initKey(keyPath: string, password?: string): Promise<RawKey> {
    const plainEntity = ks.load(
        keyPath,
        'sourceWallet',
        password || (await promptly.password(`Enter a passphrase:`, { replace: `*` }))
    );

    return new RawKey(Buffer.from(plainEntity.privateKey, 'hex'));
}


// yarn start catch command
export async function processCatch(
    client: LCDClient,
    wallet: Wallet,
    sourceAccount: string,
    targetAccount: string
): Promise<void> {
    
    // Print timestamp before start
    console.info(`${new Date().toUTCString()}, checking account balance...`);

    const balance = await client.bank.balance(sourceAccount);
    const ulunaBalance = balance[0].get("uluna");
    
    if (ulunaBalance) {

        var accountBalanceAsNumber = Number(ulunaBalance.amount);

        console.dir(`Current balance: ${accountBalanceAsNumber}uluna `);

        if (accountBalanceAsNumber >= 500000) {

            console.dir(`Balance is higher or equal to 1 Luna, trying to transfer to target account...`);

            const fee = 100000;
            const amountToTransfer = accountBalanceAsNumber - fee;

            console.dir(`Amount to transfer ${amountToTransfer}uluna`);

            // create a simple message that moves coin balances
            const send = new MsgSend(
                sourceAccount,
                targetAccount,
                { uluna: amountToTransfer }
            );

            // sign and send
            const msgs = [send];
            const tx = await wallet.createAndSignTx({
                msgs,
                fee: new Fee(100000, [new Coin("uluna", fee)]),
                memo: `Don't be evil. Funds rescue powered by Luna Station 88.`,
            });

            const res = await client.tx.broadcastSync(tx).catch((err) => {
                console.error(`broadcast error: ${err.message}`, tx.toData());
                throw err;
            });

            if (isTxError(res)) {
                console.error(`broadcast error: code: ${res.code}, raw_log: ${res.raw_log}`);
                return;
            }

            const txhash = res.txhash;
            console.info(`broadcast success: txhash: ${txhash}`);

            await Bluebird.delay(3000);
        }
    }
}

interface TryCatchArgs {
    lcdAddress: string[];
    chainID: string;
    targetAccount: string;
    sourceAccount: string;
    password: string;
    keyPath: string;
}

function buildLCDClientConfig(args: TryCatchArgs, lcdIndex: number): LCDClientConfig {
    return {
        URL: args.lcdAddress[lcdIndex],
        chainID: args.chainID,
    };
}

export async function lunaCatcher(args: TryCatchArgs): Promise<void> {
    const rawKey: RawKey = await initKey(args.keyPath, args.password);
    const targetAccount = args.targetAccount;
    const sourceAccount = rawKey.accAddress;

    const lcdRotate = {
        client: new LCDClient(buildLCDClientConfig(args, 0)),
        current: 0,
        max: args.lcdAddress.length - 1,
    };
    console.log(`Starting ...`);
    console.log(`Source account (will be periodically checked for Luna): ${sourceAccount}`);
    console.log(`Target account (Luna will be send to this address if any Luna exists in source account): ${targetAccount}`);

    while (true) {

        await processCatch(
            lcdRotate.client,
            lcdRotate.client.wallet(rawKey),
            sourceAccount,
            targetAccount
        ).catch((err) => {
            if (err.isAxiosError && err.response) {
                console.error(err.message, err.response.data);
            } else {
                console.error(err.message);
            }

            if (err.isAxiosError) {
                console.info('vote: lcd client unavailable, rotating to next lcd client.');
                rotateLCD(args, lcdRotate);
            }
        });

        await Bluebird.delay(2000);
    }
}

function rotateLCD(args: TryCatchArgs, lcdRotate: { client: LCDClient; current: number; max: number }) {
    if (++lcdRotate.current > lcdRotate.max) {
        lcdRotate.current = 0;
    }

    lcdRotate.client = new LCDClient(buildLCDClientConfig(args, lcdRotate.current));
    console.info(
        'Switched to LCD address ' + lcdRotate.current + '(' + args.lcdAddress[lcdRotate.current] + ')'
    );

    return;
}

