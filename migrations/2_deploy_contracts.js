const duration = {
    seconds: function (val) { return val; },
    minutes: function (val) { return val * this.seconds(60); },
    hours: function (val) { return val * this.minutes(60); },
    days: function (val) { return val * this.hours(24); },
    weeks: function (val) { return val * this.days(7); },
    years: function (val) { return val * this.days(365); },
};

const EbikePrivateSale = artifacts.require('./EbikePrivateSale.sol');
const EbikeToken = artifacts.require('./EbikeToken');

module.exports = function (deployer, network, accounts) {
    // Rate for private Sale 14000
    const rate = 14000;
    const wallet = accounts[0];
    // Set StartingTime to 24 hrs from now.
    const startTime = Math.round((new Date(Date.now() + 86400000).getTime()) / 1000);
    // Set ClosingTime to 90 days from StartingTime
    const endTime = startTime + duration.days(90);
    return deployer
        .then(() => {
            return deployer.deploy(EbikeToken);
        })
        .then(() => {
            return deployer.deploy(
                EbikePrivateSale,
                startTime,
                endTime,
                rate,
                wallet,
                EbikeToken.address
            );
        })
        .catch(error => {
            console.log(error)
        })
};