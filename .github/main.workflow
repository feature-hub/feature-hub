workflow "Build (Node 11)" {
  on = "push"
  resolves = [
    "Commitlint",
    "Lint",
    "Compile",
    "Verify",
    "Test (Node 11)"
  ]
}

action "Install (Node 11)" {
  uses = "docker://node:11"
  runs = "yarn"
}

action "Commitlint" {
  uses = "docker://node:11"
  runs = "yarn"
  args = "commitlint --from ${GITHUB_SHA}^1 --to $GITHUB_SHA"
  needs = ["Install (Node 11)"]
}

action "Lint" {
  uses = "docker://node:11"
  runs = "yarn"
  args = "lint"
  needs = ["Install (Node 11)"]
}

action "Compile" {
  uses = "docker://node:11"
  runs = "yarn"
  args = "compile"
  needs = ["Install (Node 11)"]
}

action "Verify" {
  uses = "docker://node:11"
  runs = "yarn"
  args = "verify"
  needs = ["Install (Node 11)"]
}

action "Test (Node 11)" {
  uses = "docker://node:11"
  runs = "yarn"
  args = "test --no-cache --runInBand --no-verbose"
  needs = ["Install (Node 11)"]
}
