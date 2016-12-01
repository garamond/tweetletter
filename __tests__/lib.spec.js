const lib = require('../src/lib.js');

function tmpFile() {
  return `/tmp/jest-${Math.random()}`
}

test('read and write json', () => {
  const data = {foo: 2}
  const tmp = tmpFile()
  lib.writeJson(tmp, data)
  const res = lib.readJson(tmp)
  expect(res).toEqual(data);
});

test('read and write state', () => {
  const tmp = tmpFile()
  var state = lib.readState(tmp)
  state.foo = 'bar'
  lib.writeJson(tmp, state)
  var res = lib.readState(tmp)
  expect(res).toEqual(state);
});

test('process retweet', () => {
  const retweet = lib.readJson('__tests__/retweet.json')
  const res = lib.expandRetweet(retweet)
  expect(res.text).toEqual('RT @openculture: Hear a 20-Hour Playlist Featuring the Experimental Music of Composer Pauline Oliveros (RIP) https://t.co/7Dse56OGkr https://t.co/dbjhqpBmtU');  
})

test('process links', () => {
  const links = lib.readJson('__tests__/links.json')
  const res = lib.expandLinks(links)
  expect(res.text).toEqual('Pauline Oliveros, RIP. MP3 archive: http://www.ubu.com/sound/oliveros.html 1975 interview &amp; performance w/Robert Ashley (2hrs):… https://twitter.com/i/web/status/802735721224146944')
})
