import {File} from '@rcgen/core';
import {createLinesFiletype} from '@rcgen/filetypes';

export const gitIgnoreFile: File<string[]> = {
  filename: '.gitignore',
  filetype: createLinesFiletype(),
  initialContent: []
};

export const gitFiles = [gitIgnoreFile];
