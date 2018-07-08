const ether = require("./helpers/ether").ether;
const Block = require('./helpers/advanceToBlock');
const Times = require('./helpers/increaseTime');
const latestTime = require('./helpers/latestTime').latestTime;
const EVMRevert = 'revert'

const duration = Times.duration;
const increaseTimeTo = Times.increaseTimeTo;

const advanceBlock = Block.advanceBlock;
const advanceToBlock = Block.advanceToBlock;

const BigNumber = web3.BigNumber;

const should = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

const EbikePrivateSale = artifacts.require('EbikePrivateSale');
const EbikeToken = artifacts.require('EbikeToken');

contract("EbikePrivateSale", function ([owner, investor, wallet, authorized, unauthorized, anotherAuthorized]) {

    const rate = new BigNumber(14000);
    const tokenSupply = new BigNumber('4e24');
    const value = ether(1);
    const expectedTokenAmount = rate.mul(value);
    const cap = tokenSupply.mul(rate);

    before(async function () {
        // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
        await advanceBlock();
    });



    describe('Contract functionality', function () {

        beforeEach(async function () {
            this.openingTime = latestTime() + duration.weeks(1);
            this.closingTime = this.openingTime + duration.weeks(4);
            this.token = await EbikeToken.new({ from: owner });
            this.crowdsale = await EbikePrivateSale.new(this.openingTime, this.closingTime, rate, wallet, this.token.address);
            // Transfer token to Crowdsale Address
            await this.token.transfer(this.crowdsale.address, tokenSupply);
            const _balance = await this.token.balanceOf(this.crowdsale.address);
            _balance.should.be.bignumber.equal(tokenSupply);
        })

        it('should create privateSale with correct parameters', async function () {
            this.token.should.exist;
            this.crowdsale.should.exist;

            const openingTime = await this.crowdsale.openingTime();
            const closingTime = await this.crowdsale.closingTime();
            const _rate = await this.crowdsale.rate();
            // const _cap = await this.crowdsale.cap();
            // const totalTokenForSale = await this.crowdsale.totalTokenForSale();

            openingTime.should.be.bignumber.equal(this.openingTime);
            closingTime.should.be.bignumber.equal(this.closingTime);
            _rate.should.be.bignumber.equal(rate);
            // totalTokenForSale.should.be.bignumber.equal(tokenSupply);
            // _cap.should.be.bignumber.equal(cap);
        })

        it('should not allow other to update openingTime', async function () {
            const _time = latestTime() + duration.weeks(1);
            await this.crowdsale.setOpeningTime(_time, { from: investor }).should.be.rejected;
        })

        it('should allow owner to update openingTime', async function () {
            const _openingTime = latestTime() + duration.weeks(1);
            await this.crowdsale.setOpeningTime(_openingTime, { from: owner }).should.be.fulfilled;
            const _currentOpeningTime = await this.crowdsale.openingTime.call();

            _currentOpeningTime.should.be.bignumber.equal(_openingTime);
        })

        it('should not allow other to update closingTime', async function () {
            const _time = latestTime() + duration.weeks(4);
            await this.crowdsale.setClosingTime(_time, { from: investor }).should.be.rejected;
        })

        it('should allow owner to update closingTime', async function () {
            const _closingTime = latestTime() + duration.weeks(4);
            await this.crowdsale.setClosingTime(_closingTime, { from: owner }).should.be.fulfilled;
            const _currentClosingTime = await this.crowdsale.closingTime.call();
            _currentClosingTime.should.be.bignumber.equal(_closingTime);
        })
    })


    describe('whitelisting feature', function () {
        describe('single user whitelist', function () {
            beforeEach(async function () {
                this.openingTime = latestTime() + duration.seconds(1);
                this.closingTime = this.openingTime + duration.weeks(5);
                this.token = await EbikeToken.new({ from: owner });
                this.crowdsale = await EbikePrivateSale.new(this.openingTime, this.closingTime, rate, wallet, this.token.address);
                // Transfer token to Crowdsale Address
                await this.token.transfer(this.crowdsale.address, tokenSupply);
                const _balance = await this.token.balanceOf(this.crowdsale.address);
                _balance.should.be.bignumber.equal(tokenSupply);
                // Add a account to whiteList, account = authorized
                await this.crowdsale.addToWhitelist(authorized);
            })

            describe('reporting whitelisted', function () {
                it('should correctly report whitelisted addresses', async function () {
                    let isAuthorized = await this.crowdsale.whitelist(authorized);
                    isAuthorized.should.equal(true);
                    let isntAuthorized = await this.crowdsale.whitelist(unauthorized);
                    isntAuthorized.should.equal(false);
                });
            });

            describe('accepting payments', function () {
                it('should accept payments to whitelisted (from whichever buyers)', async function () {
                    const investmentAmount = ether(1);
                    await this.crowdsale.buyTokens(authorized, { value: investmentAmount, from: authorized }).should.be.fulfilled;
                    await this.crowdsale.buyTokens(authorized, { value: investmentAmount, from: unauthorized }).should.be.fulfilled;
                });

                it('should reject payments to not whitelisted (from whichever buyers)', async function () {
                    const investmentAmount = ether(1);
                    await this.crowdsale.buyTokens(unauthorized, { value: investmentAmount, from: authorized }).should.be.rejected;
                    await this.crowdsale.buyTokens(unauthorized, { value: investmentAmount, from: unauthorized }).should.be.rejected;
                })

                it('should reject payments to addresses removed from whitelist', async function () {
                    await this.crowdsale.removeFromWhitelist(authorized);
                    await this.crowdsale.buyTokens(authorized, { value: value, from: authorized }).should.be.rejected;
                });
            })
        })

        describe('many user whitelisting', function () {
            beforeEach(async function () {
                this.openingTime = latestTime() + duration.seconds(1);
                this.closingTime = this.openingTime + duration.weeks(5);
                this.token = await EbikeToken.new({ from: owner });
                this.crowdsale = await EbikePrivateSale.new(this.openingTime, this.closingTime, rate, wallet, this.token.address);
                // Transfer token to Crowdsale Address
                await this.token.transfer(this.crowdsale.address, tokenSupply);
                const _balance = await this.token.balanceOf(this.crowdsale.address);
                _balance.should.be.bignumber.equal(tokenSupply);
                // Add a account to whiteList, account = authorized
                await this.crowdsale.addManyToWhitelist([authorized, anotherAuthorized]);
            })

            describe('accepting payments', function () {
                it('should accept payments to whitelisted (from whichever buyers)', async function () {
                    await this.crowdsale.buyTokens(authorized, { value: value, from: authorized }).should.be.fulfilled;
                    await this.crowdsale.buyTokens(authorized, { value: value, from: unauthorized }).should.be.fulfilled;
                    await this.crowdsale.buyTokens(anotherAuthorized, { value: value, from: authorized }).should.be.fulfilled;
                    await this.crowdsale.buyTokens(anotherAuthorized, { value: value, from: unauthorized }).should.be.fulfilled;
                });

                it('should reject payments to not whitelisted (with whichever buyers)', async function () {
                    await this.crowdsale.send(value).should.be.rejected;
                    await this.crowdsale.buyTokens(unauthorized, { value: value, from: unauthorized }).should.be.rejected;
                    await this.crowdsale.buyTokens(unauthorized, { value: value, from: authorized }).should.be.rejected;
                });

                it('should reject payments to addresses removed from whitelist', async function () {
                    await this.crowdsale.removeFromWhitelist(anotherAuthorized);
                    await this.crowdsale.buyTokens(authorized, { value: value, from: authorized }).should.be.fulfilled;
                    await this.crowdsale.buyTokens(anotherAuthorized, { value: value, from: authorized }).should.be.rejected;
                });
            });

            describe('reporting whitelisted', function () {
                it('should correctly report whitelisted addresses', async function () {
                    let isAuthorized = await this.crowdsale.whitelist(authorized);
                    isAuthorized.should.equal(true);
                    let isAnotherAuthorized = await this.crowdsale.whitelist(anotherAuthorized);
                    isAnotherAuthorized.should.equal(true);
                    let isntAuthorized = await this.crowdsale.whitelist(unauthorized);
                    isntAuthorized.should.equal(false);
                });
            });
            
        })
    })
})