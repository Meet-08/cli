import { execSync } from 'node:child_process'
import { appendFileSync, existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

function run(command) {
  return execSync(command, { encoding: 'utf8' }).trim()
}

function getReleaseChannel(branch) {
  if (branch === 'main') {
    return { npmTag: 'latest', prerelease: false }
  }

  if (branch === 'alpha' || branch === 'beta' || branch === 'rc') {
    return { npmTag: branch, prerelease: true }
  }

  throw new Error(`Unsupported release branch: ${branch}`)
}

function getPendingChangesets() {
  const changesetDir = path.resolve('.changeset')
  if (!existsSync(changesetDir)) return []

  return readdirSync(changesetDir).filter(
    (name) => name.endsWith('.md') && name !== 'README.md',
  )
}

function ensureReleaseMode({ prerelease, npmTag }) {
  const prePath = path.resolve('.changeset/pre.json')
  if (!existsSync(prePath)) {
    if (prerelease) {
      run(`pnpm changeset pre enter ${npmTag}`)
    }
    return
  }

  const preState = JSON.parse(readFileSync(prePath, 'utf8'))

  if (prerelease) {
    if (preState.tag !== npmTag) {
      throw new Error(
        `Expected prerelease tag '${npmTag}' but found '${preState.tag}' in .changeset/pre.json`,
      )
    }

    if (preState.mode !== 'pre') {
      run(`pnpm changeset pre enter ${npmTag}`)
    }
    return
  }

  if (preState.mode === 'pre') {
    throw new Error(
      'Main branch is in prerelease mode. Remove or exit prerelease state before stable releases.',
    )
  }
}

function setOutput(name, value) {
  const outputPath = process.env.GITHUB_OUTPUT
  if (!outputPath) return
  appendFileSync(outputPath, `${name}=${value}\n`)
}

function main() {
  const branch = process.env.GITHUB_REF_NAME || run('git branch --show-current')
  const channel = getReleaseChannel(branch)
  const pending = getPendingChangesets()

  if (pending.length > 0) {
    ensureReleaseMode(channel)
  }

  setOutput('npm_tag', channel.npmTag)
  setOutput('prerelease', String(channel.prerelease))
  setOutput('has_changesets', String(pending.length > 0))
  setOutput('pending_count', String(pending.length))

  console.log(
    `Release prep: branch=${branch} tag=${channel.npmTag} prerelease=${channel.prerelease} changesets=${pending.length}`,
  )
}

main()
