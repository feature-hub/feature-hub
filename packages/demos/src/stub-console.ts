// tslint:disable:no-implicit-dependencies

import {Stubbed, stubMethods} from 'jest-stub-methods';

export function stubConsole(): void {
  let stubbedConsole: Stubbed<Console>;

  beforeAll(() => {
    stubbedConsole = stubMethods(console);
  });

  afterAll(() => {
    stubbedConsole.restore();
  });
}
