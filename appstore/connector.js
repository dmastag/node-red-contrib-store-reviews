"user strict";
const fetch = require('node-fetch');
const storeScraper = require('app-store-scraper');

const getReviews = async (appId, country, page = 1) => {

  var url = 'http://itunes.apple.com/rss/customerreviews/page=' + page + '/id=' + appId + '/sortby=mostrecent/json?cc=' + country;

  try {
    const res = await fetch(url)
    const data = await res.json()

    const entries = data.feed.entry;
    const links = data.feed.link;

    if (entries && links) {

      var reviews = [];
      entries.forEach((entry) => {
        if ('content' in entry) {
          reviews.push(formatReview(entry));
        }
      });

      return reviews;
    } else {
      return new Error('Application not found');
    }

  } catch (error) {
    console.log(error)
    return new Error('HTTP response error'); // + response.statusCode
  }

}

const getAppInfo = async appId => {
  try {
    const app = await storeScraper.app({ id: appId })
    return formatAppInfo(app)
  } catch (error) {
    return new Error(error)
  }
}

const formatReview = rawReview => {
  return {
    id: rawReview.id.label,
    author: rawReview.author.name.label,
    rating: rawReview['im:rating'].label,
    title: rawReview.title.label,
    comment: rawReview.content.label
  };
}

const formatAppInfo = rawAppInfo => {
  return {
    id: rawAppInfo.id,
    title: rawAppInfo.title,
    icon: rawAppInfo.icon,
    url: rawAppInfo.url
  };
}

module.exports = {
  getReviews: getReviews,
  getAppInfo: getAppInfo
};
