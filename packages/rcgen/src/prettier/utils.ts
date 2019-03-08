import {Patcher} from '@rcgen/core';
import {merge} from '@rcgen/patchers';
import {SchemaForPrettierrc} from '@schemastore/prettierrc';
import {prettierConfigFile, prettierIgnoreFile} from './files';

export function prettierConfig(
  config: SchemaForPrettierrc
): Patcher<SchemaForPrettierrc> {
  return merge<SchemaForPrettierrc>(prettierConfigFile.filename, config);
}

export function prettierIgnore(...filenames: string[]): Patcher<string[]> {
  return merge(prettierIgnoreFile.filename, [...filenames]);
}
