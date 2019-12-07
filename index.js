const request = require("request-promise-native");
const issues = require("./src/issues");

const getMobXAwesomeListSource = () =>
  request(
    "https://raw.githubusercontent.com/mobxjs/awesome-mobx/master/README.md"
  );

module.exports = app => {
  app.log("Awesome MobX Bot loaded");

  let source;
  let awesomeMobXSource = "";
  let lastTimeFetched = null;
  const delay = 1000 * 60 * 60; // Hourly

  // Either use source provided in testing or fetch source now
  const maybeUpdateMobXAwesomeListSource = async source => {
    if (process.env.AWESOME_MOBX_SOURCE) {
      awesomeMobXSource = process.env.AWESOME_MOBX_SOURCE;
      app.log("Using Awesome MobX List source provided via env.");
    } else {
      if (
        !awesomeMobXSource ||
        (lastTimeFetched && Date.now() - lastTimeFetched > delay)
      ) {
        app.log("Fetching Awesome MobX List source...");
        awesomeMobXSource = await getMobXAwesomeListSource();
      } else {
        app.log("Using last fetched source (delay has not passed).");
      }
      lastTimeFetched = Date.now();
    }
  };

  app.on("issues.opened", async context => {
    await maybeUpdateMobXAwesomeListSource(source);
    await issues.opened(context, awesomeMobXSource);
  });
};
