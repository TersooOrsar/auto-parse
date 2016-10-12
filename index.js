module.exports = parse

var _ = require('lodash')

function stripTrimLower (value) {
  return _.replace(_.trim(_.toLower(value)), /[""'']/ig, '')
}
function isBoolean (value) {
  return !(checkBoolean(value) === null) // ? true : false
}

function toBoolean (value) {
  return checkBoolean(value)
}

function checkBoolean (value) {
  if (!value) {
    return false
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return !!value
  }
  value = stripTrimLower(value)
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === '1') return true
  if (value === '0') return false
  return null
}
function parseObject (value) {
  if (_.isArray(value)) {
    return _.map(value, function (n, key) {
      return parse(n)
    })
  } else {
    return _.forIn(value, function (n, key) {
      value[key] = parse(n)
    })
  }
}
function parseFunction (value) {
  return parse(value())
}
function parseType (value, type) {
  // Currently they send a string - handle String or Number or Boolean?

  type = stripTrimLower(type)
  if (type === 'string') {
    // Thoughts on handling NULL & Undefined
    if (typeof value === 'object') return JSON.stringify(value)
    return _.toString(value)
  }
  if (type === 'function') {
    return parseFunction(value)
  }
  if (type === 'object') {
    var jsonParsed = null
    try {
      jsonParsed = JSON.parse(value)
    } catch (e) {}

    if (jsonParsed && typeof jsonParsed === 'object') {
      return parse(jsonParsed)
    }
    return parseObject(value)
  }
  if (type === 'boolean') {
    return toBoolean(value)
  }
  if (type === 'number') {
    return _.toNumber(value)
  }
  if (type === 'undefined') {
    return undefined
  }
  if (type === 'null') {
    return null
  }
}
function parse (value, type) {
  if (type) {
    return parseType(value, type)
  }
  var orignalValue = value
  // PRE RULE - check for null be cause null can be typeof object which can  through off parsing
  if (value === null) {
    return null
  }
  // TYPEOF SECTION - Use to check and do specific things based off of know the type
  if (typeof value === 'undefined') {
    return undefined
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'function') {
    return parseFunction(value)
  }
  if (typeof value === 'object') {
    return parseObject(value)
  }

  // STRING SECTION - If we made it this far that means it is a string that we must do something with to parse
  if (value === 'NaN') {
    return NaN
  }

  var jsonParsed = null
  try {
    jsonParsed = JSON.parse(value)
  } catch (e) {}

  if (jsonParsed && typeof jsonParsed === 'object') {
    return parse(jsonParsed)
  }

  value = stripTrimLower(value)
  var num = _.toNumber(value)
  var boo = toBoolean(value)
  var string = _.toString(orignalValue)
  if (value === 'undefined' || value === '') {
    return undefined
  }
  if (value === 'null') {
    return null
  }
  // Order Matter because if it is a one or zero boolean will come back with a awnser too. if you want it to be a boolean you must specify
  if (!_.isNaN(num) && _.isNumber(num)) {
    return num
  }
  if ((boo === true || boo === false) && isBoolean(value)) {
    return boo
  }
  // DEFUALT SECTION - bascially if we catch nothing we assume that you just have a string
  return string
}
