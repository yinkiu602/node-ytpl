const HTTPS = require('https');
const UTIL = require('./util.js');
const QS = require('querystring');

module.exports = (startVideo, mixID, options = {}, callback) => {
  const request = HTTPS.get(`https://www.youtube.com/watch?v=${startVideo}&list=${mixID}&hl=en&disable_polymer=true`, { headers: options.headers }, resp => { // eslint-disable-line consistent-return, max-len
    if (resp.statusCode !== 200) {
      if (resp.statusCode === 303) return callback(new Error('Playlist not avaible'));
      return callback(new Error(`Status code: ${resp.statusCode}`));
    }
    const respBuffer = [];
    resp.on('data', data => respBuffer.push(data));
    resp.on('end', () => {
      const respString = Buffer.concat(respBuffer).toString();
      const container = UTIL.between(respString, 'playlist-autoscroll-list', 'document.getElementById(\'playlist-autoscroll-list\');');
      const parts = container.split('</li>');
      const videos = parts.splice(0, parts.length - 1).map(parseVideo);
      return callback(null, videos);
    });
  });
}

const parseVideo = string => {
  return {
    title: UTIL.removeHtml(UTIL.between(UTIL.between(string, '<h4 class="', '</h4>'), '">', '').trim()),
    preview: UTIL.removeHtml(UTIL.between(string, 'data-thumb="', '"')),
    uploader: UTIL.removeHtml(UTIL.between(UTIL.between(string, '<span class="video-uploader-byline', '</span>'), '" >', '').trim()),
    link: UTIL.removeHtml(UTIL.between(string, '<a href="', '"')),
  }
}
