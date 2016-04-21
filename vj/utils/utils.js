'use strict';
import _ from 'lodash';
// Define
const Utils = {

};


Utils.urlParams = function() {
    var query;
    var pos = window.location.href.indexOf("?");
    if (pos == -1) return [];
    query = window.location.href.substr(pos + 1);
    var result = {};
    query.split("&").forEach(function(part) {
        if (!part) return;
        var item = part.split("=");
        var key = item[0];
        var from = key.indexOf("[");
        if (from == -1) result[key] = decodeURIComponent(item[1]);
        else {
            var to = key.indexOf("]");
            var index = key.substring(from + 1, to);
            key = key.substring(0, from);
            if (!result[key]) result[key] = [];
            if (!index) result[key].push(item[1]);
            else result[key][index] = item[1];
        }
    });
    return result;
};

Utils.standardizeYoutubeVideoInfoFormat = (item) => {
    item.snippet.resourceId = {};
    item.snippet.resourceId.videoId = item.id;
};

Utils.getRandom = (list) => {
    let v = undefined;
    if (!list.length) {
        return;
    }
    if (list.length < 2) {
        return list[0];
    }
    while (!v) {
        let r = Math.floor(Math.random() * list.length - 1);
        v = list[r];
    }
    return v;
};

Utils.getIdFromItem = (item) => {
    if (_.isObject(item.id)) {
        return item.id.videoId;
    } else if (_.isObject(item.snippet.resourceId)) {
        return item.snippet.resourceId.videoId;
    } else {
        return;
    }
};

Utils.extractViewsFromScrape = (scrape) => {
    let _s = scrape.split('views')[0].trim();
    let _views = _s.split(' ');
    let _c = parseInt(_views[_views.length - 1], 10);
    return _c;
};

Utils.sortByView = (a, b) => {
    return a.views - b.views;
}

Utils.getSpotifyAccessToken = function() {
    return Cookies.get('rad-spotifyAccess');
};

Utils.getYoutubeAccessToken = function() {
    return Cookies.get('rad-youtubeAccess');
};

Utils.extractVideoIdFromUpload = function(string) {
    let s = string.split('vi/')[1];
    return s.split('/')[0];
};

Utils.shuffle = function(d) {
  for (var c = d.length - 1; c > 0; c--) {
    var b = Math.floor(Math.random() * (c + 1));
    var a = d[c];
    d[c] = d[b];
    d[b] = a;
  }
  return d
};

//***************

//***************
Utils.log = (msg, color = 'green') => {
    console.log(`%c ${msg}`,
        `background: #99999; color: ${color}; font-size: 12px`);
};

Utils.map = function(v, a, b, x, y) {
        return (v === a) ? x : (v - a) * (y - x) / (b - a) + x;
    };

// Export
export default Utils
