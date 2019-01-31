import {coerce, satisfies} from 'semver';

export interface ProvidedExternals {
  readonly [moduleName: string]: string;
}

export interface RequiredExternals {
  readonly [moduleName: string]: string;
}

export class ExternalsValidator {
  public constructor(private readonly providedExternals: ProvidedExternals) {
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

  public validate(requiredExternals: RequiredExternals): void {
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
