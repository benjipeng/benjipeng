#!/usr/bin/env node
// Generates static README stats + pin cards as SVGs under profile/.
// Replaces the public github-readme-stats.vercel.app host (often paused).
// Invoked by .github/workflows/readme-cards.yml; safe to run locally with gh auth.

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "profile");

const USERNAME = "benjipeng";
const PINNED_REPOS = [
  "appautomaton/latex-arxiv-SKILL",
  "appautomaton/document-SKILLs",
  "appautomaton/agent-designer",
  "appautomaton/presentation",
];

// Match existing README palette (Tokyo Night blue accent / GitHub light blue).
const THEMES = {
  dark: {
    bg: "#0D1117",
    title: "#7AA2F7",
    icon: "#7AA2F7",
    text: "#8B949E",
    border: "#21262D",
  },
  light: {
    bg: "#FFFFFF",
    title: "#0969DA",
    icon: "#0969DA",
    text: "#57606A",
    border: "#D0D7DE",
  },
};

const token = process.env.GITHUB_TOKEN;
const headers = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "benjipeng-readme-cards",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatCount(n) {
  const num = Number(n) || 0;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(num);
}

/** Approximate rendered width for UI sans at a given font size. */
function textWidth(str, fontSize = 12) {
  return Math.ceil(String(str).length * fontSize * 0.58);
}

/**
 * Wrap text to a pixel budget so lines fill the content box (not a char guess).
 * Last line gets an ellipsis when the source is truncated.
 */
function wrapTextToWidth(text, maxWidthPx, fontSize, maxLines) {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return ["No description provided."];

  const fits = (s) => textWidth(s, fontSize) <= maxWidthPx;
  const lines = [];
  let current = "";
  let wordIndex = 0;

  while (wordIndex < words.length && lines.length < maxLines) {
    const word = words[wordIndex];
    const next = current ? `${current} ${word}` : word;
    if (fits(next)) {
      current = next;
      wordIndex += 1;
      continue;
    }
    if (current) {
      lines.push(current);
      current = "";
      if (lines.length >= maxLines) break;
      continue;
    }
    // Single word longer than the line — hard-trim.
    let cut = word;
    while (cut.length > 1 && !fits(`${cut}…`)) cut = cut.slice(0, -1);
    lines.push(`${cut}…`);
    wordIndex = words.length;
    break;
  }
  if (current && lines.length < maxLines) {
    lines.push(current);
    wordIndex = words.length; // fully consumed via current
  }

  // If we stopped early (max lines), mark ellipsis on the last line.
  if (wordIndex < words.length && lines.length) {
    let last = lines[lines.length - 1].replace(/…$/, "");
    while (last.length > 1 && !fits(`${last}…`)) {
      const cut = last.lastIndexOf(" ");
      last = cut > 0 ? last.slice(0, cut) : last.slice(0, -1);
    }
    lines[lines.length - 1] = `${last.trimEnd()}…`;
  }

  return lines;
}

// Exact 16x16 octicons from anuraghazra/github-readme-stats (src/common/icons.js).
// Nested <svg viewBox="0 0 16 16"> + fill-rule="evenodd" is required — bare <path>
// fragments mis-render (the broken fork glyph was from a bad path + no evenodd).
const ICONS = {
  repo: "M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z",
  star: "M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z",
  fork: "M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z",
  commits:
    "M1.643 3.143L.427 1.927A.25.25 0 000 2.104V5.75c0 .138.112.25.25.25h3.646a.25.25 0 00.177-.427L2.715 4.215a6.5 6.5 0 11-1.18 4.458.75.75 0 10-1.493.154 8.001 8.001 0 101.6-5.684zM7.75 4a.75.75 0 01.75.75v2.992l2.028.812a.75.75 0 01-.557 1.392l-2.5-1A.75.75 0 017 8.25v-3.5A.75.75 0 017.75 4z",
  prs: "M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.251 2.251 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z",
  issues:
    "M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm9 3a1 1 0 11-2 0 1 1 0 012 0zm-.25-6.25a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z",
  contribs:
    "M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z",
};

/** Nested 16×16 icon, same structure as github-readme-stats cards. */
function iconSvg(name, x, y, color, size = 16) {
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 16 16" fill="${color}" aria-hidden="true"><path fill-rule="evenodd" d="${ICONS[name]}"/></svg>`;
}

async function gh(path, init = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers || {}) },
  });
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status} ${path}: ${await res.text()}`);
  }
  return res.json();
}

async function fetchUserStats() {
  const query = `
    query($login: String!) {
      user(login: $login) {
        name
        repositoriesContributedTo(
          first: 1
          contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]
        ) {
          totalCount
        }
        contributionsCollection {
          totalCommitContributions
          restrictedContributionsCount
        }
        pullRequests { totalCount }
        issues { totalCount }
        repositories(ownerAffiliations: OWNER, isFork: false, first: 100) {
          nodes { stargazerCount }
        }
      }
    }
  `;

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: { login: USERNAME } }),
  });
  if (!res.ok) {
    throw new Error(`GraphQL ${res.status}: ${await res.text()}`);
  }
  const body = await res.json();
  if (body.errors?.length) {
    throw new Error(`GraphQL errors: ${JSON.stringify(body.errors)}`);
  }

  const user = body.data.user;
  const commits =
    (user.contributionsCollection.totalCommitContributions || 0) +
    (user.contributionsCollection.restrictedContributionsCount || 0);

  // Public API cannot fully mirror include_all_commits across orgs;
  // this matches what GITHUB_TOKEN can see (public + restricted when allowed).
  return {
    name: user.name || USERNAME,
    commits,
    prs: user.pullRequests.totalCount || 0,
    issues: user.issues.totalCount || 0,
    contribs: user.repositoriesContributedTo.totalCount || 0,
  };
}

async function fetchRepo(fullName) {
  const [owner, repo] = fullName.split("/");
  const data = await gh(`/repos/${owner}/${repo}`);
  return {
    fullName,
    name: data.name,
    description: data.description || "",
    language: data.language || "Unknown",
    stars: data.stargazers_count || 0,
    forks: data.forks_count || 0,
  };
}

function statsSvg(theme, stats) {
  const t = THEMES[theme];
  const rows = [
    { icon: "commits", label: "Total Commits", value: stats.commits },
    { icon: "prs", label: "Total PRs", value: stats.prs },
    { icon: "issues", label: "Total Issues", value: stats.issues },
    { icon: "contribs", label: "Contributed to", value: stats.contribs },
  ];

  const rowSvg = rows
    .map((row, i) => {
      const y = 42 + i * 28;
      return `
  ${iconSvg(row.icon, 25, y, t.icon, 14)}
  <text x="48" y="${y + 12}" class="label">${esc(row.label)}:</text>
  <text x="175" y="${y + 12}" class="value">${esc(formatCount(row.value))}</text>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="380" height="165" viewBox="0 0 380 165" role="img" aria-label="${esc(stats.name)} GitHub stats">
  <style>
    .title { font: 600 16px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${t.title}; }
    .label { font: 400 13px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${t.text}; }
    .value { font: 700 13px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${t.text}; }
  </style>
  <rect x="0.5" y="0.5" width="379" height="164" rx="4.5" fill="${t.bg}" stroke="${t.border}"/>
  <text x="25" y="30" class="title">${esc(stats.name)}'s GitHub Stats</text>
  ${rowSvg}
</svg>
`;
}

// Pin layout tokens — designed for 240px, not scaled down from a wider card.
// Symmetric pad on all sides; content box [pad, w-pad] × [pad, h-pad].
const PIN = {
  w: 240,
  pad: 16,
  titleSize: 13,
  bodySize: 12,
  metaSize: 11,
  iconTitle: 14,
  iconMeta: 12,
  lineHeight: 16,
  headerHeight: 18,
  gapAfterHeader: 10,
  gapBeforeMeta: 12,
  metaHeight: 14,
  maxDescLines: 3,
  radius: 4.5,
};

function pinHeight(descLineCount) {
  const lines = Math.max(1, descLineCount);
  return (
    PIN.pad +
    PIN.headerHeight +
    PIN.gapAfterHeader +
    lines * PIN.lineHeight +
    PIN.gapBeforeMeta +
    PIN.metaHeight +
    PIN.pad
  );
}

function pinSvg(theme, repo) {
  const t = THEMES[theme];
  const x0 = PIN.pad;
  const x1 = PIN.w - PIN.pad;
  const innerW = x1 - x0;

  const lines = wrapTextToWidth(
    repo.description,
    innerW,
    PIN.bodySize,
    PIN.maxDescLines,
  );
  const h = pinHeight(lines.length);

  // Vertical rhythm inside the symmetric content box.
  const y0 = PIN.pad;
  const titleBaseline = y0 + 13;
  const titleIconY = y0;
  const descStartBaseline = y0 + PIN.headerHeight + PIN.gapAfterHeader + 11;
  const metaBaseline =
    y0 +
    PIN.headerHeight +
    PIN.gapAfterHeader +
    lines.length * PIN.lineHeight +
    PIN.gapBeforeMeta +
    11;
  const metaIconY = metaBaseline - 10;

  const desc = lines
    .map(
      (line, i) =>
        `<text x="${x0}" y="${descStartBaseline + i * PIN.lineHeight}" class="desc">${esc(line)}</text>`,
    )
    .join("\n  ");

  // Meta: language at left edge of content box; stars mid; forks right-anchored to x1.
  const stars = formatCount(repo.stars);
  const forks = formatCount(repo.forks);
  const lang = repo.language;

  const langDotR = 4;
  const langTextX = x0 + langDotR * 2 + 6;
  const langGroupRight = langTextX + textWidth(lang, PIN.metaSize);

  const starGroupW = PIN.iconMeta + 4 + textWidth(stars, PIN.metaSize);
  const forkGroupW = PIN.iconMeta + 4 + textWidth(forks, PIN.metaSize);

  // Right-anchor forks so the group's right edge == x1 (symmetric pad).
  const forkIconX = x1 - forkGroupW;
  const forkTextX = forkIconX + PIN.iconMeta + 4;

  // Stars sit between lang and forks (centered in remaining span when possible).
  const midLeft = langGroupRight + 8;
  const midRight = forkIconX - 8;
  const midSpan = Math.max(0, midRight - midLeft);
  const starIconX =
    midSpan > starGroupW
      ? midLeft + (midSpan - starGroupW) / 2
      : Math.min(midLeft, x1 - forkGroupW - starGroupW - 8);
  const starTextX = starIconX + PIN.iconMeta + 4;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${PIN.w}" height="${h}" viewBox="0 0 ${PIN.w} ${h}" role="img" aria-label="${esc(repo.fullName)}">
  <style>
    .title { font: 600 ${PIN.titleSize}px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${t.title}; }
    .desc { font: 400 ${PIN.bodySize}px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${t.text}; }
    .meta { font: 400 ${PIN.metaSize}px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${t.text}; }
  </style>
  <rect x="0.5" y="0.5" width="${PIN.w - 1}" height="${h - 1}" rx="${PIN.radius}" fill="${t.bg}" stroke="${t.border}"/>
  ${iconSvg("repo", x0, titleIconY, t.icon, PIN.iconTitle)}
  <text x="${x0 + PIN.iconTitle + 6}" y="${titleBaseline}" class="title">${esc(repo.name)}</text>
  ${desc}
  <circle cx="${x0 + langDotR}" cy="${metaBaseline - 3}" r="${langDotR}" fill="${t.icon}"/>
  <text x="${langTextX}" y="${metaBaseline}" class="meta">${esc(lang)}</text>
  ${iconSvg("star", starIconX, metaIconY, t.icon, PIN.iconMeta)}
  <text x="${starTextX}" y="${metaBaseline}" class="meta">${esc(stars)}</text>
  ${iconSvg("fork", forkIconX, metaIconY, t.icon, PIN.iconMeta)}
  <text x="${forkTextX}" y="${metaBaseline}" class="meta">${esc(forks)}</text>
</svg>
`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  console.log("Fetching user stats…");
  const stats = await fetchUserStats();
  console.log("Fetching pinned repos…");
  const repos = [];
  for (const fullName of PINNED_REPOS) {
    repos.push(await fetchRepo(fullName));
  }

  const writes = [];
  for (const theme of ["dark", "light"]) {
    writes.push(
      writeFile(join(OUT_DIR, `stats-${theme}.svg`), statsSvg(theme, stats)),
    );
    for (const repo of repos) {
      const slug = repo.fullName.replace("/", "-");
      writes.push(
        writeFile(join(OUT_DIR, `pin-${slug}-${theme}.svg`), pinSvg(theme, repo)),
      );
    }
  }
  await Promise.all(writes);

  console.log(`Wrote ${writes.length} SVGs to profile/`);
  console.log(
    JSON.stringify(
      {
        stats,
        pins: repos.map((r) => ({
          name: r.fullName,
          stars: r.stars,
          forks: r.forks,
        })),
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
