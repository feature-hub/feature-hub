import {gitIgnore} from '../git/utils';
import {
  vscodeExtensionsRecommendations,
  vscodeFilesExclude,
  vscodeSearchExclude,
  vscodeSettings
} from '../vscode/utils';
import {prettierFiles} from './files';

const prettierFilenames = prettierFiles.map(({filename}) => filename);

const vscodeLanguageIds = [
  'css',
  'html',
  'javascript',
  'javascriptreact',
  'json',
  'jsonc',
  'less',
  'markdown',
  'scss',
  'typescript',
  'typescriptreact',
  'yaml'
];

export const prettierPatchers = [
  gitIgnore(prettierFilenames),
  vscodeExtensionsRecommendations(['esbenp.prettier-vscode']),
  vscodeFilesExclude(prettierFilenames),
  vscodeSearchExclude(prettierFilenames),
  vscodeSettings(
    vscodeLanguageIds.reduce<object>(
      (settings, vscodeLanguageId) => ({
        ...settings,
        [`[${vscodeLanguageId}]`]: {'editor.formatOnSave': true}
      }),
      {}
    )
  )
];
