# Contributing

## Requirements

## Recommendations

## Lifecycle tasks
### Making a release
1. Create a release branch off `development` with the name `release/v[VERSION]`. Example: `release/v0.0.1`.
2. In this branch, make a commit to update the version number in the file `package.json`.
3. Open a pull request from the release branch into the `main` branch.
4. After passing a thorough review, merge into the `main` branch, making a merge commit.
5. Make a GitHub release, tagging the merge commit in the `main` branch with the version identifier in the format of `v[VERSION]`. Example: `v0.0.1`.
6. In your local environment, pull the changes from remote and checkout the newly tagged commit from the `main` branch.
7. Clean hardhat using the command `npx hardhat clean`, build the project using the command `npx hardhat compile`, and assuming it's successful, publish the project to the npm registry using `npm publish --access public`.
8. Merge the main branch into the `development` branch, creating a merge commit.

## Resources
- [Gitflow Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
![Workflow image][workflow-img]

[workflow-img]: https://wac-cdn.atlassian.com/dam/jcr:cc0b526e-adb7-4d45-874e-9bcea9898b4a/04%20Hotfix%20branches.svg?cdnVersion=1795