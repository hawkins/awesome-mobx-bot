const request = require("request");
const cheerio = require("cheerio");

const SIGNATURE = `
---

> Hi there, I'm a [bot](https://github.com/hawkins/awesome-mobx-bot) here to help automate tasks.

> If you have any questions, comments, or crude remarks for me, please leave them in [my project's repo](https://github.com/hawkins/awesome-mobx-bot/issues/new)
`;

// TODO: Request this guy and get the source
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
    /*
    context.payload.issue = {
      body: "Hey I found this cool tutorial\n\nhttps://javascript30.com"
    }
    */

    const { login: author } = context.payload.sender;
    const { body } = context.payload.issue;

    // Find the link
    let link;
    const linkRegex = /(https?:\/\/.+)/g;
    let m; // Regex match object
    while ((m = linkRegex.exec(body)) !== null) {
      if (m.index === linkRegex.lastIndex) {
        linkRegex.lastIndex++;
      }
      link = m[1];
    }

    if (!link) {
      // No link? no op
      return;
    }

    // Yay we found a link!

    // TODO: Is the link a duplicate?
    // Search through the source
    let regex = new RegExp(link.replace("/", "\\/"));
    m = regex.exec(body) !== null;
    // If we have a match, the link exists; its a duplicate, close the issue
    if (m) {
      // Comment on the issue
      const paramsToComment = context.issue({
        body: `Hey, thanks so much for suggesting that link! :+1:

Turns out we've already got that link in the list, so I'm closing this issue since it's a duplicate. Thanks so much though! :raised_hands:
${SIGNATURE}
`
      });
      const paramsToClose = context.issue({ state: "closed" });

      context.github.issues.createComment(paramsToComment);
      return context.github.issues.edit(paramsToClose);
    }

    // Now lets find out the resource's name

    request(link, (err, res, body) => {
      if (err) {
        // TODO: Request the user check the link
        console.error(err);
        return;
      }

      // Add the resource, but first we need the name
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
