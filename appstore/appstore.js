"use strict";

module.exports = (RED) => {

  const poller = require('../lib/poller.js');
  const detector = require('../lib/detector.js');
  const connector = require('./connector.js');


  function AppStoreNode(config) {

    RED.nodes.createNode(this, config);

    // Parse multiple app ids
    this.appids = config.appid.split(' ');
    this.country = config.country;
    this.pollinginterval = config.pollinginterval;

    const context = this.context().flow;
    const node = this;

    // Instantiate detector for each application
    node.appids.forEach(appId => {
      node.log(`Registering app ${appId}.${node.country}`);
    });

    // Start polling
    poller.start(() => {
      // Detect new reviews for each application
      node.appids.forEach(async appId => {
        const app = `${appId}.${node.country}`
        let appContext = context.get(app);

        if (!appContext) {
          appContext = {
            "appId": appId,
            "country": node.country,
            "appInfo": null,
            "latestReviewId": null
          }
          context.set(app, appContext)
        }

        node.log(`Looking for new reviews for app ${app} with last review ID ${appContext.latestReviewId}`);

        try {

          const returnDetector = await detector.detect(appId, node.country, connector, appContext.latestReviewId);
          node.log(`${returnDetector.newReviews.length} new reviews found for app ${app} and last review ID ${returnDetector.latestReviewId}`);

          // Send new reviews
          returnDetector.newReviews.forEach((review) => {
            var msg = { payload: `${review.id}  - ${review.title} - ${review.rating}` };
            msg.review = review;
            node.send(msg);
          });

          appContext.latestReviewId = returnDetector.latestReviewId;
          appContext.appInfo = returnDetector.appInfo.title;
          context.set(app, appContext)
        } catch (error) {
          node.error('Failed to detect new reviews for ' + app);
        }

      });

    }, parseInt(node.pollinginterval));

    // On node destruction...
    node.on('close', (done) => {
      if (interval !== null) {
        poller.stop();
      }
      done();
    });
  }

  RED.nodes.registerType("appstore", AppStoreNode);

};
