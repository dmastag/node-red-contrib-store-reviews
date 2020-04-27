"use strict";

const detect = async function (appId, country, connector, latestReviewId = null) {

  try {
    // Get application info
    const appInfo = await connector.getAppInfo(appId)
    const reviews = await connector.getReviews(appId, country)

    let startReviewId = null;
    if (reviews.length > 0) {
      startReviewId = reviews[0].id;
    }

    let latestReviewReached = false;

    let newReviews = [];

    // Iterate reviews
    let i = 0;
    while (!latestReviewReached && i < reviews.length) {

      let review = reviews[i];

      if (latestReviewId === review.id) {
        latestReviewReached = true;
      } else {

        // This is a new review
        // Add appInfo
        review.appInfo = appInfo;
        newReviews.push(review);

      }
      i++;
    }

    // Mark start review id as processed
    if (startReviewId !== null) {
      latestReviewId = startReviewId;
    }

    return {
      newReviews: newReviews,
      appInfo: appInfo,
      latestReviewId: latestReviewId
    };

  } catch (error) {
    return new Error("Something went wrong getting reviews")
  }

};

module.exports = {
  detect: detect
};