import { ArgumentParser } from 'argparse'
import { lunaCatcher } from './lunaCatcher'
import { updateKey } from './updateKey'
import * as packageInfo from '../package.json'

function registerCommands(parser: ArgumentParser): void {
    const subparsers = parser.add_subparsers({
        title: `commands`,
        dest: `subparser_name`,
        description: `Available commands`,
    });

    // Voting command
    const tryCatchCommand = subparsers.add_parser(`trycatch`, {
        add_help: true,
        description: `Check periodically account balance and if Luna balance is greater then 0 trying to move Luna to specified wallet.`,
    });

    tryCatchCommand.add_argument(`--lcd`, {
        action: 'append',
        help: 'lcd address',
        dest: 'lcdAddress',
        required: true,
    });

    tryCatchCommand.add_argument(`--chain-id`, {
        action: `store`,
        help: `chain ID`,
        dest: `chainID`,
        required: true,
    });

    tryCatchCommand.add_argument(`--target-account`, {
        action: `store`,
        help: `target account (wallet) address (e.g. terra1j27...), `,
        required: true,
        dest: 'targetAccount',
    });

    tryCatchCommand.add_argument(`--password`, {
        action: `store`,
        help: `encrypted key password`,
        required: true,
    });

    tryCatchCommand.add_argument(`--key-path`, {
        action: `store`,
        help: `key store path to save encrypted key`,
        dest: `keyPath`,
        required: false,
    });

    tryCatchCommand.add_argument('--key-name', {
        help: `name of the key`,
        dest: `keyName`,
        default: `sourceWallet`,
    });

    tryCatchCommand.add_argument('--fee', {
        action: 'store',
        help: 'the transaction fee',
        dest: 'fee',
        required: false,
        default: 0.1,
    });
    tryCatchCommand.add_argument('--wait-interval', {
        action: 'store',
        help: 'the number of seconds between transfer attempts',
        dest: 'waitInterval',
        required: false,
        default: 2,
    });

    tryCatchCommand.add_argument('-v', '--version', { action: 'version', version: packageInfo.version });

    // Updating Key command
    const keyCommand = subparsers.add_parser(`update-key`, { add_help: true });

    keyCommand.add_argument(`--key-path`, {
        help: `key store path to save encrypted key`,
        dest: `keyPath`,
        default: `sourceWallet.json`,
    });
    keyCommand.add_argument('--key-name', {
        help: `name of the key`,
        dest: `keyName`,
        default: `sourceWallet`,
    });
}

async function main(): Promise<void> {
    const parser = new ArgumentParser({
        add_help: true,
        description: `Trying to catch Luna in wallet`,
    });

    registerCommands(parser);
    const args = parser.parse_args();

    if (args.subparser_name === `trycatch`) {

        if (args.lcdAddress.length === 0) {
            console.error('Missing --lcd');
            return;
        }

        if (args.chainID.length === 0) {
            console.error('Missing --chain-id');
            return;
        }

        args.keyPath = args.keyPath || process.env['KEY_PATH'] || 'sourceWallet.json';

        args.password = args.password || process.env['PASSPHRASE'] || '';
        if (args.keyPath === '' || args.passphrase === '') {
            console.error('Missing either --key-path or --password');
            return;
        }

        await lunaCatcher(args);
    } else if (args.subparser_name === `update-key`) {
        await updateKey(args.keyPath, args.keyName);
    }
}

main().catch((e) => {
    console.error(e);
});