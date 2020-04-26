"user strict";
const storeScraper = require('app-store-scraper');

const getReviews = async (appId, country, page = 1) => {

  try {
    const entries = await storeScraper.reviews({
      id: appId,
      country: country,
      sort: storeScraper.sort.RECENT,
      page: page
    })

    if (entries) {
      let reviews = [];
      entries.forEach(entry => reviews.push(formatReview(entry)));
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
    id: rawReview.id,
    author: rawReview.userName,
    rating: rawReview.score,
    title: rawReview.title,
    comment: rawReview.text,
    version: rawReview.version
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
