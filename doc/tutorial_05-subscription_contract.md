# Part 5 of Helios tutorial: Subscription contract
A subscription contract allows a beneficiary to withdraw a pre-specified amount from a script address at regular intervals.
The owner can cancel the contract at any time.

This contract can alternatively be called an 'allowance' contract.

## The script
```golang
validator subscription

struct Datum {
    owner:            PubKeyHash
    beneficiary:      PubKeyHash
    total:            Value // remaining Value locked in script
    benefit:          Value 
    after:            Time  // must be incremented by 'interval' every time beneficiary withdraws
    interval:         Duration
}

func main(datum: Datum, ctx: ScriptContext) -> Bool {
    tx: Tx = ctx.tx;

    if (tx.is_signed_by(datum.owner)) {
        true
    } else if (tx.is_signed_by(datum.beneficiary)) {
        now: Time = tx.now();
        if (now >= datum.after) {
             if (datum.benefit >= datum.total) {
                true
             } else {
                current_hash: ValidatorHash = ctx.get_current_validator_hash();

                expected_remaining: Value = datum.total - datum.benefit;

                expected_datum: Datum = Datum{
                    owner:       datum.owner,
                    beneficiary: datum.beneficiary,
                    total:       expected_remaining,
                    benefit:     datum.benefit,
                    after:       datum.after + datum.interval,
                    interval:    datum.interval
                };

                actual_remaining: Value = tx.value_locked_by_datum(currentHash, expectedDatum);

                if ((print("actualRemaining: "  + show(getValueComponent(actualRemaining, AssetClass(MintingPolicyHash(#), "")))   + " lovelace"); actualRemaining) >= 
                    (print("expectedRemaining " + show(getValueComponent(expectedRemaining, AssetClass(MintingPolicyHash(#), ""))) + " lovelace"); expectedRemaining))
                {
                    true
                } else {
                    print("too much"); false
                }
             }
        } else {
            print("too soon"); false
        }
    } else {
        print("unauthorized"); false
    }
}
```

We will use the `PubKeyHash` of wallet 2 as the beneficiary:
```bash
$ docker exec -it <container-id> bash

> cardano-cli address key-hash --payment-verification-key-file /data/wallets/wallet2.vkey
```

We can generate the datum similarly to the Time Lock example.

Now let's send 4 tAda to the script address using the datum we just generated:
```bash
$ docker exec -it <container-id> bash

> cardano-cli query utxo \
  --address $(cat /data/wallets/wallet1.addr) \
  --testnet-magic $TESTNET_MAGIC_NUM

...
# take note of a UTXO big enough to cover 2 tAda + fees

> DATUM1=$(mktemp)
> echo '{"constructor": 0, ...}' > $DATUM1

> DATUM1_HASH=$(cardano-cli transaction hash-script-data --script-data-file $DATUM1)

> TX_BODY=$(mktemp)
> cardano-cli transaction build \
  --tx-in <funding-utxo> \
  --tx-out $(cat /data/scripts/subscription.addr)+4000000 \
  --tx-out-datum-hash $DATUM1_HASH \
  --change-address $(cat /data/wallets/wallet1.addr) \
  --testnet-magic $TESTNET_MAGIC_NUM \
  --out-file $TX_BODY \
  --babbage-era

Estimated transaction fee: Lovelace 167217

> TX_SIGNED=$(mktemp)
> cardano-cli transaction sign \
  --tx-body-file $TX_BODY \
  --signing-key-file /data/wallets/wallet1.skey \
  --testnet-magic $TESTNET_MAGIC_NUM \
  --out-file $TX_SIGNED

> cardano-cli transaction submit \
  --tx-file $TX_SIGNED \
  --testnet-magic $TESTNET_MAGIC_NUM

Transaction successfully submitted
```

As before, query the script address until we see the UTXO appear:
```bash
> cardano-cli query utxo --address $(cat /data/scripts/subscription.addr) --testnet-magic $TESTNET_MAGIC_NUM
```

First we will try to retrieve all the funds using wallet 1:
```bash
> PARAMS=$(mktemp) # most recent protocol params
> cardano-cli query protocol-parameters --testnet-magic $TESTNET_MAGIC_NUM > $PARAMS

> TX_BODY=$(mktemp)
> cardano-cli transaction build \
  --tx-in <fee-utxo> \ # used for tx fee
  --tx-in <script-utxo> \
  --tx-in-datum-file $DATUM1 \
  --tx-in-redeemer-value <arbitrary-redeemer-data> \
  --tx-in-script-file /data/scripts/subscription.json \
  --tx-in-collateral <fee-utxo> \ # used for script collateral
  --invalid-before <current-slot-no> \
  --required-signer /data/wallets/wallet1.skey \
  --change-address $(cat /data/wallets/wallet1.addr) \
  --tx-out $(cat /data/wallets/wallet1.addr)+4000000 \
  --out-file $TX_BODY \
  --testnet-magic $TESTNET_MAGIC_NUM \
  --protocol-params-file $PARAMS \
  --babbage-era

Estimated transaction fee: Lovelace ...

> TX_SIGNED=$(mktemp)
> cardano-cli transaction sign \
  --tx-body-file $TX_BODY \
  --signing-key-file /data/wallets/wallet1.skey \
  --testnet-magic $TESTNET_MAGIC_NUM \
  --out-file $TX_SIGNED

> cardano-cli transaction submit \
  --tx-file $TX_SIGNED \
  --testnet-magic $TESTNET_MAGIC_NUM

Transaction successfully submitted
```

Next we need to test a beneficiary withdrawing from the subscription (doing this too soon, or with too much money, or with a wrong signature should fail the transaction):
```bash
> PARAMS=$(mktemp) # most recent protocol params
> cardano-cli query protocol-parameters --testnet-magic $TESTNET_MAGIC_NUM > $PARAMS

> DATUM2=$(mktemp)
> echo '{"constructor": 0, ...}' > $DATUM2 # like DATUM1, but deadline set to further in the future, and smaller total

> DATUM2_HASH=$(cardano-cli transaction hash-script-data --script-data-file $DATUM2)

> TX_BODY=$(mktemp)
> cardano-cli transaction build \
  --tx-in <fee-utxo> \ # used for tx fee
  --tx-in <script-utxo> \
  --tx-in-datum-file $DATUM1 \
  --tx-in-redeemer-value <arbitrary-redeemer-data> \
  --tx-in-script-file /data/scripts/subscription.json \
  --tx-in-collateral <fee-utxo> \ # used for script collateral
  --invalid-before <current-slot-no> \
  --required-signer /data/wallets/wallet2.skey \
  --change-address $(cat /data/wallets/wallet2.addr) \
  --tx-out $(cat /data/wallets/wallet2.addr)+2000000 \
  --tx-out $(cat /data/scripts/subscription.addr)+2000000 \
  --tx-out-datum-embed-file $DATUM2 \
  --out-file $TX_BODY \
  --testnet-magic $TESTNET_MAGIC_NUM \
  --protocol-params-file $PARAMS \
  --babbage-era

Estimated transaction fee: Lovelace ...

> TX_SIGNED=$(mktemp)
> cardano-cli transaction sign \
  --tx-body-file $TX_BODY \
  --signing-key-file /data/wallets/wallet2.skey \
  --testnet-magic $TESTNET_MAGIC_NUM \
  --out-file $TX_SIGNED

> cardano-cli transaction submit \
  --tx-file $TX_SIGNED \
  --testnet-magic $TESTNET_MAGIC_NUM

Transaction successfully submitted
```

At a later stage the beneficiary can withdraw the rest of the value locked in the contract. The commands for creating and submitting this second transaction are nearly identical to the commands above, except for other datums. 
