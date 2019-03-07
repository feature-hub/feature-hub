import {Patcher} from '@rcgen/core';
import {merge} from '@rcgen/patchers';
import {prettierConfigFile, prettierIgnoreFile} from './files';

export function prettierConfig(config: object): Patcher<object> {
  return merge(prettierConfigFile.filename, config);
}

export function prettierIgnore(...filenames: string[]): Patcher<string[]> {
  return merge(prettierIgnoreFile.filename, [...filenames]);
}
