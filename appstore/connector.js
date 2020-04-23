"user strict";
var Q = require('q');
var request = require('request');
var storeScraper = require('app-store-scraper');

function getReviews(appId, country, page) {

  var deferred = Q.defer();

  var url = 'http://itunes.apple.com/rss/customerreviews/page=' + page + '/id=' + appId + '/sortby=mostrecent/json?cc=' + country;
  console.log('The URL is ' + url);

	request(url, function (error, response, body) {

		if (!error && response.statusCode == 200) {

      var data = JSON.parse(body);
      console.log('data ' + data);

      var entry = data.feed.entry;
      console.log('entry ' + entry);
      var links = data.feed.link;
      console.log('links ' + links);

			if (entry && links) {

        var reviews = [];
        entry.forEach(function(e) {
          console.log('e ' + e);
          if ('content' in e) {
              console.log('has content ');

              reviews.push(formatReview(e));
              console.log(reviews);
          }
        });

        deferred.resolve(reviews);
      } else {
        deferred.reject('Application not found');
      }

    } else {
      if (error === null) {
        error = new Error('HTTP response ' + response.statusCode);
      }
      deferred.reject(error);
    }

  });

  return deferred.promise;

}

function getAppInfo(appId) {

  var deferred = Q.defer();

  storeScraper.app({id: appId})
  .then(function(app) {
    deferred.resolve(formatAppInfo(app));
  }).catch(function(err) {
    deferred.reject(new Error(err));
  });

  return deferred.promise;
}

function formatReview(rawReview) {
  return {
    id: rawReview.id.label,
    author: rawReview.author.name.label,
    rating: rawReview['im:rating'].label,
    title: rawReview.title.label,
    comment: rawReview.content.label
  };
}

function formatAppInfo(rawAppInfo) {
  return {
    id: rawAppInfo.id,
    title: rawAppInfo.title,
    icon: rawAppInfo.icon,
    url: rawAppInfo.url
  };
}

module.exports = {

  getReviews: function(appId, country) {
    return getReviews(appId, country, 1);
  },

  getAppInfo: function(appId) {
    return getAppInfo(appId);
  }
};
