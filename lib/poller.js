"user strict";

let interval;

module.exports = {

  start: (task, minutes) => {
    interval = setInterval(() => task(), minutes * 60 * 1000);
  },

  stop: () => {
    clearInterval(interval);
  }
};
