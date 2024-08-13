import {ExternalsValidator} from '../externals-validator';

describe('ExternalsValidator', () => {
  describe('#constructor', () => {
    it('throws an error for provided externals containing an invalid version', () => {
      expect(() => new ExternalsValidator({react: 'invalid'})).toThrow(
        new Error(
          'The provided version "invalid" for the external "react" is invalid.',
        ),
      );
    });

    it('throws an error for provided externals containing a coercable version', () => {
      expect(() => new ExternalsValidator({react: '2.0'})).toThrow(
        new Error(
          'The provided version "2.0" for the external "react" is invalid.',
        ),
      );
    });
  });

  describe('#validate', () => {
    it("doesn't throw for a satisfied required external", () => {
      const validator = new ExternalsValidator({react: '16.6.0'});

      expect(() => {
        validator.validate({react: '^16.2.0'});
      }).not.toThrow();
    });

    it('throws an error for an unsatisfied required external (wrong version)', () => {
      const validator = new ExternalsValidator({react: '16.6.0'});

      expect(() => {
        validator.validate({react: '^16.7.0'});
      }).toThrow(
        new Error(
          'The external dependency "react" in the required version range "^16.7.0" is not satisfied. The provided version is "16.6.0".',
        ),
      );

      expect(() => {
        validator.validate({react: '^16.7.0'}, 'test-consumer');
      }).toThrow(
        new Error(
          'The external dependency "react" as required by "test-consumer" in the version range "^16.7.0" is not satisfied. The provided version is "16.6.0".',
        ),
      );
    });

    it('throws an error for an unsatisfied required external (not provided)', () => {
      const validator = new ExternalsValidator({});

      expect(() => {
        validator.validate({react: '^16.7.0'});
      }).toThrow(new Error('The external dependency "react" is not provided.'));

      expect(() => {
        validator.validate({react: '^16.7.0'}, 'test-consumer');
      }).toThrow(
        new Error(
          'The external dependency "react" as required by "test-consumer" is not provided.',
        ),
      );
    });

    it('throws an error for an invalid required external', () => {
      const validator = new ExternalsValidator({react: '16.6.0'});

      expect(() => {
        validator.validate({react: 'invalid'});
      }).toThrow(
        new Error(
          'The external dependency "react" in the required version range "invalid" is not satisfied. The provided version is "16.6.0".',
        ),
      );

      expect(() => {
        validator.validate({react: 'invalid'}, 'test-consumer');
      }).toThrow(
        new Error(
          'The external dependency "react" as required by "test-consumer" in the version range "invalid" is not satisfied. The provided version is "16.6.0".',
        ),
      );
    });
  });
});
