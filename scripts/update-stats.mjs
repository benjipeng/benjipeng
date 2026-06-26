#!/usr/bin/env node
// Aggregates total stargazers across benjipeng's personal repos and the
// App Automaton org, then injects the count into README.md between markers.
//
// Forked and archived repos are excluded so the number reflects stars earned
// on original, active work. Runs unauthenticated locally; uses GITHUB_TOKEN in
// CI for a higher rate limit. Invoked by .github/workflows/update-stats.yml.

import { readFile, writeFile } from "node:fs/promises";

const OWNERS = [
  { kind: "users", login: "benjipeng", repoType: "owner" },
  { kind: "orgs", login: "appautomaton", repoType: "public" },
];

const README = "README.md";
const START = "<!-- TOTAL_STARS:START -->";
const END = "<!-- TOTAL_STARS:END -->";

const token = process.env.GITHUB_TOKEN;
const headers = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "benjipeng-readme-stats",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

async function fetchRepos({ kind, login, repoType }) {
  const repos = [];
  for (let page = 1; ; page += 1) {
    const url = `https://api.github.com/${kind}/${login}/repos?per_page=100&type=${repoType}&page=${page}`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error(`GitHub API ${res.status} for ${login}: ${await res.text()}`);
    }
    const batch = await res.json();
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  return repos;
}

const countStars = (repos) =>
  repos
    .filter((r) => !r.fork && !r.archived)
    .reduce((sum, r) => sum + (r.stargazers_count || 0), 0);

function buildBadge(total) {
  const src =
    `https://img.shields.io/badge/Total%20stars-${total}-7AA2F7` +
    `?style=for-the-badge&labelColor=1A1B26&logo=github&logoColor=white`;
  return (
    `<a href="https://github.com/appautomaton">` +
    `<img alt="Total stars across benjipeng and the App Automaton org" src="${src}"></a>`
  );
}

async function main() {
  let total = 0;
  for (const owner of OWNERS) {
    total += countStars(await fetchRepos(owner));
  }

  const readme = await readFile(README, "utf8");
  const region = new RegExp(`${START}[\\s\\S]*?${END}`);
  if (!region.test(readme)) {
    throw new Error(`Markers ${START} / ${END} not found in ${README}`);
  }

  const next = readme.replace(region, `${START}\n${buildBadge(total)}\n${END}`);
  if (next === readme) {
    console.log(`No change (total stars = ${total}).`);
    return;
  }
  await writeFile(README, next);
  console.log(`Updated total stars badge -> ${total}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
