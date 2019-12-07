const nock = require("nock");
const fs = require("fs");
const path = require("path");

const { Probot } = require("probot");

const app = require("..");
const newLinkPayload = require("./fixtures/issue_new_link.json");
const existingLinkPayload = require("./fixtures/issue_existing_link.json");
const tools = require("../src/tools");

const awesomeMobXSource = `# Comparisons with other state management libraries

* [link](https://example.com/) - cool link 1!
* [link](https://example.com/) - cool link 2!
* [link](https://example.com/) - cool link 3!
`;

describe("issues", () => {
  let probot;
  let github;
  let mockCert;

  beforeAll(done => {
    fs.readFile(path.join(__dirname, "fixtures/mock-cert.pem"), (err, cert) => {
      if (err) return done(err);
      mockCert = cert;
      done();
    });
  });

  beforeEach(() => {
    nock.disableNetConnect();
    probot = new Probot({ id: 123, cert: mockCert });
    probot.load(app);

    github = {
      issues: { createComment: jest.fn(), edit: jest.fn() },
      pullRequests: {
        create: jest.fn().mockReturnValue({
          data: { html_url: "https://example.com/1", number: 4 }
        })
      },
      gitdata: {
        getReference: jest
          .fn()
          .mockReturnValue({ data: { object: { sha: "01" } } }),
        createBlob: jest.fn().mockReturnValue({
          data: { sha: "a2", url: "https://example.com/2" }
        }),
        getTree: jest.fn().mockReturnValue({ data: { sha: "b1" } }),
        createTree: jest.fn().mockReturnValue({ data: { sha: "b2" } }),
        createCommit: jest.fn().mockReturnValue({ data: { sha: "c2" } }),
        createReference: jest
          .fn()
          .mockReturnValue({ data: { ref: "heads/bot/issue-3" } })
      }
    };

    // Passes the mocked out GitHub API into out robot instance
    probot.auth = () => Promise.resolve(github);
  });

  it("when opened with a new link", async () => {
    await probot.receive(newLinkPayload);
    expect(github.issues.createComment.mock.calls).toMatchSnapshot();
    expect(github.gitdata.createBlob.mock.calls).toMatchSnapshot();
    expect(github.gitdata.createCommit.mock.calls).toMatchSnapshot();
    expect(github.pullRequests.create.mock.calls).toMatchSnapshot();
  });

  it("when opened with an existing link", async () => {
    await probot.receive(existingLinkPayload);
    expect(github.issues.createComment.mock.calls).toMatchSnapshot();
    expect(github.issues.edit.mock.calls).toMatchSnapshot();
  });
});

describe("tools", () => {
  it("getSourceIndex can find the index of a type section", () => {
    expect(
      tools.getSourceIndex(
        awesomeMobXSource,
        "Comparisons with other state management libraries"
      )
    ).toMatchSnapshot();
    expect(
      tools.getSourceIndex(awesomeMobXSource, "unknown")
    ).toMatchSnapshot();
  });
});
