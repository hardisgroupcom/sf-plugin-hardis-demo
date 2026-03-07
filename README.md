# sf-plugin-hardis-demo

[![License](https://img.shields.io/badge/License-BSD%203--Clause-brightgreen.svg)](LICENSE)

Demo plugin showing how to create a Salesforce CLI plugin that integrates with the [sfdx-hardis](https://github.com/hardisgroupcom/sfdx-hardis) VS Code extension via the **Plugin API**.

## Overview

This repository demonstrates how to build a community plugin for sfdx-hardis that:

- Uses **`uxLog`** to send messages to both the terminal and VS Code extension UI
- Uses **`prompts`** to display interactive prompts in VS Code (with terminal fallback)
- Uses **`WebSocketClient`** to send progress indicators to VS Code
- Uses **`NotifProvider`** to post notifications to Slack, MS Teams, Email, or custom API channels

The WebSocket connection is automatically activated because this plugin lists `sfdx-hardis` in its `dependencies`.

## Getting Started

### Prerequisites

Install both sfdx-hardis and this demo plugin:

```bash
sf plugins install sfdx-hardis
sf plugins install sf-plugin-hardis-demo
```

### Commands

#### `sf hardis demo`

Run the demo command showing full Plugin API integration.

```bash
# Interactive mode (prompts for action)
sf hardis demo

# CI-friendly: pass --action to skip the prompt
sf hardis demo --action analyze
sf hardis demo --action report

# Also send a notification to configured channels
sf hardis demo --action report --notify
```

**Flags:**

| Flag       | Short | Description                                                         |
| ---------- | ----- | ------------------------------------------------------------------- |
| `--action` | `-a`  | Action to perform: `analyze` or `report` (skips interactive prompt) |
| `--notify` | `-n`  | Send notification to configured channels (Slack, Teams, etc.)       |

## Plugin API Usage

```typescript
import { uxLog, prompts, WebSocketClient, NotifProvider } from 'sfdx-hardis/plugin-api';
import type { PromptsQuestion, NotifMessage } from 'sfdx-hardis/plugin-api';
import c from 'chalk';

// Log to terminal + VS Code extension UI
uxLog('action', this, c.cyan('Starting...'));
uxLog('success', this, c.green('Done!'));

// Interactive prompt (VS Code UI or terminal fallback)
const response = await prompts({
  type: 'select',
  name: 'action',
  message: 'What would you like to do?',
  choices: [
    { title: 'Analyze', value: 'analyze' },
    { title: 'Report', value: 'report' },
  ],
});

// Progress tracking in VS Code
WebSocketClient.sendProgressStartMessage('Processing', items.length);
WebSocketClient.sendProgressStepMessage(i + 1, items.length);
WebSocketClient.sendProgressEndMessage(items.length);

// Notifications to Slack, Teams, Email, etc.
await NotifProvider.postNotifications({
  text: 'My plugin completed!',
  type: 'DEPLOYMENT',
  severity: 'success',
  logElements: [],
  data: {},
  metrics: {},
});
```

## Development

```bash
# Install dependencies
yarn install

# Build
yarn build

# Run tests
yarn test

# Run the command locally
./bin/dev.js hardis demo --action analyze
```

## Learn More

- [Creating sfdx-hardis Plugins — Full Guide](https://sfdx-hardis.cloudity.com/creating-plugins/)
- [sfdx-hardis VS Code Extension](https://marketplace.visualstudio.com/items?itemName=NicolasVuillamy.vscode-sfdx-hardis)
- [sfdx-hardis GitHub Repository](https://github.com/hardisgroupcom/sfdx-hardis)
