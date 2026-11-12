/**
 * Listens to the events sfdx-hardis sends as soon as Salesforce returns the result of a validation,
 * a deployment or an Apex test run (declared under oclif.hooks in package.json), and posts the
 * Pull Request comment of this plugin through the git provider sfdx-hardis already set up.
 *
 * oclif only loads this file when sfdx-hardis fires one of these events.
 */
import c from 'chalk';
import { postPullRequestComment, uxLog } from 'sfdx-hardis/plugin-api';
import type { SfdxHardisEventHookOptions, SfdxHardisRunEvent } from 'sfdx-hardis/plugin-api';
import { PLUGIN_NAME, buildRunSummaryMarkdown, getCommentKey } from '../common/runSummary.js';

const hook = async function (options: SfdxHardisEventHookOptions<SfdxHardisRunEvent>): Promise<void> {
  // A failing hook is only a warning for sfdx-hardis, but a plugin should never count on it
  try {
    uxLog('action', null, c.cyan(`[${PLUGIN_NAME}] Received ${options.event} (${options.data.status})`));
    const result = await postPullRequestComment({
      pluginName: PLUGIN_NAME,
      messageKey: getCommentKey(options),
      title: '🧩 Demo plugin: Salesforce run result',
      markdown: buildRunSummaryMarkdown(options),
      status: options.data.status === 'failed' ? 'invalid' : 'valid',
    });
    if (result.posted) {
      uxLog('success', null, c.green(`[${PLUGIN_NAME}] Pull Request comment posted`));
    } else {
      uxLog(
        'log',
        null,
        c.grey(`[${PLUGIN_NAME}] No Pull Request comment posted (${result.reason ?? 'unknown reason'})`)
      );
    }
  } catch (e) {
    uxLog('warning', null, c.yellow(`[${PLUGIN_NAME}] ${(e as Error).message}`));
  }
};

export default hook;
