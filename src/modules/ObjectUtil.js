
/**
 * Collection of pointfree utility methods
 */

/**
 * @typedef {Object} DuplicateResult
 * @property {Set} unique - collection of unique values
 * @property {Set} duplicates - collection of duplicate values
 **/

/**
 * Finds the list of duplicates in a collection
 * @param {any[]} a - the array to evaluate
 * @returns {DuplicateResult} - set of unique and duplicate values
 */
const findDuplicates = (a) => a.reduce((results, item) => {
  if (results.unique.has(item)) {
    results.duplicates.add(item);
  } else {
    results.unique.add(item);
  }
  return results;
}, {unique: new Set(), duplicates: new Set()});

/**
 * @typedef {Object} DuplicateCountResult
 * @property {any} value - the value found
 * @property {Number} count - the number of times that value was found
 */

/**
 * Determines the unique set of values in an array
 * and the number of times they appear in the list
 * @param {any[]} a - the array to evaluate
 * @returns {DuplicateCountResult[]} - array of values and how often they were found
 */
const countDuplicates = (a) => a.reduce((results, item) => {
  let match = results.find((counter) => counter.value === item);
  if (!match) {
    match = {value: item, count: 0};
    results.push(match);
  }
  match.count++;
  return results;
}, []);

/**
 * @typeodef {Object} DiffObjectResult
 * @property {String} key - the property key found (on either left or right)
 * @property {Boolean} matches - whether the value is identical on the left or right
 * @property {any} leftVal - the value on the left
 * @property {any} rightVal - the value on the right
 */

/**
 * Determines the properties between two objects
 * @param {Object} left - left object
 * @param {Object} right - right object
 * @returns {DiffObjectResult[]} - collection of properties and whether they match
 */
const diffObj = (left, right) => [...new Set([...Object.keys(left), ...Object.keys(right)])]
  .map((key) => ({
    key,
    matches: JSON.stringify(left[key]) === JSON.stringify(right[key]),
    leftVal: left[key],
    rightVal: right[key]
  }));

/**
 * Determines which objects in a collection are unique based on a applied function.
 * 
 * For example: findUnique((o) => o.a, [{a:'0'}, {a:'1'}, {a:'1'}]
 * provides: [{a:'0'}, {a:'1'}]
 * 
 * @param {Function} fn - function applies to the object to determine a unique value
 * @param {Object[]} a - array of objects
 * @returns {Object[]} - collection of objects in a that are considered unique based on the fn
 */
const findUnique = (fn, a) => {
  const uniqueKeys = new Set();
  return a.reduce((results, item) => {
    const key = fn(item);
    if (!uniqueKeys.has(key)) {
      uniqueKeys.add(key);
      results.push(item);
    }
    return results;
  }, []);
};

module.exports = {
  findDuplicates,
  countDuplicates,
  diffObj,
  findUnique
};
