const request = require('request-promise-native');
const issues = require('./src/issues');

let awesomeMobXSource = '';
let lastTimeFetched = null;
const delay = 1000 * 60 * 60;  // Hourly

const getMobXAwesomeListSource = () => {
  return request(
      'https://raw.githubusercontent.com/mobxjs/awesome-mobx/master/README.md');
};

module.exports = (app, source) => {
  app.log('Awesome MobX Bot loaded');

  // Either use source provided in testing or fetch source now
  const maybeUpdateMobXAwesomeListSource = async source => {
    if (source) {
      app.log('Using provided Awesome MobX List source.');
      awesomeMobXSource = source;
    } else {
      if (!awesomeMobXSource ||
          (lastTimeFetched && Date.now() - lastTimeFetched > delay)) {
        app.log('Fetching Awesome MobX List source...');
        awesomeMobXSource = await getMobXAwesomeListSource();
      } else {
        app.log('Using last fetched source (delay has not passed).');
      }
    }
    lastTimeFetched = Date.now();
  };

  app.on('issues.opened', async context => {
    await maybeUpdateMobXAwesomeListSource(source);
    await issues.opened(context, awesomeMobXSource);
  });
};
