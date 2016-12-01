FROM node:6
COPY tweetletter.js /
CMD ["node", "tweetletter.js", "tweetletter/config.json", "tweetletter/state.json"]