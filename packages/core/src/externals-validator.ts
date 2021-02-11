import semverSatisfies from 'semver/functions/satisfies';
import semverValid from 'semver/functions/valid';

/**
 * A map of provided external names as keys and strict semver versions as
 * values.
 */
export interface ProvidedExternals {
  readonly [externalName: string]: string;
}

/**
 * A map of required external names as keys and semver version ranges as values.
 */
export interface RequiredExternals {
  readonly [externalName: string]: string;
}

/**
 * The `ExternalsValidator` validates required externals against the provided
 * set of externals it is initilized with.
 */
export class ExternalsValidator {
  /**
   * @throws Throws an error if the provided externals contain an invalid
   * version.
   */
  public constructor(private readonly providedExternals: ProvidedExternals) {
    for (const [externalName, providedVersion] of Object.entries(
      providedExternals
    )) {
      if (!semverValid(providedVersion)) {
        throw new Error(
          `The provided version ${JSON.stringify(
            providedVersion
          )} for the external ${JSON.stringify(externalName)} is invalid.`
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
    for (const [externalName, versionRange] of Object.entries(
      requiredExternals
    )) {
      const providedVersion = this.providedExternals[externalName];

      if (!providedVersion) {
        throw new Error(
          `The external dependency ${JSON.stringify(
            externalName
          )} is not provided.`
        );
      }

      if (!semverSatisfies(providedVersion, versionRange)) {
        throw new Error(
          `The external dependency ${JSON.stringify(
            externalName
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
