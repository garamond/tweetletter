import React from 'react';
import R from 'ramda'

export const MessageBody = (props) =>
  <div>
    <h1>@{ props.feed }</h1>
    { React.Children.toArray(props.children).map((c,i) => <div key={i}><hr/>{c}</div>) }
  </div> 

export const Tweet = (props) => 
  <div>
    <p><a href={`https://twitter.com/${props.feed}/status/${props.id}`}>{ `${props.name} @${props.feed}` }</a></p>
    <p dangerouslySetInnerHTML={{__html: props.text}}></p>
    <p>{ new Date(props.date).toLocaleString() }</p>
    { props.in_reply_to_status ?
        <blockquote style={{ borderLeft: '1px solid darkgrey' }}>
          { renderTweet(props.in_reply_to_status) }
        </blockquote>
      : null
    }
    { props.images.map((img, i) => <img key={i} src={img.media_url_https} />) }
  </div>

Tweet.propTypes = {
  feed: React.PropTypes.string.isRequired,
  name: React.PropTypes.string.isRequired,
  id: React.PropTypes.string.isRequired,
  text: React.PropTypes.string.isRequired,
  date: React.PropTypes.string.isRequired,
  images: React.PropTypes.array,
  in_reply_to_status: React.PropTypes.object,
}

function linkify(text: string): string {
  const hyperlinkRegex = /(https?|ftp|file)\:\/\/[-a-zA-Z0-9+&@#/%?=~_|!:,.;]*[-a-zA-Z0-9+&@#/%=~_|]/ig
  const hashtagRegex = /#\w+/ig
  return text.replace(hyperlinkRegex, (t) => `<a href=${t}>${t}</a`)
             .replace(hashtagRegex, (t) => `<a href=https://twitter.com/hashtag/${R.tail(t)}>${t}</a>`)             
}

export function renderTweet(tweet: Object) {
  const {
    id_str,
    user: {
      name,
      screen_name
    },
    text,
    created_at,
    entities: {media=[]},
    in_reply_to_status
  } = tweet
  const images = media.filter(m => m.type==='photo')
  return <Tweet key={ id_str } 
            feed={ screen_name }
            name={ name } 
            id={ id_str } 
            text={ linkify(text) }
            date={ created_at }
            images={ images }
            in_reply_to_status={ in_reply_to_status } />
}