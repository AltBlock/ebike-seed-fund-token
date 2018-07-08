# Smart Contract for EBIKE PrivateSale
ERC20 Tokens EBIKE and Private Sale

### totalTokens = 4 millions

## Functions
  ### **Only Owner can call these functions**  
  **Add Adddress to whitelist** `addToWhitelist(address)`  
  **Add List of addresses to whitelist** `addManyToWhitelist(listOfAddresses)`  
  **Add address from whitelist** `removeFromWhitelist(address)`  
  **Set new OpeningTime** `setOpeningTime(newOpeningTime)`  
  **Set new ClosingTime** `setClosingTime(newsetClosingTime)`  
  **Finish Private Sale** `FinishPrivateSale()`  


### Depenencies

```bash
# Install Truffle and testrpc packages globally:
$ npm install -g truffle ganache-cli

# Install local node dependencies:
$ npm install
````

### Test

```bash
# Initialize a testrpc instance
$ ./scripts/testrpc.sh

# This will compile and test the contracts using truffle
$ truffle test

# Enable long tests
$ LONG_TESTS=1 truffle test
