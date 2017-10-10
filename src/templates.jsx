// @flow

import React from 'react';
import { renderToString } from 'react-dom/server';
import R from 'ramda'

const MessageBody = (props: Object) =>
  <div>
    <h1>@{ props.feed }</h1>
    { React.Children.toArray(props.children).map((c,i) => <div key={i}><hr/>{c}</div>) }
  </div>

const Tweet = (props: Object) =>
  <div>
    <p>
      <a href={`https://twitter.com/${props.feed}/status/${props.id}`}>
        { `${props.name} (@${props.feed})` }
      </a>
      { ` ${ new Date(props.date).toLocaleString() }` }
    </p>
    <p dangerouslySetInnerHTML={{__html: props.text}}></p>
    { props.images.map((img, i) => <img key={i} src={img.media_url_https} />) }
  </div>

Tweet.propTypes = {
  feed: React.PropTypes.string.isRequired,
  name: React.PropTypes.string.isRequired,
  id: React.PropTypes.string.isRequired,
  text: React.PropTypes.string.isRequired,
  date: React.PropTypes.string.isRequired,
  images: React.PropTypes.array,
}

function getText(tweet: Object): string {
  const {
    text,
    retweeted_status,
    entities: {
      urls=[]
    }
  } = tweet

  let finalText = retweeted_status 
    ? `RT @${retweeted_status.user.screen_name}: ${retweeted_status.text}`
    : text

  urls.forEach(url => {
    finalText = finalText.replace(url.url, url.expanded_url)
  })

  const hyperlinkRegex = /(https?|ftp|file)\:\/\/[-a-zA-Z0-9+&@#/%?=~_|!:,.;]*[-a-zA-Z0-9+&@#/%=~_|]/g
  const twitterRegex = /@(\w+)/g
  const hashtagRegex = /#(\S+)/g
  return finalText.replace(hyperlinkRegex, (t) => `<a href=${t}>${t}</a>`)
             .replace(twitterRegex, '<a href=https://twitter.com/$1>@$1</a>')
             .replace(hashtagRegex, '<a href=https://twitter.com/hashtag/$1>#$1</a>')
}

export function renderMessage(feed: string, tweets: Array<Object>): string {
  return renderToString(<MessageBody feed={ feed }>{ tweets.map(renderTweet) }</MessageBody>)
}

function renderTweet(tweet: Object): Object {
  const {
    id_str,
    user: {
      name,
      screen_name
    },
    created_at,
    entities: {
      media=[],
    }
  } = tweet
  const images = media.filter(m => m.type==='photo')
  return <Tweet key={ id_str }
            feed={ screen_name }
            name={ name }
            id={ id_str }
            text={ getText(tweet) }
            date={ created_at }
            images={ images } />
}
