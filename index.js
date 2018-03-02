const request = require("request");
const issues = require("./src/issues");

const AWESOME_MOBX_URL =
  "https://raw.githubusercontent.com/mobxjs/awesome-mobx/master/README.md";
let awesomeMobxSource;
request(AWESOME_MOBX_URL, (err, _, body) => {
  if (err) {
    // UH OH!
    throw err;
  }

  awesomeMobxSource = body;
});

module.exports = robot => {
  robot.log("Awesome MobX Bot loaded! ");

  robot.on("issues.opened", async context => {
    await issues.opened(context, awesomeMobxSource);
  });
};
