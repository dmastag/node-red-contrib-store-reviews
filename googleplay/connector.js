"user strict";
const storeScraper = require('google-play-scraper');
const url = require('url');

const getReviews = async (appId, country, page = 1) => {

  try {
    const reviews = await storeScraper.reviews({
      appId: appId,
      lang: country,
      page: page,
      sort: storeScraper.sort.NEWEST
    })

    let formattedReviews = []
    reviews.forEach(review => {
      formattedReviews.push(formatReview(review));
    });

    return formattedReviews

  } catch (error) {
    console.log(error)
    return new Error('HTTP response error'); // + response.statusCode
  }

}

const getAppInfo = async appId => {
  try {
    const app = await storeScraper.app({ appId: appId })
    return formatAppInfo(app)
  } catch (error) {
    return new Error(error)
  }
}

const formatReview = rawReview => {
  const id = url.parse(rawReview.url, true).query.reviewId;
  return {
    id: id,
    author: rawReview.userName,
    rating: rawReview.score,
    title: rawReview.title,
    comment: rawReview.text
  };
}

const formatAppInfo = rawAppInfo => {
  return {
    id: rawAppInfo.appId,
    title: rawAppInfo.title,
    icon: rawAppInfo.icon,
    url: rawAppInfo.url
  };
}

module.exports = {
  getReviews: getReviews,
  getAppInfo: getAppInfo
};