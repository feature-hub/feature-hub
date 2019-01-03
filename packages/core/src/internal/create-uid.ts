export function createUid(id: string, idSpecifier?: string): string {
  return idSpecifier ? `${id}:${idSpecifier}` : id;
}
