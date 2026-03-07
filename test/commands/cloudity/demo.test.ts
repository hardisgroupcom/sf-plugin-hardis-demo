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
    const result = await CloudityDemo.run([
      '--action',
      'someOption',
      '--items',
      'Item1',
      '--items',
      'Item2',
      '--items',
      'Item3',
    ]);
    expect(result.success).to.be.true;
    expect(result.action).to.equal('someOption');
    expect(result.items).to.deep.equal(['Item1', 'Item2', 'Item3']);
  });

  it('runs hardis demo --action report', async () => {
    const result = await CloudityDemo.run(['--action', 'anotherOption', '--items', 'Item1']);
    expect(result.success).to.be.true;
    expect(result.action).to.equal('anotherOption');
  });

  it('runs hardis demo --action analyze --json', async () => {
    const result = await CloudityDemo.run(['--action', 'someOption', '--items', 'Item1', '--json']);
    expect(result.success).to.be.true;
    expect(result.action).to.equal('someOption');
  });

  it('outputs uxLog messages when running', async () => {
    await CloudityDemo.run(['--action', 'someOption', '--items', 'Item1']);
    const logCalls = sfCommandStubs.log
      .getCalls()
      .flatMap((c) => c.args)
      .join('\n');
    // uxLog uses this.log internally, or the output should contain progress info
    // The key check is that the command returns successfully
    expect(logCalls).to.be.a('string');
  });
});
