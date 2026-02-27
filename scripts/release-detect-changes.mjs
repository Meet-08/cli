import { execSync } from 'node:child_process'
import { appendFileSync } from 'node:fs'

function run(command) {
  return execSync(command, { encoding: 'utf8' }).trim()
}

function setOutput(name, value) {
  const outputPath = process.env.GITHUB_OUTPUT
  if (!outputPath) return
  appendFileSync(outputPath, `${name}=${value}\n`)
}

function main() {
  const hasChanges = run('git status --porcelain').length > 0
  setOutput('has_changes', String(hasChanges))

  if (hasChanges) {
    console.log('Detected versioning changes to commit and publish.')
  } else {
    console.log('No release changes detected.')
  }
}

main()
