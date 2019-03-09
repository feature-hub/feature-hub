import {gitIgnore} from '../git/utils';
import {vscodeFiles} from './files';
import {vscodeFilesExclude, vscodeSearchExclude} from './utils';

const vscodeFilenames = vscodeFiles.map(({filename}) => filename);

export const vscodePatchers = [
  gitIgnore(vscodeFilenames),
  vscodeFilesExclude(vscodeFilenames),
  vscodeSearchExclude(vscodeFilenames)
];
