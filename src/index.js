// @flow

import Twit from 'twit';
import React from 'react';
import { renderToString } from 'react-dom/server';
import nodemailer from 'nodemailer';
import R from 'ramda'
import { MessageBody, renderTweet } from './templates';

import * as lib from './lib'

const CONFIG_FILE = process.argv[2] || 'config.json'
const STATE_FILE = process.argv[3] || 'state.json'

const { smtp: { from, to, host, user, pass }, api, feeds=[], options } = lib.readJson(CONFIG_FILE)
let state = lib.readState(STATE_FILE)

const transporter = nodemailer.createTransport(`smtps://${user}:${pass}@${host}`);
const twitter = new Twit(api);

function getStatus(id: string) {
  return twitter.get('statuses/show', { id })
}

async function resolveReply(tweet: Object) {
  const { in_reply_to_status_id_str: in_reply_id } = tweet
  if (in_reply_id && options.resolveReplies) {
    let inReplyTweet = await getStatus(in_reply_id)
    return R.assoc('in_reply_to_status', inReplyTweet.data, tweet)
  } else {
    return tweet
  }
}

feeds.map( feed => {
  twitter.get('statuses/user_timeline', { screen_name: feed, count: 200, since_id: state[feed] })
    .then( res => {
      let ids = res.data.map(d => d.id_str);
      ids.sort();
      state = R.assoc(feed, R.last(ids) || state[feed], state);
      return res;
    })
    .then( res => Promise.all(res.data
      .filter(d => (!d.in_reply_to_status_id_str || !options.filterReplies))
      .map( async (tweet) => {
        let t = await resolveReply(tweet)
        return renderTweet(lib.processTweet(t))
      })))
    .then( elements => {
      if (elements.length > 0) {
        const message = {
          from,
          to,
          subject: `@${feed}: ${elements.length} new items`,
          html: renderToString(<MessageBody feed={ feed }>{ elements }</MessageBody>)
        }
        transporter.sendMail(message, function(error, info){
          if(error){
            return console.log(error);
          }
          console.log('Message sent: ' + info.response);
        });
      }
    })
    .then(() => {
      lib.writeJson(STATE_FILE, state)
    })
});
