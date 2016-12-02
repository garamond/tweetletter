import Twit from 'twit';
import * as lib from './src/lib'

const { api } = lib.readJson('config.json');
const twitter = new Twit(api);

function writeStatus(id, prefix='.') {
  twitter.get('statuses/show', { id })
    .then(res => {
      lib.writeJson(`${prefix}/${id}.json`, res)
      console.log(`status ${id} written`)
    })
}

writeStatus(process.argv[2])