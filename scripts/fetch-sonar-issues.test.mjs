import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { stripVTControlCharacters } from 'node:util';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fetchAllIssues,
  fetchPage,
  getOutputPath,
  isColorEnabled,
  main,
  maxSearchResults,
  normalizeIssues,
  pageSize,
  projectKey,
  renderCards,
  renderIssues,
  renderSummary,
  renderTable,
  runCli,
  wrapText,
} from './fetch-sonar-issues.mjs';

vi.mock('node:fs/promises', () => ({ writeFile: vi.fn() }));
vi.mock('dotenv', () => ({ config: vi.fn() }));

/* ───────────── segédek ───────────── */

const plain = (value) => stripVTControlCharacters(String(value));
const linesOf = (value) => plain(value).split('\n');
const widthsOf = (value) => linesOf(value).map((line) => [...line].length);
const maxWidth = (value) => Math.max(...widthsOf(value));

const makeIssue = (overrides = {}) => ({
  key: 'K-1',
  severity: 'MAJOR',
  type: 'CODE_SMELL',
  status: 'OPEN',
  rule: 'typescript:S1',
  component: `${projectKey}:src/a.ts`,
  line: 10,
  message: 'Something is off',
  ...overrides,
});

const makeRow = (overrides = {}) => ({
  key: 'K-1',
  severity: 'MAJOR',
  type: 'BUG',
  status: 'OPEN',
  rule: 'typescript:S1',
  file: 'src/a.ts',
  line: 1,
  message: 'Something is off',
  ...overrides,
});

const okResponse = (body) => ({
  ok: true,
  status: 200,
  statusText: 'OK',
  json: async () => body,
});

const errorResponse = (status, statusText) => ({
  ok: false,
  status,
  statusText,
  json: async () => ({}),
});

function mockSonar(total, { failOnPage } = {}) {
  const fetchMock = vi.fn(async (url) => {
    const page = Number(new URL(url).searchParams.get('p'));
    if (page === failOnPage) return errorResponse(500, 'Server Error');

    const start = (page - 1) * pageSize;
    const count = Math.max(0, Math.min(pageSize, total - start));
    return okResponse({
      paging: { total, pageIndex: page, pageSize },
      issues: Array.from({ length: count }, (_, i) =>
        makeIssue({ key: `K-${start + i}`, line: start + i + 1 }),
      ),
    });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

let logSpy;
let errorSpy;
const logged = () =>
  plain(logSpy.mock.calls.map((args) => args.join(' ')).join('\n'));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('NO_COLOR', '1');
  vi.stubEnv('FORCE_COLOR', '');
  vi.stubEnv('SONAR_TOKEN', 'secret-token');
  logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  process.exitCode = undefined;
});

/* ───────────── isColorEnabled ───────────── */

describe('isColorEnabled', () => {
  it('is disabled when NO_COLOR is set and nothing forces color', () => {
    expect(isColorEnabled()).toBe(false);
  });

  it('is enabled by FORCE_COLOR=1', () => {
    vi.stubEnv('FORCE_COLOR', '1');
    expect(isColorEnabled()).toBe(true);
  });

  it('treats FORCE_COLOR=0 as "do not force"', () => {
    vi.stubEnv('FORCE_COLOR', '0');
    expect(isColorEnabled()).toBe(false);
  });

  it('is enabled on a TTY without NO_COLOR', () => {
    const original = Object.getOwnPropertyDescriptor(process.stdout, 'isTTY');
    Object.defineProperty(process.stdout, 'isTTY', {
      value: true,
      configurable: true,
    });
    vi.stubEnv('NO_COLOR', '');
    try {
      expect(isColorEnabled()).toBe(true);
    } finally {
      if (original) Object.defineProperty(process.stdout, 'isTTY', original);
      else delete process.stdout.isTTY;
    }
  });
});

/* ───────────── wrapText ───────────── */

describe('wrapText', () => {
  it('returns a single line when the text fits', () => {
    expect(wrapText('hello world', 20)).toEqual(['hello world']);
  });

  it('wraps on word boundaries', () => {
    expect(wrapText('one two three four', 9)).toEqual([
      'one two',
      'three',
      'four',
    ]);
  });

  it('hard-breaks tokens longer than the width', () => {
    expect(wrapText('abcdefghij', 4)).toEqual(['abcd', 'efgh', 'ij']);
  });

  it('hard-breaks a long token that follows other words', () => {
    expect(wrapText('hi abcdefgh', 4)).toEqual(['hi', 'abcd', 'efgh']);
  });

  it.each([[undefined], [null], ['']])(
    'returns one empty line for %s',
    (input) => {
      expect(wrapText(input, 10)).toEqual(['']);
    },
  );

  it('preserves explicit newlines', () => {
    expect(wrapText('a\nb', 10)).toEqual(['a', 'b']);
  });

  it('collapses repeated whitespace', () => {
    expect(wrapText('a    b', 10)).toEqual(['a b']);
  });

  it('returns the whole value for a non-positive width', () => {
    expect(wrapText('abc def', 0)).toEqual(['abc def']);
    expect(wrapText('abc def', -3)).toEqual(['abc def']);
  });

  it('does not split surrogate pairs', () => {
    const lines = wrapText('😀😀😀', 2);
    expect(lines).toEqual(['😀😀', '😀']);
  });

  it('never produces a line wider than the limit', () => {
    const text =
      'Refactor this function to reduce its Cognitive Complexity from 21 to the 15 allowed. src/components/VeryLongComponentName.tsx';
    for (const width of [1, 3, 7, 12, 20, 33]) {
      for (const line of wrapText(text, width)) {
        expect([...line].length).toBeLessThanOrEqual(width);
      }
    }
  });
});

/* ───────────── getOutputPath ───────────── */

describe('getOutputPath', () => {
  it('returns undefined without arguments', () => {
    expect(getOutputPath([])).toBeUndefined();
  });

  it('parses "--output <file>"', () => {
    expect(getOutputPath(['--output', 'out.json'])).toBe('out.json');
  });

  it('parses "--output=<file>"', () => {
    expect(getOutputPath(['--output=out.json'])).toBe('out.json');
  });

  it('keeps "=" characters inside the path', () => {
    expect(getOutputPath(['--output=a=b.json'])).toBe('a=b.json');
  });

  it('uses the last value when repeated', () => {
    expect(getOutputPath(['--output=a.json', '--output', 'b.json'])).toBe(
      'b.json',
    );
  });

  it.each([[['--output']], [['--output', '--other']], [['--output=']]])(
    'throws the usage message for %j',
    (args) => {
      expect(() => getOutputPath(args)).toThrow(
        'Usage: pnpm sonar:issues [--output <file>]',
      );
    },
  );

  it.each([
    [['--bogus'], 'Unknown argument: --bogus'],
    [['positional'], 'Unknown argument: positional'],
    [['--output=a.json', '-x'], 'Unknown argument: -x'],
  ])('throws for unknown arguments %j', (args, message) => {
    expect(() => getOutputPath(args)).toThrow(message);
  });
});

/* ───────────── renderTable ───────────── */

describe('renderTable', () => {
  const columns = [
    { header: 'ID', width: 4 },
    { header: 'TEXT', width: 10 },
  ];
  const expectedWidth = 4 + 2 + (10 + 2) + 3;

  it('draws borders, a header separator and row separators', () => {
    const out = renderTable(columns, [
      [{ text: '1' }, { text: 'alpha' }],
      [{ text: '2' }, { text: 'beta' }],
    ]);
    const lines = linesOf(out);

    expect(lines).toHaveLength(7);
    expect(lines[0].startsWith('┌')).toBe(true);
    expect(lines[2].startsWith('╞')).toBe(true);
    expect(lines[2]).toContain('═');
    expect(lines[4].startsWith('├')).toBe(true);
    expect(lines[6].startsWith('└')).toBe(true);
    expect(new Set(widthsOf(out))).toEqual(new Set([expectedWidth]));
  });

  it('renders only the header for an empty row list', () => {
    const out = renderTable(columns, []);
    expect(linesOf(out)).toHaveLength(4);
    expect(plain(out)).toContain('TEXT');
  });

  it('wraps long cells and keeps every line the same width', () => {
    const out = renderTable(columns, [
      [{ text: '1' }, { text: 'one two three four five six' }],
    ]);
    expect(linesOf(out).length).toBeGreaterThan(5);
    expect(new Set(widthsOf(out))).toEqual(new Set([expectedWidth]));
  });

  it('ignores ANSI codes when aligning styled cells', () => {
    const red = (text) => `\x1b[31m${text}\x1b[0m`;
    const out = renderTable(columns, [
      [
        { text: '1', style: red },
        { text: 'alpha', style: red },
      ],
    ]);
    expect(new Set(widthsOf(out))).toEqual(new Set([expectedWidth]));
  });

  it('survives empty and undefined cell text', () => {
    const out = renderTable(columns, [[{ text: '' }, { text: undefined }]]);
    expect(new Set(widthsOf(out))).toEqual(new Set([expectedWidth]));
  });
});

/* ───────────── renderCards ───────────── */

describe('renderCards', () => {
  it('renders every line at exactly the requested width', () => {
    const out = renderCards(
      [
        makeRow({
          file: 'src/very/long/path/to/component/file.tsx',
          line: 42,
          message: 'A fairly long message that must wrap over several lines',
        }),
        makeRow({ line: '' }),
      ],
      40,
    );
    expect(new Set(widthsOf(out))).toEqual(new Set([40]));
  });

  it('shows index, severity, type and file:line', () => {
    const out = plain(renderCards([makeRow({ line: 7 })], 50));
    expect(out).toContain('#1');
    expect(out).toContain('MAJOR');
    expect(out).toContain('BUG');
    expect(out).toContain('src/a.ts:7');
  });

  it('omits the colon when there is no line number', () => {
    const out = plain(renderCards([makeRow({ line: '' })], 50));
    expect(out).toContain('src/a.ts');
    expect(out).not.toContain('src/a.ts:');
  });
});

/* ───────────── renderSummary ───────────── */

describe('renderSummary', () => {
  it('counts issues by severity and type', () => {
    const out = plain(
      renderSummary([
        makeRow({ severity: 'BLOCKER', type: 'BUG' }),
        makeRow({ severity: 'CRITICAL', type: 'BUG' }),
        makeRow({ severity: 'CRITICAL', type: 'CODE_SMELL' }),
      ]),
    );
    expect(out).toContain('BLOCKER 1');
    expect(out).toContain('CRITICAL 2');
    expect(out).toContain('BUG 2');
    expect(out).toContain('SMELL 1');
  });

  it('lists known severities in severity order', () => {
    const out = plain(
      renderSummary([
        makeRow({ severity: 'INFO' }),
        makeRow({ severity: 'BLOCKER' }),
      ]),
    );
    expect(out.indexOf('BLOCKER')).toBeLessThan(out.indexOf('INFO'));
  });

  it('includes unknown and empty severities instead of dropping them', () => {
    const out = plain(
      renderSummary([
        makeRow({ severity: 'WEIRD' }),
        makeRow({ severity: '' }),
      ]),
    );
    expect(out).toContain('WEIRD 1');
    expect(out).toContain('N/A 1');
  });

  it('falls back to the raw type for unknown types', () => {
    const out = plain(renderSummary([makeRow({ type: 'NEW_TYPE' })]));
    expect(out).toContain('NEW_TYPE 1');
  });
});

/* ───────────── renderIssues ───────────── */

describe('renderIssues', () => {
  const issues = Array.from({ length: 12 }, (_, i) =>
    makeRow({
      key: `K-${i}`,
      severity: ['BLOCKER', 'CRITICAL', 'MAJOR', 'MINOR', 'INFO'][i % 5],
      type: ['BUG', 'VULNERABILITY', 'CODE_SMELL', 'SECURITY_HOTSPOT'][i % 4],
      file: `src/features/some/deeply/nested/directory/Component${i}.tsx`,
      line: i + 1,
      rule: 'typescript:S3776',
      message:
        'Refactor this function to reduce its Cognitive Complexity from 21 to the 15 allowed.',
    }),
  );

  it.each([80, 99, 100, 119, 120, 140, 200])(
    'never exceeds a terminal width of %i (table)',
    (width) => {
      expect(maxWidth(renderIssues(issues, width))).toBeLessThanOrEqual(width);
    },
  );

  it.each([30, 50, 79])(
    'never exceeds a terminal width of %i (cards)',
    (width) => {
      expect(maxWidth(renderIssues(issues, width))).toBeLessThanOrEqual(width);
    },
  );

  it('uses cards below 80 columns', () => {
    const out = plain(renderIssues(issues, 79));
    expect(out).toContain('┌');
    expect(out).not.toContain('┬');
  });

  it('uses the compact table from 80 columns', () => {
    const out = plain(renderIssues(issues, 80));
    expect(out).toContain('┬');
    expect(out).toContain('LOCATION');
    expect(out).not.toContain('RULE');
  });

  it('uses the wide table from 120 columns', () => {
    expect(plain(renderIssues(issues, 119))).not.toContain('RULE');
    const out = plain(renderIssues(issues, 120));
    expect(out).toContain('RULE');
    expect(out).toContain('SEVERITY');
    expect(out).toContain('#');
  });

  it('separates rows with a border line', () => {
    const out = plain(renderIssues(issues, 100));
    const separators = out.split('\n').filter((line) => line.startsWith('├'));
    expect(separators).toHaveLength(issues.length - 1);
  });

  it('does not throw for unknown severity/type or a missing line', () => {
    const odd = [makeRow({ severity: 'WEIRD', type: 'ODD', line: '' })];
    for (const width of [40, 100, 160]) {
      expect(() => renderIssues(odd, width)).not.toThrow();
    }
  });

  it('wraps a very long unbroken path inside the table', () => {
    const long = [makeRow({ file: `src/${'x'.repeat(200)}.ts` })];
    expect(maxWidth(renderIssues(long, 100))).toBeLessThanOrEqual(100);
  });

  it('emits ANSI colors only when color is enabled', () => {
    expect(renderIssues(issues, 100)).not.toContain('\x1b[');
    vi.stubEnv('FORCE_COLOR', '1');
    const colored = renderIssues(issues, 100);
    expect(colored).toContain('\x1b[');
    expect(maxWidth(colored)).toBeLessThanOrEqual(100);
  });
});

/* ───────────── normalizeIssues ───────────── */

describe('normalizeIssues', () => {
  it('strips the project prefix from the component', () => {
    const [row] = normalizeIssues([makeIssue()]);
    expect(row.file).toBe('src/a.ts');
  });

  it('keeps components that do not carry the project prefix', () => {
    const rows = normalizeIssues([
      makeIssue({ component: 'other:src/x.ts' }),
      makeIssue({ component: projectKey }),
    ]);
    expect(rows.map((row) => row.file).sort()).toEqual(
      [projectKey, 'other:src/x.ts'].sort(),
    );
  });

  it('fills missing fields with empty strings', () => {
    expect(normalizeIssues([{}])).toEqual([
      {
        key: '',
        severity: '',
        type: '',
        status: '',
        rule: '',
        file: '',
        line: '',
        message: '',
      },
    ]);
  });

  it('returns an empty array for no issues', () => {
    expect(normalizeIssues([])).toEqual([]);
  });

  it('sorts by severity, then file, then numeric line; unknown severities last', () => {
    const rows = normalizeIssues([
      makeIssue({
        key: 'a',
        severity: 'MINOR',
        component: `${projectKey}:b.ts`,
        line: 1,
      }),
      makeIssue({
        key: 'b',
        severity: 'BLOCKER',
        component: `${projectKey}:z.ts`,
        line: 5,
      }),
      makeIssue({
        key: 'c',
        severity: 'MAJOR',
        component: `${projectKey}:a.ts`,
        line: 10,
      }),
      makeIssue({
        key: 'd',
        severity: 'MAJOR',
        component: `${projectKey}:a.ts`,
        line: 2,
      }),
      makeIssue({ key: 'e', severity: 'WEIRD' }),
    ]);
    expect(rows.map((row) => row.key)).toEqual(['b', 'd', 'c', 'a', 'e']);
  });

  it('does not mutate the input array', () => {
    const input = [
      makeIssue({ key: 'x', severity: 'INFO' }),
      makeIssue({ key: 'y', severity: 'BLOCKER' }),
    ];
    normalizeIssues(input);
    expect(input.map((issue) => issue.key)).toEqual(['x', 'y']);
  });
});

/* ───────────── fetchPage ───────────── */

describe('fetchPage', () => {
  it('requests the right URL with Basic auth', async () => {
    const fetchMock = vi.fn(async () => okResponse({ issues: [] }));
    vi.stubGlobal('fetch', fetchMock);

    await fetchPage('tok', 3);

    const [url, options] = fetchMock.mock.calls[0];
    const parsed = new URL(url);
    expect(parsed.origin).toBe('https://sonarcloud.io');
    expect(parsed.pathname).toBe('/api/issues/search');
    expect(parsed.searchParams.get('componentKeys')).toBe(projectKey);
    expect(parsed.searchParams.get('resolved')).toBe('false');
    expect(parsed.searchParams.get('p')).toBe('3');
    expect(parsed.searchParams.get('ps')).toBe(String(pageSize));
    expect(options.headers.Authorization).toBe(
      `Basic ${Buffer.from('tok:').toString('base64')}`,
    );
  });

  it('returns the parsed body on success', async () => {
    const body = { issues: [makeIssue()], paging: { total: 1 } };
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => okResponse(body)),
    );
    await expect(fetchPage('tok', 1)).resolves.toEqual(body);
  });

  it.each([
    [401, 'Unauthorized'],
    [403, 'Forbidden'],
    [404, 'Not Found'],
    [500, 'Internal Server Error'],
  ])('throws a helpful error for HTTP %i', async (status, text) => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => errorResponse(status, text)),
    );
    await expect(fetchPage('tok', 1)).rejects.toThrow(
      `SonarCloud request failed (${status} ${text}). Check the token and project access.`,
    );
  });

  it('never leaks the token in error messages', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => errorResponse(401, 'Unauthorized')),
    );
    await expect(fetchPage('super-secret', 1)).rejects.not.toThrow(
      /super-secret/,
    );
  });

  it.each([
    [{}],
    [{ issues: null }],
    [{ issues: {} }],
    [{ issues: 'nope' }],
    [null],
  ])('rejects an unexpected body %j', async (body) => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => okResponse(body)),
    );
    await expect(fetchPage('tok', 1)).rejects.toThrow();
  });

  it('reports the specific message when "issues" is not an array', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => okResponse({ issues: {} })),
    );
    await expect(fetchPage('tok', 1)).rejects.toThrow(
      'SonarCloud returned an unexpected issues response.',
    );
  });

  it('propagates invalid JSON errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => {
          throw new SyntaxError('Unexpected token < in JSON');
        },
      })),
    );
    await expect(fetchPage('tok', 1)).rejects.toThrow(SyntaxError);
  });

  it('propagates network failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('fetch failed');
      }),
    );
    await expect(fetchPage('tok', 1)).rejects.toThrow('fetch failed');
  });
});

/* ───────────── fetchAllIssues ───────────── */

describe('fetchAllIssues', () => {
  it.each([
    [0, 1],
    [1, 1],
    [500, 1],
    [501, 2],
    [1000, 2],
    [1001, 3],
  ])('with %i issues requests %i page(s)', async (total, pages) => {
    const fetchMock = mockSonar(total);
    const result = await fetchAllIssues('tok');
    expect(fetchMock).toHaveBeenCalledTimes(pages);
    expect(result.issues).toHaveLength(total);
    expect(result.total).toBe(total);
  });

  it('falls back to the top-level "total" field', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        okResponse({ total: 2, issues: [makeIssue(), makeIssue()] }),
      ),
    );
    await expect(fetchAllIssues('tok')).resolves.toMatchObject({ total: 2 });
  });

  it.each([
    [{ issues: [] }],
    [{ issues: [], paging: {} }],
    [{ issues: [], paging: { total: '5' } }],
    [{ issues: [], paging: { total: 1.5 } }],
    [{ issues: [], paging: { total: null } }],
  ])('throws when the total is missing or invalid: %j', async (body) => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => okResponse(body)),
    );
    await expect(fetchAllIssues('tok')).rejects.toThrow(
      'SonarCloud response did not include the total issue count.',
    );
  });

  it('stops at the API result window and reports the real total', async () => {
    const fetchMock = mockSonar(maxSearchResults + 500);
    const result = await fetchAllIssues('tok');
    expect(fetchMock).toHaveBeenCalledTimes(maxSearchResults / pageSize);
    expect(result.issues).toHaveLength(maxSearchResults);
    expect(result.total).toBe(maxSearchResults + 500);
  });

  it('fails if a later page fails', async () => {
    mockSonar(1200, { failOnPage: 2 });
    await expect(fetchAllIssues('tok')).rejects.toThrow('500 Server Error');
  });
});

/* ───────────── main ───────────── */

describe('main', () => {
  it('fails fast without SONAR_TOKEN and does not call the API', async () => {
    vi.stubEnv('SONAR_TOKEN', '');
    const fetchMock = mockSonar(1);
    await expect(main([])).rejects.toThrow('SONAR_TOKEN is missing');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('validates arguments before calling the API', async () => {
    const fetchMock = mockSonar(1);
    await expect(main(['--bogus'])).rejects.toThrow(
      'Unknown argument: --bogus',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('prints the count, summary and table for a single page', async () => {
    mockSonar(2);
    await main([]);
    const out = logged();
    expect(out).toContain('Unresolved SonarCloud issues: 2');
    expect(out).toContain('Severity');
    expect(out).toContain('LOCATION');
    expect(writeFile).not.toHaveBeenCalled();
  });

  it('prints a friendly message and no table when there are no issues', async () => {
    mockSonar(0);
    await main([]);
    const out = logged();
    expect(out).toContain('No unresolved SonarCloud issues found.');
    expect(out).not.toContain('┌');
  });

  it('fetches all pages and writes the raw JSON when --output is given', async () => {
    const fetchMock = mockSonar(1200);
    await main(['--output', 'out/issues.json']);

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(writeFile).toHaveBeenCalledTimes(1);

    const [destination, json, encoding] = vi.mocked(writeFile).mock.calls[0];
    expect(destination).toBe(resolve(process.cwd(), 'out/issues.json'));
    expect(encoding).toBe('utf8');
    expect(json.endsWith('\n')).toBe(true);

    const saved = JSON.parse(json);
    expect(saved.total).toBe(1200);
    expect(saved.issues).toHaveLength(1200);
    expect(saved.issues[0].key).toBe('K-0');
    expect(saved.projectKey).toBe(projectKey);
    expect(Number.isNaN(Date.parse(saved.fetchedAt))).toBe(false);
    expect(logged()).toContain('Full issue details saved to');
  });

  it('supports --output=<file>', async () => {
    mockSonar(1);
    await main(['--output=r.json']);
    expect(vi.mocked(writeFile).mock.calls[0][0]).toBe(
      resolve(process.cwd(), 'r.json'),
    );
  });

  it('warns when the API window truncates the result', async () => {
    mockSonar(maxSearchResults + 500);
    await main([]);
    const out = logged();
    expect(out).toContain(`at most ${maxSearchResults}`);
    expect(out).toContain(`Unresolved SonarCloud issues: ${maxSearchResults}`);
  }, 30_000);

  it('does not write a partial file when a page fails', async () => {
    mockSonar(1200, { failOnPage: 3 });
    await expect(main(['--output', 'out.json'])).rejects.toThrow('500');
    expect(writeFile).not.toHaveBeenCalled();
  });

  it('propagates file write errors', async () => {
    mockSonar(1);
    vi.mocked(writeFile).mockRejectedValueOnce(
      Object.assign(new Error('EACCES: permission denied'), { code: 'EACCES' }),
    );
    await expect(main(['--output', '/root/nope.json'])).rejects.toThrow(
      'EACCES',
    );
  });

  it('sends the token only in the Authorization header', async () => {
    const fetchMock = mockSonar(1);
    await main(['--output', 'out.json']);

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).not.toContain('secret-token');
    expect(options.headers.Authorization).toBe(
      `Basic ${Buffer.from('secret-token:').toString('base64')}`,
    );
    expect(logged()).not.toContain('secret-token');
    expect(vi.mocked(writeFile).mock.calls[0][1]).not.toContain('secret-token');
  });
});

/* ───────────── runCli ───────────── */

describe('runCli', () => {
  it('leaves the exit code untouched on success', async () => {
    mockSonar(1);
    await runCli([]);
    expect(process.exitCode).toBeUndefined();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('prints the error message and sets exit code 1', async () => {
    vi.stubEnv('SONAR_TOKEN', '');
    await runCli([]);
    expect(process.exitCode).toBe(1);
    expect(plain(errorSpy.mock.calls[0][0])).toMatch(
      /^✖ SONAR_TOKEN is missing/,
    );
  });

  it('handles usage errors', async () => {
    await runCli(['--output']);
    expect(process.exitCode).toBe(1);
    expect(plain(errorSpy.mock.calls[0][0])).toContain(
      'Usage: pnpm sonar:issues',
    );
  });

  it('handles HTTP errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => errorResponse(401, 'Unauthorized')),
    );
    await runCli([]);
    expect(process.exitCode).toBe(1);
    expect(plain(errorSpy.mock.calls[0][0])).toContain('401 Unauthorized');
  });

  it('handles non-Error rejections', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject('boom')),
    );
    await runCli([]);
    expect(process.exitCode).toBe(1);
    expect(plain(errorSpy.mock.calls[0][0])).toBe('✖ boom');
  });
});

/* ───────────── modul betöltése ───────────── */

describe('module import', () => {
  it('has no side effects (does not call the API or set an exit code)', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.resetModules();
    await import('./fetch-sonar-issues.mjs');
    expect(fetchMock).not.toHaveBeenCalled();
    expect(process.exitCode).toBeUndefined();
  });
});
