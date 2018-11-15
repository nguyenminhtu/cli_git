const octokit = require("@octokit/rest")();
const ConfigStore = require("configstore");
const _ = require("lodash");
const CLI = require("clui");
const Spinner = CLI.Spinner;
const chalk = require("chalk");

const inquirer = require("./inquirer");
const files = require("./files");

const conf = new ConfigStore("fagate");

module.exports = {
  getInstance: () => {
    return octokit;
  },

  githubAuth: (token) => {
    octokit.authenticate({
      type: "oauth",
      token: token
    });
  },

  getStoredGithubToken: () => {
    return conf.get("github.token");
  },

  setGithubCredentials: async () => {
    const credentials = await inquirer.askGithubCredentials();
    octokit.authenticate(
      _.extend(
        {
          type: "basic"
        },
        credentials
      )
    );
  },

  registerNewToken: async () => {
    const status = new Spinner("Authenticating you, please wait...");
    status.start();

    try {
      const response = await octokit.authorization.create({
        scopes: ["user", "public_repo", "repo", "repo:status"],
        note: "fagate, the command-line tool for initializing Git repos",
        fingerprint: "secretkey"
      });

      const token = response.data.token;
      if (token) {
        conf.set("github.token", token);
        return token;
      } else {
        throw new Error("Missing token", "Github token was not found in the response");
      }
    } catch (err) {
      throw err;
    } finally {
      status.stop();
    }
  }
};
