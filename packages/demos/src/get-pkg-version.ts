import path from 'path';
import pkgDir from 'pkg-dir';

export function getPkgVersion(pkgName: string): string {
  const pkgDirname = pkgDir.sync(require.resolve(pkgName)) || undefined;

  if (!pkgDirname) {
    throw new Error(`Unknown package '${pkgName}'.`);
  }

  return require(path.join(pkgDirname, 'package.json')).version;
}
