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
      options: ['analyze', 'report'],
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
          { title: 'Analyze metadata', value: 'analyze' },
          { title: 'Generate report', value: 'report' },
        ],
      };
      const response = (await prompts(actionQuestion)) as { action: string };
      selectedAction = response.action;
    }

    uxLog('action', this, c.cyan(`Selected action: ${selectedAction}`));

    // Show progress in VS Code
    const items = ['Item1', 'Item2', 'Item3'];
    WebSocketClient.sendProgressStartMessage('Processing demo items', items.length);

    for (let i = 0; i < items.length; i++) {
      uxLog('log', this, c.grey(`Processing ${items[i]}...`));
      WebSocketClient.sendProgressStepMessage(i + 1, items.length);
    }

    WebSocketClient.sendProgressEndMessage(items.length);

    // Display results as a table in both terminal and VS Code extension UI
    const tableData = items.map((item, index) => ({
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
    const reportLines = items.map((item) => `• ${item}: OK`).join('\n');
    uxLog('success', this, c.green(`All ${items.length} items processed successfully!`));

    // Optionally send a notification to configured channels (Slack, Teams, etc.)

    const notifMessage: NotifMessage = {
      text: `Demo plugin completed action *${selectedAction}*\n- Items processed: ${items.length}`,
      type: 'DEPLOYMENT',
      severity: 'success',
      attachments: [{ text: reportLines }],
      buttons: [{ text: 'View Repository', url: 'https://github.com/hardisgroupcom/sf-plugin-hardis-demo' }],
      logElements: items.map((item) => ({ name: item, status: 'OK' })),
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
