import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const root = fs.readFileSync('index.html', 'utf8');
const page = fs.readFileSync('public/index.html', 'utf8');
const accountApi = fs.readFileSync('public/account-api.js', 'utf8');
const dashboard = fs.readFileSync('public/dashboard.js', 'utf8');

test('GitHub Pages root enters the public dashboard', () => {
  assert.match(root, /\.\/public\//);
});

test('project Pages uses relative CSS and JS asset paths', () => {
  assert.match(page, /href="\.\/styles\.css"/);
  assert.match(page, /src="\.\/app\.js"/);
  assert.doesNotMatch(page, /href="\/styles\.css"/);
  assert.doesNotMatch(page, /src="\/app\.js"/);
});

test('two-account API client uses the official character list endpoint', () => {
  assert.match(accountApi, /\/character\/list/);
  assert.match(accountApi, /x-nxopen-api-key/);
  assert.match(accountApi, /sessionStorage/);
  assert.match(accountApi, /localStorage/);
});

test('dashboard preserves two separate account slots and selected character state', () => {
  assert.match(dashboard, /account1/);
  assert.match(dashboard, /account2/);
  assert.match(dashboard, /selectedCharacter/);
  assert.match(dashboard, /syncAccountCharacters/);
});
