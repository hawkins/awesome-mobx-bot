const request = require("request");
const cheerio = require("cheerio");

const SIGNATURE = `
---

> Hi there, I'm a [bot](https://github.com/hawkins/awesome-mobx-bot) here to help automate tasks.

> If you have any questions, comments, or crude remarks for me, please leave them in [my project's repo](https://github.com/hawkins/awesome-mobx-bot/issues/new)
`;

module.exports = robot => {
  // Your code here
  robot.log("Yay, the app was loaded!");

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/

  robot.on("issues.opened", async context => {
    // An issue was just opened.
    // `context` extracts information from the event, which can be passed to
    // GitHub API calls. This will return:
    //   {owner: 'yourname', repo: 'yourrepo', number: 123, body: 'Hello World!}

    // TODO: Get the link from the issue
    const link = context.payload.issue.body.trim();

    if (!link) {
      // No link? no op
      return;
    }

    request(link, (err, res, body) => {
      if (err) {
        // TODO: Request the user check the link
        console.error(err);
        return;
      }

      // TODO: Is the link a duplicate?

      let $ = cheerio.load(body);

      // Hoping most blog sites have decent opengraph support
      let title = $('meta[property="og:title"]').attr("content");
      // TODO: Other strategies

      // TODO: Determine the type of link (article, tutorial, video etc) where possible

      if (title) {
        const params = context.issue({
          body: `Hi there!

Thanks for suggesting that link! We found the following details for your link:

- [${title}](${link}) (article)
${SIGNATURE}
`
        });

        // Comment on the issue
        // return context.github.issues.createComment(params);
      }
    });
  });
};
