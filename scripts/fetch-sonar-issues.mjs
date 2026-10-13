import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
config({ path: resolve(projectRoot, '.env.local') });

const sonarUrl = 'https://sonarcloud.io';
const projectKey = 'marosdaniel_cookbook-next';
const pageSize = 500;

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

  const issues = [...firstPage.issues];
  const totalPages = Math.ceil(totalIssues / pageSize);

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

  if (outputPath) {
    const destination = resolve(process.cwd(), outputPath);
    await writeFile(destination, json, 'utf8');
    console.log(`Saved ${issues.length} issues to ${destination}`);
  } else {
    console.log(json);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
