const SIGNATURE = require("./signature");

const updateFiles = async (
  context,
  owner,
  repo,
  awesomeMobxSource,
  issueNumber,
  title,
  author
) => {
  const {
    data: { object: { sha } }
  } = await context.github.gitdata.getReference({
    owner,
    repo,
    ref: "heads/master"
  });

  // Create a new blob for the file
  const {
    data: { sha: newBlobSha, url: newBlobUrl }
  } = await context.github.gitdata.createBlob({
    owner,
    repo,
    content: awesomeMobxSource,
    encoding: "utf-8"
  });

  // Get previous tree's sha
  let { data: { sha: previousTreeSha } } = await context.github.gitdata.getTree(
    {
      owner,
      repo,
      sha,
      recursive: false
    }
  );

  // Create new tree
  const { data: { sha: newTreeSha } } = await context.github.gitdata.createTree(
    {
      owner,
      repo,
      base_tree: previousTreeSha,
      tree: [
        {
          path: "README.md",
          mode: "100644",
          type: "blob",
          sha: newBlobSha,
          size: awesomeMobxSource.length,
          url: newBlobUrl
        }
      ]
    }
  );

  // Create a new commit
  const commitMessage = `Add '${title}' by ${author}\n\nFixes issue #${issueNumber}\n`;
  const {
    data: { sha: newCommitSha }
  } = await context.github.gitdata.createCommit({
    owner,
    repo,
    message: commitMessage,
    tree: newTreeSha,
    parents: [previousTreeSha]
  });

  // Create a new branch for the commit
  const { data: { ref } } = await context.github.gitdata.createReference({
    owner,
    repo,
    sha: newCommitSha,
    ref: `refs/heads/bot/issue-${issueNumber}`
  });

  return commitMessage;
};

const openPR = async (
  context,
  owner,
  repo,
  commitMessage,
  title,
  link,
  issueNumber
) => {
  // Open a pull request
  const {
    data: { html_url: prLink, number: prNumber }
  } = await context.github.pullRequests.create({
    owner,
    repo,
    title: commitMessage,
    head: `bot/issue-${issueNumber}`,
    base: "master",
    body: `This is an automatic pull request spawned by #${issueNumber}.
${SIGNATURE}`
  });

  // Comment on the issue with a link to the PR
  const params = context.issue({
    body: `Hi there!

Thanks for suggesting that link! We found the following details for your link:

- [${title}](${link})

I also opened an automatic PR with this link added. You can check this out [at PR #${prNumber}](${prLink}) and make sure it looks good! :smile:
${SIGNATURE}
`
  });

  return context.github.issues.createComment(params);
};

module.exports = {
  updateFiles,
  openPR
};
