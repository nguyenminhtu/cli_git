#!/usr/bin/env node
const chalk = require("chalk");
const clear = require("clear");
const figlet = require("figlet");

const files = require("./lib/files");
const inquirer = require("./lib/inquirer");
const github = require("./lib/github");
const repo = require("./lib/repo");

clear();

console.log(
  chalk.yellow(
    figlet.textSync("FaGate", { horizontalLayout: "full" })
  )
);

if (files.directoryExists('.git')) {
  console.log(chalk.red('Already a git repository!'));
  process.exit();
}

const getGithubToken = async () => {
  let token = github.getStoredGithubToken();
  if (token) {
    return token;
  }

  await github.setGithubCredentials();

  console.log("set credentials success");

  token = await github.registerNewToken();

  console.log("register new token success");

  return token;
};

const run = async () => {
  try {
    const token = await getGithubToken();
    github.githubAuth(token);

    console.log("authen successfully");

    const url = await repo.createRemoteRepo();

    console.log("create repo successfully");

    await repo.createGitignore();

    console.log("create gitignore successfully");

    const done = await repo.setupRepo(url);

    if (done) {
      console.log(chalk.green("All done!"));
    }
  } catch (err) {
    if (err) {
      switch (err.code) {
        case 401:
          console.log(chalk.red("Couldn't log you in. Please provide correct credentials/token."));
          break;
        case 422:
          console.log(chalk.red("There already exists a remote repository with the same name"));
          break;
        default:
          console.log(err);
      }
    }
  }
};

run();
