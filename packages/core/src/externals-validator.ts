import {satisfies, valid} from 'semver';

/**
 * A map of provided node module names as keys and strict semver versions as
 * values.
 */
export interface ProvidedExternals {
  readonly [moduleName: string]: string;
}

/**
 * A map of required node module names as keys and semver version ranges as
 * values.
 */
export interface RequiredExternals {
  readonly [moduleName: string]: string;
}

export interface ExternalsValidatorLike {
  validate(requiredExternals: RequiredExternals): void;
}

/**
 * The `ExternalsValidator` validates required externals against the provided
 * set of externals it is initilized with.
 */
export class ExternalsValidator implements ExternalsValidatorLike {
  /**
   * @throws Throws an error if the provided externals contain an invalid
   * version.
   */
  public constructor(private readonly providedExternals: ProvidedExternals) {
    for (const [moduleName, providedVersion] of Object.entries(
      providedExternals
    )) {
      if (!valid(providedVersion)) {
        throw new Error(
          `The provided version ${JSON.stringify(
            providedVersion
          )} for the external ${JSON.stringify(moduleName)} is invalid.`
        );
      }
    }
  }

  /**
   * Validate that the required externals are provided in a compatible version.
   *
   * @throws Throws an error if the required externals can't be satisfied.
   */
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
