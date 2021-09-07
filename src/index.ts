import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { requestAPI } from './handler';

/**
 * Initialization data for the slurmtime extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'slurmtime:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension slurmtime is activated!');

    requestAPI<any>('get_example')
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The slurmtime server extension appears to be missing.\n${reason}`
        );
      });
  }
};

export default plugin;
