const utils = require('../src/io.js');

function tmpFile() {
  return `/tmp/jest-${Math.random()}`
}

test('read and write json', () => {
  const data = {foo: 2}
  const tmp = tmpFile()
  utils.writeJson(tmp, data)
  const res = utils.readJson(tmp)
  expect(res).toEqual(data);
});