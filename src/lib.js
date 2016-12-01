import fs from 'fs';
import R from 'ramda';

export function expandRetweet(tweet: Object) {
  if (tweet.retweeted_status) {
    return R.assoc('text', 
                   `RT @${tweet.retweeted_status.user.screen_name}: ${tweet.retweeted_status.text}`,
                   tweet);
  } else {
    return tweet;
  }
}

export function expandLinks(tweet: Object) {
  const urls = R.concat(R.pathOr([], ['entities', 'urls'], tweet),
                        R.pathOr([], ['retweeted_status', 'entities', 'urls'], tweet))
  var res = tweet.text
  urls.forEach( url => {
    res = R.replace(url.url, url.expanded_url, res)
  });
  return R.assoc('text', res, tweet);
  
}

export const processTweet = R.pipe(expandRetweet, expandLinks)

/* File access */

export function writeJson(path: string, object: Object) {
  fs.writeFileSync(path, JSON.stringify(object), 'utf8'); 
}

export function readJson(path: string) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

export function readState(path: string): Object {
  try {
    return readJson(path)
  } catch (error) {
    return {}
  }
}