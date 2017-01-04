// @flow

import Twit from 'twit';
import nodemailer from 'nodemailer';
import R from 'ramda';
import { renderMessage } from './templates';
import { readJson, writeJson } from './io';

const CONFIG_FILE = process.argv[2] || 'config.json';
const STATE_FILE = process.argv[3] || 'state.json';

const { smtp: { from, to, host, user, pass }, api, feeds=[], options } = readJson(CONFIG_FILE);
let state = readJson(STATE_FILE);

const transporter = nodemailer.createTransport(`smtps://${user}:${pass}@${host}`);
const twitter = new Twit(api);

function getFeeds(): Promise<Object> {
  return twitter.get('friends/list')  
}

function getStatus(id: string): Promise<Object> {
  return twitter.get('statuses/show', { id })
}

getFeeds()
  .then(res => res.data.users.map(u => u.screen_name))
  .then(feeds =>
    feeds.map( feed => {
      twitter.get('statuses/user_timeline', { screen_name: feed, count: 200, since_id: state[feed] })
        .then( res => {
          const ids = res.data.map(d => d.id_str).slice().sort();
          state = R.assoc(feed, R.last(ids) || state[feed], state);
          return res;
        })
        .then( res => {
          const tweets = res.data
          if (tweets.length > 0) {
            const message = {
              from,
              to,
              subject: `@${feed}: ${tweets.length} new items`,
              html: renderMessage(feed, tweets)
            }
            transporter.sendMail(message, function(error, info){
              if(error){
                return console.log(error);
              }
              console.log(`Message sent for feed ${feed}: ${info.response}`);
            });
          }
        })
        .then(() => {
          writeJson(STATE_FILE, state)
        })
    })
  )