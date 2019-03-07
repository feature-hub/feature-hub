import {gitIgnore} from '../git/utils';
import {
  vscodeExtensionsRecommendations,
  vscodeFilesExclude,
  vscodeSearchExclude,
  vscodeSettings
} from '../vscode/utils';
import {prettierFiles} from './files';

const prettierFilenames = prettierFiles.map(({filename}) => filename);

export const prettierPatchers = [
  gitIgnore(...prettierFilenames),
  vscodeExtensionsRecommendations('esbenp.prettier-vscode'),
  vscodeFilesExclude(...prettierFilenames),
  vscodeSearchExclude(...prettierFilenames),
  vscodeSettings({'editor.formatOnSave': true})
];
