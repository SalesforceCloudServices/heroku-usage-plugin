
/**
 * Collection of utility methods to print values
 */

/**
 * @typedef {Object} HerokuCost
 * @property {Boolean} contract - whether under contract
 * @property {Number} cents - the number of cents it costs in us dollars.
 * @property {String} unit - the units that the cost covers
 */

/**
 * Print a date
 * @param {Boolean} useIsoFormat - whether to use the ISO format or locale format
 * @param {Date} d - date to be printed
 * @returns {String} - String format of the date
 */
function printDate(useIsoFormat, d) {
  if (!d) {
    return null;
  }
  
  let value = d;
  if (!(d instanceof Date)) {
    value = new Date(d);
  }
  
  if (useIsoFormat) {
    return value.toISOString();
  } else {
    return value.toLocaleString();
  }
}

/**
 * Prints a number
 * @param {Boolean} useIsoFormat - whether to use an ISO format or locale format
 * @param {Number} n - number to be printed
 * @returns {String} - String format of the number
 */
function printNumber(useIsoFormat, n) {
  let value = n;
  if (!n) {
    value = 0;
  }

  if (useIsoFormat) {
    return `${value}`;
  } else {
    return value.toLocaleString();
  }
}

/**
 * Prints a cost plan
 * @param {String} herokuCostPlan - usually in the format `type:plan`
 * @returns {String} - the plan name from a heroku cost plan
 */
function printHerokuCostPlan(herokuCostPlan) {
  return herokuCostPlan ? herokuCostPlan.split(':').pop() : '';
}

/**
 * Prints a heroku cost
 * @param {Boolean} useIsoFormat - whether to use the ISO format or locale format
 * @param {HerokuCost} cost - the cost object
 * @returns {String} the cost price
 */
function printHerokuCostPrice(useIsoFormat, cost) {
  if (cost && cost.cents) {
    const value = cost.cents / 100;
    if (useIsoFormat) {
      return `${value}`;
    } else {
      return `$${printNumber(false, value)}`;
    }
  }
  return '';
}

/**
 * Prints the units for a heroku cost plan
 * @param {HerokuCost} cost - the cost object
 * @returns {String} the unit for the heroku cost
 */
function printHerokuCostUnit(cost) {
  if (cost) {
    if (cost.contract) {
      return 'contract';
    } else if (cost.unit) {
      return cost.unit;
    }
  }
  return '';
}

module.exports = {
  printDate,
  printNumber,
  printHerokuCostPlan,
  printHerokuCostPrice,
  printHerokuCostUnit
};
