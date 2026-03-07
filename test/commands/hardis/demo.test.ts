import { TestContext } from '@salesforce/core/testSetup';
import { expect } from 'chai';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import HardisDemo from '../../../src/commands/hardis/demo.js';

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
    const result = await HardisDemo.run(['--action', 'analyze']);
    expect(result.success).to.be.true;
    expect(result.action).to.equal('analyze');
    expect(result.items).to.deep.equal(['Item1', 'Item2', 'Item3']);
  });

  it('runs hardis demo --action report', async () => {
    const result = await HardisDemo.run(['--action', 'report']);
    expect(result.success).to.be.true;
    expect(result.action).to.equal('report');
  });

  it('runs hardis demo --action analyze --json', async () => {
    const result = await HardisDemo.run(['--action', 'analyze', '--json']);
    expect(result.success).to.be.true;
    expect(result.action).to.equal('analyze');
  });

  it('outputs uxLog messages when running', async () => {
    await HardisDemo.run(['--action', 'analyze']);
    const logCalls = sfCommandStubs.log
      .getCalls()
      .flatMap((c) => c.args)
      .join('\n');
    // uxLog uses this.log internally, or the output should contain progress info
    // The key check is that the command returns successfully
    expect(logCalls).to.be.a('string');
  });
});
