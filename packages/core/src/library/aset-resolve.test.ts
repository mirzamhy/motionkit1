// npx tsx --test packages/core/src/library/aset-resolve.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
// @ts-ignore no @types/react-dom in this repo
import { renderToStaticMarkup } from 'react-dom/server';
import { resolveAset, suggest } from './aset-resolve';
import { Aset } from './aset';

test('suggest ranks the nearest ids first', () => {
  assert.equal(suggest('mobil-stk')[0], 'mobil-stik');
  assert.equal(suggest('mobil-stk').length, 3);
});

test('resolveAset returns the item', () => {
  assert.equal(resolveAset('mobil-stik', '2d').meta.id, 'mobil-stik');
});

test('unknown id throws with suggestions and the fix command', () => {
  assert.throws(() => resolveAset('mobil-stk', '2d'), (e: Error) => /mobil-stik/.test(e.message) && /mk aset baru <benda> <gaya>/.test(e.message));
});

test('wrong dimension throws and names what exists', () => {
  assert.throws(() => resolveAset('mobil-stik', '3d'), (e: Error) => /Item3D/.test(e.message) && /2D/.test(e.message));
});

test('<Aset> renders a known 2D item and fails on an unknown one', () => {
  const ok = renderToStaticMarkup(React.createElement('svg', null, React.createElement(Aset, { id: 'lampu-jalan-stik', x: 100, y: 400, s: 100 })));
  assert.match(ok, /<g/);
  assert.throws(() => renderToStaticMarkup(React.createElement(Aset, { id: 'nope-stik', x: 0, y: 0, s: 1 })), /nope-stik/);
});
