import {coerce, satisfies} from 'semver';

export interface Externals {
  readonly [moduleName: string]: string;
}

export interface ExternalDependencies {
  readonly [moduleName: string]: string;
}

export class ExternalsValidator {
  public constructor(private readonly providedExternals: Externals) {
    for (const [moduleName, providedVersion] of Object.entries(
      providedExternals
    )) {
      if (!coerce(providedVersion)) {
        throw new Error(
          `The provided external ${JSON.stringify(
            moduleName
          )} has an invalid version ${JSON.stringify(providedVersion)}.`
        );
      }
    }
  }

  public validate(requiredExternals: ExternalDependencies): void {
    for (const [moduleName, versionRange] of Object.entries(
      requiredExternals
    )) {
      const providedVersion = this.providedExternals[moduleName];

      if (!providedVersion) {
        throw new Error(
          `The external dependency ${JSON.stringify(
            moduleName
          )} is not provided.`
        );
      }

      if (!satisfies(providedVersion, versionRange)) {
        throw new Error(
          `The external dependency ${JSON.stringify(
            moduleName
          )} in the required version range ${JSON.stringify(
            versionRange
          )} is not satisfied. The provided version is ${JSON.stringify(
            providedVersion
          )}.`
        );
      }
    }
  }
}
