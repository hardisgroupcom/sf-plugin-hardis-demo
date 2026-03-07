# summary

Run the sfdx-hardis demo command showcasing VS Code extension integration.

# description

Demonstrates how to use the sfdx-hardis Plugin API:

- **uxLog** — sends log messages to both the terminal and the VS Code extension UI
- **uxLogTable** — displays tabular data in both the terminal and the VS Code extension UI
- **prompts** — displays interactive prompts in VS Code (or falls back to terminal)
- **WebSocketClient** — sends progress indicators and report file notifications to VS Code
- **NotifProvider** — posts notifications to Slack, MS Teams, Email, or custom API channels

The WebSocket connection is automatically activated because this plugin lists
`sfdx-hardis` in its `dependencies`.

# flags.action.summary

Action to perform: 'analyze' or 'report'.

# flags.action.description

Pass this flag to skip the interactive prompt and run in CI mode.

# flags.notify.summary

Send a notification to configured channels (Slack, MS Teams, Email, etc.).

# examples

- Run the demo interactively (prompts for action):

  <%= config.bin %> <%= command.id %>

- Run the analyze action without prompts (CI-friendly):

  <%= config.bin %> <%= command.id %> --action analyze

- Run the report action and send a notification:

  <%= config.bin %> <%= command.id %> --action report --notify
