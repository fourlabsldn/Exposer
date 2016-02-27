var Exposer = require('../src/exposer');

describe('Exposer module', function () {
  'use strict';

  it('should have been loaded by Jasmine', function () {
    expect(Exposer).toBeDefined();
  });

  it('should be successfully instantiated without parameters', function () {
    var ex = new Exposer();
    expect(ex).toBeDefined();
    expect(typeof ex === 'object').toBe(true);
  });

  it('should have an exposeAll function', function () {
    var ex = new Exposer();
    expect(typeof ex.exposeAll === 'function').toBe(true);
  });
});
