# Terra Luna Catcher
This source code is used to catches the Luna falling into the wallet and forwards it on to desired wallet.
How it can be used is totally up to you.

## DISCLAIMER

YOU USE THE SOURCE CODE AT YOUR OWN RISK. YOU ACKNOWLEDGE AND AGREE THAT YOU ARE RESPONSIBLE FOR YOUR USE OF THE SOURCE CODE PROVIDED AND WE DISCLAIM ANY LIABILITY ARISING FROM YOUR USE OF THIS SOURCE CODE.

## Overview

This code periodically checks the balance (LUNA token only) of the source wallet for which you have a mnemonic phrase. If an amount equal to 1 Luna or more appears on the source wallet, then the code automatically and unconditionally transfers almost the entire amount to the target wallet that was specified at the start of this script.
The main source of inspiration was ([this code](https://github.com/terra-money/oracle-feeder)). 

### WARNING

The script does not check that the target wallet belongs to you, therefore, when you run the script, ALWAYS check the address of the target wallet. 
We are NOT RESPONSIBLE if the script sends money to the wrong address.
We recommend that you check the script by sending a small amount to the source wallet to make sure that the transfer is being made to the target wallet you need.


## Prerequisites

- Install [Node.js version 14 or greater](https://nodejs.org/)

## Instructions

1. Clone this repository

```sh
git clone https://github.com/Luna-Station-88/terra-luna-catcher
cd terra-luna-catcher
```

2. Install dependencies

```sh
npm install
```

2. Create access key for source wallet from your mnemonic phrase

To access the wallet and make a transfer, the code needs a mnemonic phrase, this phrase will be encrypted with the password you specify.
You will need this password to run the script.

```sh
npm start update-key

Enter a passphrase to encrypt your key to disk: ********
Repeat the passphrase: ********
Enter your bip39 mnemonic : <some nice mnemonic>
saved!
✨  Done in 9.19s.
```

3. Catching the Luna

Now you can start catching process using arguments*.


   ``` shell
   $ npm start trycatch -- \
      --chain-id columbus-5 \
      --lcd https://terra-lcd.easy2stake.com/ \
	  --lcd https://lcd.terra.dev \
      --target-account terra1yxABCDEFGH  \
      --password "<password>"  	  
   ```

* Arguments
   
| Argument    | Description                                       | Example                      |
| ----------- | ------------------------------------------------  | ---------------------------- |
| `target-account`  | Target wallet address                       | terra1j27nm2gjm0m4lsye8lspa46rax0rw4fge9awrs |
| `lcd`       |  LCD server URL (can be multiple)                 | https://lcd.terra.dev        |
| `chain-id`  |  Chain ID.                                        | `columbus-5` or `bombay-12`               |
| `password`  | Password for mnemonic (assigned in step #2)       | `12345678`                   |
