workflow "Build" {
  on = "push"
  resolves = [
    "Commitlint",
    "Lint",
    "Compile",
    "Verify",
    "Test"
  ]
}

action "Install" {
  uses = "docker://node:11"
  runs = "yarn"
}

action "Commitlint" {
  uses = "docker://node:11"
  runs = ["sh", "-c", "yarn commitlint --from $GITHUB_SHA^1 --to $GITHUB_SHA"]
  needs = ["Install"]
}

action "Lint" {
  uses = "docker://node:11"
  runs = "yarn"
  args = "lint"
  needs = ["Install"]
}

action "Compile" {
  uses = "docker://node:11"
  runs = "yarn"
  args = "compile"
  needs = ["Install"]
}

action "Verify" {
  uses = "docker://node:11"
  runs = "yarn"
  args = "verify"
  needs = ["Install"]
}

action "Test" {
  uses = "ianwalter/puppeteer@v1.0.0"
  runs = "yarn"
  args = "test --no-cache --runInBand --no-verbose"
  needs = ["Install"]
}
