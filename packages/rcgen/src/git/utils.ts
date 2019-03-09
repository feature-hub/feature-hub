import {Patcher} from '@rcgen/core';
import {merge} from '@rcgen/patchers';
import {gitIgnoreFile} from './files';

export function gitIgnore(filenames: string[]): Patcher<string[]> {
  return merge(gitIgnoreFile.filename, filenames);
}
