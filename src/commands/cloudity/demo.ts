/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { uxLog, uxLogTable, prompts, WebSocketClient, NotifProvider } from 'sfdx-hardis/plugin-api';
import type { PromptsQuestion, NotifMessage } from 'sfdx-hardis/plugin-api';
import c from 'chalk';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('sf-plugin-hardis-demo', 'cloudity.demo');

export type CloudityDemoResult = {
  success: boolean;
  action: string;
  items: string[];
};

export default class CloudityDemo extends SfCommand<CloudityDemoResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');

  public static readonly examples = ['$ sf cloudity:demo'];

  public static readonly flags = {
    action: Flags.string({
      char: 'a',
      summary: messages.getMessage('flags.action.summary'),
      description: messages.getMessage('flags.action.description'),
      options: ['someOption', 'anotherOption'],
    }),
    items: Flags.string({
      char: 'i',
      summary: messages.getMessage('flags.items.summary'),
      description: messages.getMessage('flags.items.description'),
      multiple: true,
    }),
  };

  public async run(): Promise<CloudityDemoResult> {
    const { flags } = await this.parse(CloudityDemo);

    // Log messages appear in both terminal and VS Code extension UI
    uxLog('action', this, c.cyan('Starting sfdx-hardis demo plugin...'));

    if (WebSocketClient.isAlive()) {
      uxLog('log', this, c.grey('VS Code extension is connected via WebSocket.'));
    } else {
      uxLog('log', this, c.grey('Running in terminal mode (no VS Code extension connected).'));
    }

    // Prompt user for action (VS Code UI or terminal fallback)
    let selectedAction = flags.action;
    if (!selectedAction) {
      const actionQuestion: PromptsQuestion = {
        type: 'select',
        name: 'action',
        message: 'What would you like to do?',
        description: 'Select a demo action to run',
        choices: [
          { title: 'Some option', value: 'someOption' },
          { title: 'Another option', value: 'anotherOption' },
        ],
      };
      const response = (await prompts(actionQuestion)) as { action: string };
      selectedAction = response.action;
    }

    let selectedItems: string[] = flags.items ?? [];
    if (selectedItems.length === 0) {
      const multiSelectDemo = await prompts({
        type: 'multiselect',
        name: 'items',
        message: 'Select items to process',
        description: 'This demonstrates a multi-select prompt with many choices',
        choices: [
          { title: 'Item 1', value: 'item1' },
          { title: 'Item 2', value: 'item2' },
          { title: 'Item 3', value: 'item3' },
          { title: 'Item 4', value: 'item4' },
          { title: 'Item 5', value: 'item5' },
          { title: 'Item 6', value: 'item6' },
          { title: 'Item 7', value: 'item7' },
          { title: 'Item 8', value: 'item8' },
          { title: 'Item 9', value: 'item9' },
          { title: 'Item 10', value: 'item10' },
        ],
      });
      selectedItems = (multiSelectDemo.items ?? []) as string[];
    }

    uxLog(
      'action',
      this,
      c.cyan(`Running stuff for action: ${selectedAction} and selected items: ${selectedItems.join(', ')}`)
    );

    // Show progress in VS Code
    const items = selectedItems.length > 0 ? selectedItems : ['Item1', 'Item2', 'Item3'];
    WebSocketClient.sendProgressStartMessage('Processing demo items', items.length);

    for (let i = 0; i < items.length; i++) {
      uxLog('log', this, c.grey(`Processing ${items[i]}...`));
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate async work
      WebSocketClient.sendProgressStepMessage(i + 1, items.length);
    }

    WebSocketClient.sendProgressEndMessage(items.length);

    uxLog('action', this, c.cyan(`Dummy results: ${selectedAction}`));
    // Display results as a table in both terminal and VS Code extension UI
    const tableData: object[] = items.map((item: string, index: number) => ({
      index: index + 1,
      name: item,
      status: 'OK',
      action: selectedAction,
    }));
    uxLogTable(this, tableData, ['index', 'name', 'status', 'action']);

    // Write a JSON report file and send it to the VS Code extension for display
    const reportFile = path.join(os.tmpdir(), `cloudity-demo-report-${Date.now()}.json`);
    const reportContent = {
      action: selectedAction,
      totalItems: items.length,
      results: tableData,
      generatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(reportFile, JSON.stringify(reportContent, null, 2), 'utf-8');
    uxLog('log', this, c.grey(`Report written to: ${reportFile}`));
    // Send the report file to the VS Code extension sidebar
    WebSocketClient.sendReportFileMessage(reportFile, 'Cloudity Demo Report', 'report');
    WebSocketClient.sendReportFileMessage('https://www.cloudity.com', 'Visit Cloudity Website', 'docUrl');

    // Generate a summary report
    const reportLines = items.map((item: string) => `• ${item}: OK`).join('\n');
    uxLog('success', this, c.green(`All ${items.length} items processed successfully!`));

    // Optionally send a notification to configured channels (Slack, Teams, etc.)

    const notifMessage: NotifMessage = {
      text: `Demo plugin completed action *${selectedAction}*\n- Items processed: ${items.length}`,
      type: 'DEPLOYMENT',
      severity: 'success',
      attachments: [{ text: reportLines }],
      buttons: [{ text: 'View Repository', url: 'https://github.com/hardisgroupcom/sf-plugin-hardis-demo' }],
      logElements: items.map((item: string) => ({ name: item, status: 'OK' })),
      data: { action: selectedAction, totalItems: items.length },
      metrics: {
        DemoItemsProcessed: items.length,
      },
    };
    await NotifProvider.postNotifications(notifMessage);
    uxLog('success', this, c.green('Notification sent to configured channels.'));

    return { success: true, action: selectedAction, items } as CloudityDemoResult;
  }
}
