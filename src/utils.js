const { simpleflake } = require('simpleflakes');

function snowId() {
    const flakeBigInt = simpleflake()
    return flakeBigInt.toString();

}

module.exports = {
    snowId
}