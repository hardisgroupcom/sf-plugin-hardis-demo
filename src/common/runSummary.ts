import * as fs from 'node:fs';
import type { SfdxHardisRunEvent } from 'sfdx-hardis/plugin-api';

export const PLUGIN_NAME = 'sf-plugin-hardis-demo';

/**
 * Key of the Pull Request comment of this plugin: one comment for the validation, one for the
 * deployment, one for the Apex tests. A later event with the same key updates the same comment.
 */
export function getCommentKey(event: SfdxHardisRunEvent): string {
  if (event.event === 'sfdx-hardis:apex-tests-done') {
    return 'apex-tests';
  }
  return event.data.checkOnly ? 'validation' : 'deployment';
}

// Markdown table describing the event, posted as the Pull Request comment of this plugin
export function buildRunSummaryMarkdown(event: SfdxHardisRunEvent): string {
  const { data } = event;
  const rows: Array<[string, string]> = [
    ['Event', `\`${event.event}\``],
    ['Command', `\`${event.commandId}\``],
    ['Status', formatStatus(data.status)],
  ];
  if (data.deploymentLabel) {
    rows.push(['Deployment', data.deploymentLabel]);
  }
  rows.push(['Apex classes and triggers in the coverage file', formatCoverageEntries(data.coverageFile)]);
  if (event.pullRequest) {
    rows.push(['Pull Request', `${event.pullRequest.sourceBranch ?? '?'} → ${event.pullRequest.targetBranch ?? '?'}`]);
  } else if (event.currentBranch) {
    rows.push(['Branch', event.currentBranch]);
  }
  if (event.org.username) {
    rows.push(['Org', event.org.username]);
  }
  const table = ['| | |', '| --- | --- |', ...rows.map(([label, value]) => `| ${label} | ${value} |`)].join('\n');
  return `${table}\n\n_Posted by the demo plugin from the \`${event.event}\` event of sfdx-hardis._`;
}

/**
 * Number of Apex classes and triggers in apex-coverage-results.json. sfdx-hardis writes the coverage
 * returned by Salesforce as it is: an object keyed by file after a deployment, an array after a test run.
 */
export function countCoverageEntries(coverageFile: string | null): number | null {
  if (!coverageFile || !fs.existsSync(coverageFile)) {
    return null;
  }
  try {
    const coverage: unknown = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
    if (Array.isArray(coverage)) {
      return coverage.length;
    }
    return coverage && typeof coverage === 'object' ? Object.keys(coverage).length : null;
  } catch {
    return null;
  }
}

function formatStatus(status: SfdxHardisRunEvent['data']['status']): string {
  if (status === 'success') {
    return '✅ success';
  }
  return status === 'failed' ? '❌ failed' : '❔ unknown';
}

function formatCoverageEntries(coverageFile: string | null): string {
  const count = countCoverageEntries(coverageFile);
  return count === null ? 'no coverage file' : String(count);
}
