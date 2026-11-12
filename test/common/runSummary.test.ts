import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { expect } from 'chai';
import type { SfdxHardisRunEvent } from 'sfdx-hardis/plugin-api';
import { buildRunSummaryMarkdown, countCoverageEntries, getCommentKey } from '../../src/common/runSummary.js';

function runEvent(
  overrides: Partial<SfdxHardisRunEvent['data']> = {},
  event: SfdxHardisRunEvent['event'] = 'sfdx-hardis:validation-done'
): SfdxHardisRunEvent {
  return {
    payloadVersion: 1,
    event,
    commandId: 'hardis:project:deploy:smart',
    reportDir: '/tmp/hardis-report',
    currentBranch: 'feature/story',
    pullRequest: { id: '42', number: 42, url: null, sourceBranch: 'feature/story', targetBranch: 'integration' },
    org: { username: 'user@example.com' },
    data: {
      checkOnly: true,
      deploymentLabel: 'main',
      status: 'success',
      coverageFile: null,
      ...overrides,
    },
  };
}

describe('demo plugin run summary', () => {
  it('uses one comment per kind of run', () => {
    expect(getCommentKey(runEvent())).to.equal('validation');
    expect(getCommentKey(runEvent({ checkOnly: false }, 'sfdx-hardis:deployment-done'))).to.equal('deployment');
    expect(getCommentKey(runEvent({ checkOnly: false }, 'sfdx-hardis:apex-tests-done'))).to.equal('apex-tests');
  });

  it('describes the event in a markdown table', () => {
    const markdown = buildRunSummaryMarkdown(runEvent({ status: 'failed' }));
    expect(markdown).to.contain('| Event | `sfdx-hardis:validation-done` |');
    expect(markdown).to.contain('| Status | ❌ failed |');
    expect(markdown).to.contain('| Pull Request | feature/story → integration |');
    expect(markdown).to.contain('no coverage file');
  });

  it('counts the classes of a deployment and of a test run coverage file', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'demo-coverage-'));
    const deployFile = path.join(dir, 'deploy.json');
    const testFile = path.join(dir, 'test.json');
    fs.writeFileSync(deployFile, JSON.stringify({ 'no-map/AccountService': {}, 'no-map/AccountTrigger': {} }));
    fs.writeFileSync(testFile, JSON.stringify([{ name: 'AccountService' }]));
    expect(countCoverageEntries(deployFile)).to.equal(2);
    expect(countCoverageEntries(testFile)).to.equal(1);
    expect(countCoverageEntries(null)).to.equal(null);
    fs.rmSync(dir, { recursive: true, force: true });
  });
});
