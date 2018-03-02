const { createRobot } = require("probot");
const app = require("..");
const newLinkPayload = require("./fixtures/issue_new_link.json");
const existingLinkPayload = require("./fixtures/issue_existing_link.json");

const awesomeMobXSource = `
# mock source code

- [link](https://example.com/) - cool link!
`;

describe("issues", () => {
  let robot;
  let github;

  beforeEach(() => {
    // Here we create a robot instance
    robot = createRobot();
    // Here we initialize the app on the robot instance
    app(robot, awesomeMobXSource);
    // This is an easy way to mock out the GitHub API
    github = {
      issues: {
        createComment: jest.fn(),
        edit: jest.fn()
      }
    };
    // Passes the mocked out GitHub API into out robot instance
    robot.auth = () => Promise.resolve(github);
  });

  it("when an issue is opened with a new link", async () => {
    await robot.receive(newLinkPayload);
    expect(github.issues.createComment).toHaveBeenCalled();
  });

  it("when an issue is opened with an existing link", async () => {
    await robot.receive(existingLinkPayload);
    expect(github.issues.createComment).toHaveBeenCalled();
    expect(github.issues.edit).toHaveBeenCalledWith({
      number: 3,
      owner: "hawkins",
      repo: "awesome-mobx-bot",
      state: "closed"
    });
  });
});
