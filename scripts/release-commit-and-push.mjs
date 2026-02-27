import { execSync } from 'node:child_process'

function run(command) {
  return execSync(command, { encoding: 'utf8' }).trim()
}

function main() {
  const branch = process.env.GITHUB_REF_NAME || run('git branch --show-current')

  run('git add -A')
  run(
    `git -c user.name='github-actions[bot]' -c user.email='41898282+github-actions[bot]@users.noreply.github.com' commit -m "ci: Version Packages [skip ci]"`,
  )
  run(`git push --follow-tags origin "HEAD:${branch}"`)

  console.log(`Committed and pushed release changes to ${branch}.`)
}

main()
