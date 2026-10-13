import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stripVTControlCharacters } from 'node:util';
import { config } from 'dotenv';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
config({ path: resolve(projectRoot, '.env.local') });

const sonarUrl = 'https://sonarcloud.io';
const projectKey = 'marosdaniel_cookbook-next';
const pageSize = 500;
const maxSearchResults = 10_000;

/* ───────────────────────── Színek / stílus ───────────────────────── */

const useColor =
  Boolean(process.env.FORCE_COLOR) ||
  (process.stdout.isTTY && !process.env.NO_COLOR);

const ansi =
  (open, close = 0) =>
  (text) =>
    useColor ? `\x1b[${open}m${text}\x1b[${close}m` : String(text);

const identity = (text) => String(text);

const c = {
  bold: ansi(1, 22),
  dim: ansi(2, 22),
  red: ansi(31, 39),
  yellow: ansi(33, 39),
  blue: ansi('38;5;75', 39),
  magenta: ansi(35, 39),
  cyan: ansi(36, 39),
  gray: ansi(90, 39),
  orange: ansi('38;5;208', 39),
  green: ansi(32, 39),
  white: ansi(97, 39),
  blocker: ansi('1;97;41', 0),
};

const SEVERITY_ORDER = ['BLOCKER', 'CRITICAL', 'MAJOR', 'MINOR', 'INFO'];

const severityStyle = {
  BLOCKER: { icon: '■', style: c.blocker },
  CRITICAL: { icon: '▲', style: (t) => c.bold(c.red(t)) },
  MAJOR: { icon: '●', style: c.yellow },
  MINOR: { icon: '○', style: c.cyan },
  INFO: { icon: '·', style: c.gray },
};

// Csak egycellás szélességű szimbólumok, hogy ne csússzon el a szegély.
const typeStyle = {
  BUG: { label: 'BUG', icon: '✗', style: c.red },
  VULNERABILITY: { label: 'VULN', icon: '◆', style: c.magenta },
  CODE_SMELL: { label: 'SMELL', icon: '≈', style: c.blue },
  SECURITY_HOTSPOT: { label: 'HOTSPOT', icon: '!', style: c.orange },
};

const getSeverity = (severity) =>
  severityStyle[severity] ?? { icon: '?', style: identity };
const getType = (type) =>
  typeStyle[type] ?? { label: type || '?', icon: '?', style: identity };

/* ───────────────────────── Táblázat-renderelés ───────────────────────── */

const visibleLength = (text) =>
  [...stripVTControlCharacters(String(text))].length;

function wrapText(text, width) {
  const value = String(text ?? '');
  if (width <= 0) return [value];
  const lines = [];

  for (const paragraph of value.split('\n')) {
    let line = '';
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      let rest = word;
      while ([...rest].length > width) {
        if (line) {
          lines.push(line);
          line = '';
        }
        const chars = [...rest];
        lines.push(chars.slice(0, width).join(''));
        rest = chars.slice(width).join('');
      }
      if (!line) {
        line = rest;
      } else if ([...line].length + 1 + [...rest].length <= width) {
        line += ` ${rest}`;
      } else {
        lines.push(line);
        line = rest;
      }
    }
    lines.push(line);
  }

  return lines.length > 0 ? lines : [''];
}

const border = (text) => c.gray(text);

function horizontal(widths, left, mid, right, fill = '─') {
  return border(left + widths.map((w) => fill.repeat(w + 2)).join(mid) + right);
}

function padLine(text, width) {
  return text + ' '.repeat(Math.max(0, width - visibleLength(text)));
}

/**
 * columns: [{ header, width }]
 * rows:    [[{ text, style? }, ...], ...]
 */
function renderTable(columns, rows) {
  const widths = columns.map((col) => col.width);
  const out = [];

  const renderRow = (cells) => {
    const wrapped = cells.map((cell, i) => ({
      lines: wrapText(cell.text, widths[i]),
      style: cell.style ?? identity,
    }));
    const height = Math.max(...wrapped.map((cell) => cell.lines.length));
    const result = [];

    for (let l = 0; l < height; l += 1) {
      const parts = wrapped.map((cell, i) => {
        const text = cell.lines[l] ?? '';
        const pad = ' '.repeat(Math.max(0, widths[i] - visibleLength(text)));
        return ` ${text ? cell.style(text) : ''}${pad} `;
      });
      result.push(`${border('│')}${parts.join(border('│'))}${border('│')}`);
    }
    return result;
  };

  out.push(horizontal(widths, '┌', '┬', '┐'));
  out.push(
    ...renderRow(
      columns.map((col) => ({
        text: col.header,
        style: (t) => c.bold(c.white(t)),
      })),
    ),
  );
  out.push(horizontal(widths, '╞', '╪', '╡', '═'));

  rows.forEach((row, index) => {
    out.push(...renderRow(row));
    if (index < rows.length - 1) out.push(horizontal(widths, '├', '┼', '┤'));
  });

  out.push(horizontal(widths, '└', '┴', '┘'));
  return out.join('\n');
}

function renderCards(issues, width) {
  const inner = width - 4;
  const out = [];

  issues.forEach((issue, index) => {
    const sev = getSeverity(issue.severity);
    const type = getType(issue.type);
    const head = `${c.dim(`#${index + 1}`)} ${sev.style(`${sev.icon} ${issue.severity}`)} ${type.style(`${type.icon} ${type.label}`)}`;
    const location = `${issue.file}${issue.line === '' ? '' : `:${issue.line}`}`;

    out.push(border(`┌${'─'.repeat(width - 2)}┐`));
    const body = [
      head,
      ...wrapText(location, inner).map((l) => c.cyan(l)),
      ...wrapText(issue.message, inner),
      ...wrapText(issue.rule, inner).map((l) => c.dim(l)),
    ];
    for (const line of body) {
      out.push(`${border('│')} ${padLine(line, inner)} ${border('│')}`);
    }
    out.push(border(`└${'─'.repeat(width - 2)}┘`));
  });

  return out.join('\n');
}

/* ───────────────────────── Nézetek ───────────────────────── */

function countBy(items, selector) {
  const map = new Map();
  for (const item of items) {
    const key = selector(item);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

function renderSummary(issues) {
  const bySeverity = countBy(issues, (i) => i.severity);
  const byType = countBy(issues, (i) => i.type);

  const knownSeverities = SEVERITY_ORDER.filter((s) => bySeverity.has(s));
  const otherSeverities = [...bySeverity.keys()].filter(
    (s) => !SEVERITY_ORDER.includes(s),
  );

  const sevLine = [...knownSeverities, ...otherSeverities]
    .map((s) => {
      const { icon, style } = getSeverity(s);
      return style(` ${icon} ${s || 'N/A'} ${bySeverity.get(s)} `);
    })
    .join(' ');

  const typeLine = [...byType.entries()]
    .map(([t, n]) => {
      const { label, icon, style } = getType(t);
      return style(`${icon} ${label} ${n}`);
    })
    .join(c.gray('  │  '));

  return [
    `${c.bold('Severity')}  ${sevLine}`,
    `${c.bold('Type')}      ${typeLine}`,
  ].join('\n');
}

function renderIssues(issues, termWidth) {
  if (termWidth < 80) return renderCards(issues, Math.max(30, termWidth));

  const wide = termWidth >= 120;
  const fixed = wide
    ? [
        { key: 'idx', header: '#', width: String(issues.length).length },
        { key: 'sev', header: 'SEVERITY', width: 10 },
        { key: 'type', header: 'TYPE', width: 9 },
        { key: 'rule', header: 'RULE', width: 18 },
      ]
    : [
        { key: 'sev', header: 'SEV', width: 10 },
        { key: 'type', header: 'TYPE', width: 9 },
      ];
  const flexible = [
    { key: 'location', header: 'LOCATION', share: 0.38, min: 16 },
    { key: 'message', header: 'MESSAGE', share: 0.62, min: 20 },
  ];

  const overhead = (fixed.length + flexible.length) * 3 + 1;
  const fixedWidth = fixed.reduce((sum, col) => sum + col.width, 0);
  const free = Math.max(36, termWidth - overhead - fixedWidth);

  const columns = [
    ...fixed,
    ...flexible.map((col) => ({
      ...col,
      width: Math.max(col.min, Math.floor(free * col.share)),
    })),
  ];

  const rows = issues.map((issue, index) => {
    const sev = getSeverity(issue.severity);
    const type = getType(issue.type);
    const location = `${issue.file}${issue.line === '' ? '' : `:${issue.line}`}`;
    const cells = {
      idx: { text: String(index + 1), style: c.dim },
      sev: { text: `${sev.icon} ${issue.severity}`, style: sev.style },
      type: { text: `${type.icon} ${type.label}`, style: type.style },
      rule: { text: issue.rule, style: c.dim },
      location: { text: location, style: c.cyan },
      message: { text: issue.message },
    };
    return columns.map((col) => cells[col.key]);
  });

  return renderTable(columns, rows);
}

/* ───────────────────────── Argumentumok / API ───────────────────────── */

function getOutputPath(args) {
  let outputPath;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    if (argument === '--output') {
      outputPath = args[index + 1];
      if (!outputPath || outputPath.startsWith('--')) {
        throw new Error('Usage: pnpm sonar:issues [--output <file>]');
      }
      index += 1;
    } else if (argument.startsWith('--output=')) {
      outputPath = argument.slice('--output='.length);
      if (!outputPath) {
        throw new Error('Usage: pnpm sonar:issues [--output <file>]');
      }
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  return outputPath;
}

async function fetchPage(token, page) {
  const searchParams = new URLSearchParams({
    componentKeys: projectKey,
    resolved: 'false',
    p: String(page),
    ps: String(pageSize),
  });
  const authorization = Buffer.from(`${token}:`).toString('base64');
  const response = await fetch(
    `${sonarUrl}/api/issues/search?${searchParams.toString()}`,
    { headers: { Authorization: `Basic ${authorization}` } },
  );

  if (!response.ok) {
    throw new Error(
      `SonarCloud request failed (${response.status} ${response.statusText}). Check the token and project access.`,
    );
  }

  const data = await response.json();
  if (!Array.isArray(data.issues)) {
    throw new Error('SonarCloud returned an unexpected issues response.');
  }

  return data;
}

async function main() {
  const token = process.env.SONAR_TOKEN;
  if (!token) {
    throw new Error(
      'SONAR_TOKEN is missing. Set it in the project-root .env.local as SONAR_TOKEN=your_token.',
    );
  }

  const outputPath = getOutputPath(process.argv.slice(2));
  const firstPage = await fetchPage(token, 1);
  const totalIssues = firstPage.paging?.total ?? firstPage.total;

  if (!Number.isInteger(totalIssues)) {
    throw new Error(
      'SonarCloud response did not include the total issue count.',
    );
  }

  const fetchableIssues = Math.min(totalIssues, maxSearchResults);
  const issues = [...firstPage.issues];
  const totalPages = Math.ceil(fetchableIssues / pageSize);

  for (let page = 2; page <= totalPages; page += 1) {
    const nextPage = await fetchPage(token, page);
    issues.push(...nextPage.issues);
  }

  const result = {
    projectKey,
    sonarUrl,
    fetchedAt: new Date().toISOString(),
    total: issues.length,
    issues,
  };
  const json = `${JSON.stringify(result, null, 2)}\n`;

  const rows = issues
    .map((issue) => ({
      key: issue.key ?? '',
      severity: issue.severity ?? '',
      type: issue.type ?? '',
      status: issue.status ?? '',
      rule: issue.rule ?? '',
      file: issue.component?.startsWith(`${projectKey}:`)
        ? issue.component.slice(projectKey.length + 1)
        : (issue.component ?? ''),
      line: issue.line ?? '',
      message: issue.message ?? '',
    }))
    .sort((a, b) => {
      const sa = SEVERITY_ORDER.indexOf(a.severity);
      const sb = SEVERITY_ORDER.indexOf(b.severity);
      return (
        (sa === -1 ? 99 : sa) - (sb === -1 ? 99 : sb) ||
        a.file.localeCompare(b.file) ||
        (Number(a.line) || 0) - (Number(b.line) || 0)
      );
    });

  if (outputPath) {
    const destination = resolve(process.cwd(), outputPath);
    await writeFile(destination, json, 'utf8');
    console.log(
      `${c.green('✔')} Full issue details saved to ${c.cyan(destination)}\n`,
    );
  }

  const termWidth = Math.max(40, (process.stdout.columns || 100) - 1);
  const title =
    rows.length > 0
      ? c.bold(`Unresolved SonarCloud issues: ${c.red(rows.length)}`)
      : c.bold(c.green('✔ No unresolved SonarCloud issues found.'));
  console.log(`${title}  ${c.dim(projectKey)}\n`);

  if (totalIssues > maxSearchResults) {
    console.log(
      `${c.yellow('⚠')} SonarCloud total is ${totalIssues}, but the search API returns at most ${maxSearchResults}. Narrow the query to see the rest.\n`,
    );
  }

  if (rows.length > 0) {
    console.log(`${renderSummary(rows)}\n`);
    console.log(renderIssues(rows, termWidth));
  }
}

main().catch((error) => {
  console.error(c.red(`✖ ${error.message}`));
  process.exitCode = 1;
});
