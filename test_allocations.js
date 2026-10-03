import assert from 'node:assert';

function calculateAllocations(items, transportFee) {
  const lineSubtotals = items.map(i => (i.qty || 0) * (i.price || 0));
  const totalSubtotal = lineSubtotals.reduce((a, b) => a + b, 0);
  const fee = transportFee || 0;

  return items.map((item, idx) => {
    const lineSubtotal = lineSubtotals[idx];
    const transportShare = totalSubtotal > 0 ? (lineSubtotal / totalSubtotal) * fee : (fee / (items.length || 1));
    const effectiveTotal = lineSubtotal + transportShare;
    const effectiveUnitCost = item.qty > 0 ? effectiveTotal / item.qty : 0;
    return {
      ...item,
      lineSubtotal,
      transportShare,
      effectiveTotal,
      effectiveUnitCost
    };
  });
}

// Test 1: Standard proportional split
{
  const items = [
    { name: 'Item A', qty: 2, price: 400 }, // subtotal: 800 (80%)
    { name: 'Item B', qty: 5, price: 30 },  // subtotal: 150 (15%)
    { name: 'Item C', qty: 1, price: 50 }   // subtotal: 50 (5%)
  ];
  const fee = 100;
  const res = calculateAllocations(items, fee);

  assert.strictEqual(res[0].lineSubtotal, 800);
  assert.strictEqual(res[0].transportShare, 80);
  assert.strictEqual(res[0].effectiveTotal, 880);
  assert.strictEqual(res[0].effectiveUnitCost, 440);

  assert.strictEqual(res[1].lineSubtotal, 150);
  assert.strictEqual(res[1].transportShare, 15);
  assert.strictEqual(res[1].effectiveTotal, 165);
  assert.strictEqual(res[1].effectiveUnitCost, 33);

  assert.strictEqual(res[2].lineSubtotal, 50);
  assert.strictEqual(res[2].transportShare, 5);
  assert.strictEqual(res[2].effectiveTotal, 55);
  assert.strictEqual(res[2].effectiveUnitCost, 55);

  const totalFeeAllocated = res.reduce((acc, r) => acc + r.transportShare, 0);
  assert.strictEqual(totalFeeAllocated, fee);
}

// Test 2: Zero total subtotal
{
  const items = [
    { name: 'Freebie 1', qty: 1, price: 0 },
    { name: 'Freebie 2', qty: 1, price: 0 }
  ];
  const fee = 50;
  const res = calculateAllocations(items, fee);
  assert.strictEqual(res[0].transportShare, 25);
  assert.strictEqual(res[1].transportShare, 25);
}

console.log('All transport fee calculation assertions passed.');
