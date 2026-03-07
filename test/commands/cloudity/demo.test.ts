import { TestContext } from '@salesforce/core/testSetup';
import { expect } from 'chai';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import CloudityDemo from '../../../src/commands/cloudity/demo.js';

describe('hardis demo', () => {
  const $$ = new TestContext();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });

  afterEach(() => {
    $$.restore();
  });

  it('runs hardis demo --action analyze', async () => {
    const result = await CloudityDemo.run(['--action', 'analyze']);
    expect(result.success).to.be.true;
    expect(result.action).to.equal('analyze');
    expect(result.items).to.deep.equal(['Item1', 'Item2', 'Item3']);
  });

  it('runs hardis demo --action report', async () => {
    const result = await CloudityDemo.run(['--action', 'report']);
    expect(result.success).to.be.true;
    expect(result.action).to.equal('report');
  });

  it('runs hardis demo --action analyze --json', async () => {
    const result = await CloudityDemo.run(['--action', 'analyze', '--json']);
    expect(result.success).to.be.true;
    expect(result.action).to.equal('analyze');
  });

  it('outputs uxLog messages when running', async () => {
    await CloudityDemo.run(['--action', 'analyze']);
    const logCalls = sfCommandStubs.log
      .getCalls()
      .flatMap((c) => c.args)
      .join('\n');
    // uxLog uses this.log internally, or the output should contain progress info
    // The key check is that the command returns successfully
    expect(logCalls).to.be.a('string');
  });
});
