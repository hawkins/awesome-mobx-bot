const request = require("request-promise-native");
const cheerio = require("cheerio");
const SIGNATURE = require("./signature");

const opened = async (context, awesomeMobxSource) => {
  const { login: author } = context.payload.sender;
  const { body: issueBody } = context.payload.issue;

  /*
   * Find the link in the issue comment
   */
  let link;
  const linkRegex = /(https?:\/\/.+)/g;
  let m = linkRegex.exec(issueBody);
  if (m) {
    link = m[1];
  } else {
    // No link? Don't worry about this Issue then
    return;
  }

  /*
   * Check for duplicate links
   */
  let regex = new RegExp(link.replace("/", "\\/"));
  if (regex.exec(awesomeMobxSource) !== null) {
    const paramsToComment = context.issue({
      body: `Hey, thanks so much for suggesting that link! :+1:

Turns out we've already got that link in the list, so I'm closing this issue since it's a duplicate. Thanks so much though! :raised_hands:
${SIGNATURE}
`
    });
    const paramsToClose = context.issue({ state: "closed" });

    // Comment on and close the issue
    context.github.issues.createComment(paramsToComment);
    return context.github.issues.edit(paramsToClose);
  }

  /*
   * Find the resource's name
   */
  const body = await request(link);
  let $ = cheerio.load(body);
  let title = $('meta[property="og:title"]').attr("content");
  if (!title) {
    const params = context.issue({
      body: `Hi there!

      Thanks for suggesting that link!
      Unfortunately, I couldn't find the title of the link, so I'll need a human to open a PR with the link.

      (This may be a bug in my code! cc @hawkins)
      ${SIGNATURE}
      `
    });

    return context.github.issues.createComment(params);
  }

  /*
   * Determine the type of link
   * (article, tutorial, video etc) where possible
   *
   * BLOGS determined by og:type=article
   * CASE STUDIES determined by "How we use" "How ${COMPANY} use"
   * TUTORIALS determined if the title has these strings: "how to" "introduction" "tutorial"
   * COMPARISONS determined if the title has these strings: "redux", "vs.", "versus"
   * VIDEOS determined if the link points to Youtube, Vimeo, *.tv
   */
  let resourceType = "unknown";

  const ogType = $('meta[property="og:type"]').attr("content");
  if (ogType == "article") resourceType = "blog";

  const caseStudyRegex = /(how\swe\suse|how\s[^\s]*\suse)/i;
  m = caseStudyRegex.exec(title);
  if (m) resourceType = "case study";

  const tutorialRegex = /(how\sto|intro|tutorial)/i;
  m = tutorialRegex.exec(title);
  if (m) resourceType = "tutorial";

  const comparisonRegex = /(redux|\svs\.?\s|versus)/i;
  m = comparisonRegex.exec(title);
  if (m) resourceType = "comparison";

  const videosRegex = /(https?:\/\/)?(youtube\.com|.*\.tv|vimeo\.com)/i;
  m = videosRegex.exec(link);
  if (m) resourceType = "video";

  // TODO: Create a commit etc

  // For now just comment on the issue with test results
  const params = context.issue({
    body: `Hi there!

Thanks for suggesting that link! We found the following details for your link:

- [${title}](${link}) (${resourceType})
${SIGNATURE}
`
  });

  return context.github.issues.createComment(params);
};

module.exports = {
  opened
};
