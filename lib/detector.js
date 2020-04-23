"use strict";
var Q = require('q');

module.exports = function(appId, country, connector) {

  var self = this;

  this.appId = appId;
  this.country = country;
  this.connector = connector;
  this.appInfo = null;
  this.latestReviewId = null;

  this.detect = function() {
    console.log(self);
    // Get application info
    return self.connector.getAppInfo(self.appId)
    .then(function(appInfo) {
      self.appInfo = appInfo;
      console.log("appInfo", appInfo)
      // Get reviews
      return self.connector.getReviews(self.appId, self.country)
      .then(function(reviews) {
        console.log('reviews.length', reviews.length);
        var startReviewId = null;
        if (reviews.length > 0) {
          startReviewId = reviews[0].id;
        }
        console.log('startReviewId', startReviewId);
        console.log('self.latestReviewId', self.latestReviewId);
        var latestReviewReached = (self.latestReviewId !== null);

        var newReviews = [];
        console.log('latestReviewReached', latestReviewReached)

        // Iterate reviews
        var i = 0;
        console.log('latestReviewReached',latestReviewReached)
        console.log('reviews.length',reviews.length)
        while (!latestReviewReached && i < reviews.length) {

          var review = reviews[i];
          console.log(i)
          

          if (self.latestReviewId === review.id) {
            latestReviewReached = true;
            console.log(self.latestReviewId === review.id, 'true');
          } else {

            console.log('This is a new review')
            // Add appInfo
            review.appInfo = self.appInfo;
            newReviews.push(review);

          }
          i++;
        }

        // Mark start review id as processed
        if (startReviewId !== null) {
          self.latestReviewId = startReviewId;
        }

        return Q.fcall(function() {
          return newReviews;
        });

      });

    });
  };

};
