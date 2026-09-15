const test = require('node:test');
const assert = require('node:assert/strict');

const { calculateLoanStats, formatINR } = require('./script.js');

test('calculateLoanStats returns expected EMI values', () => {
  const result = calculateLoanStats(1000000, 8.5, 5);

  assert.ok(result.emi > 0);
  assert.ok(result.totalPayment > result.principal);
  assert.ok(result.totalInterest > 0);
  assert.equal(Math.round(result.emi), 20517);
  assert.equal(Math.round(result.totalPayment), 1231046);
});

test('formatINR formats values in INR', () => {
  assert.equal(formatINR(20279), '₹20,279');
});
