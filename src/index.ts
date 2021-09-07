import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { requestAPI } from './handler';

import { Widget } from '@lumino/widgets';

import { Poll } from '@lumino/polling';

import { ITopBar } from 'jupyterlab-topbar';

/**
 * Refresh interval for polling the time remaining (ms)
 */
const REFRESH_INTERVAL = 60000;

/**
 * A widget for displaying the time remaining
 */
class SlurmTimeRemainingWidget extends Widget {
  /**
   * Create a new time remaining widget
   */

  constructor() {
    super();

    // create the text element
    this.addClass('slurmtime-widget');
    this.textNode = document.createElement('div');
    this.textNode.textContent = '';
    this.node.appendChild(this.textNode);

    // do an initial update of the time remaining
    //void this._updateTimeRemaining();
    // also update periodically
    this._poll = new Poll({
      factory: async () => {
        await this._updateTimeRemaining();
      },
      frequency: { interval: REFRESH_INTERVAL }
    });
  }

  dispose(): void {
    super.dispose();
    this._poll.dispose();
  }

  async _updateTimeRemaining(): Promise<void> {
    requestAPI<any>('get_time_remaining')
      .then(data => {
        const time_text = data['data'];
        if (time_text !== null) {
          this.textNode.textContent = 'Time remaining: ' + data['data'];
        } else {
          this.textNode.textContent = '';
        }
      })
      .catch(reason => {
        console.error(
          `The slurmtime server extension appears to be missing.\n${reason}`
        );
      });
  }

  readonly textNode: HTMLDivElement;

  private _poll: Poll;
}

/**
 * Initialization data for the slurmtime extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'slurmtime:plugin',
  autoStart: true,
  requires: [ITopBar],
  activate: (app: JupyterFrontEnd, topBar: ITopBar) => {
    console.log('JupyterLab extension slurmtime is activated!');

    const timeWidget = new SlurmTimeRemainingWidget();
    topBar.addItem('slurm-time-remaining', timeWidget);
  }
};

export default plugin;
