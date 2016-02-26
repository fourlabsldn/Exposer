Formatter = function (options) {
  options = options || {};

  var defaultStackFilter = function (string) {
    return string;
  };

  var defaultPrint = function (str) {
    console.log(str);
  };

  var ansi = {
    green: '\x1B[32m',
    red: '\x1B[31m',
    yellow: '\x1B[33m',
    none: '\x1B[0m'
  };

  this.showColors = options.showColors === undefined ? true : options.showColors;
  this.formatStack = options.stackFilter || defaultStackFilter;
  this.print = options.print || defaultPrint;

  this.printNewline = function () {
    this.print('\n');
  };

  this.colorize = function (color, str) {
    return this.showColors ? (ansi[color] + str + ansi.none) : str;
  };

  this.pluralize = function (str, count) {
    return count > 1 ? str + 's' : str;
  };

  this.indent = function (str, spaces) {
    var indentation = '';
    for (var i = 0; i < spaces; i++) {
      indentation += ' ';
    }
    return spaces <= 0 ? str : indentation + str;
  };
};

jasmineTerminalReporter = function (options) {
  var defaultTimer = {
    start: function () {
      this.started = Date.now();
    },
    elapsed: function () {
      return Math.round((Date.now() - this.started) / 100) * 100;
    }
  };

  options = options || {};
  options.done = options.done || function () {};
  options.includeStackTrace = !!options.includeStackTrace;
  options.timer = options.timer || defaultTimer;
  options.isVerbose = !!options.isVerbose;

  var verboseIndent = 0;
  var specCount;
  var pendingCount;
  var failedSpecs = [];

  var formatter = new Formatter(options);

  function specFailureDetails(result, specIndex) {
    formatter.printNewline();
    formatter.print((specIndex + 1) + ') ');
    formatter.print(result.fullName);

    result.failedExpectations.forEach(function (expectation, expectIndex) {
      formatter.printNewline();
      formatter.print((specIndex + 1) + '.' + (expectIndex + 1) + ') ');
      formatter.print(formatter.colorize('red', expectation.message));
      if (options.includeStackTrace) {
        formatter.printNewline();
        formatter.print(formatter.indent(formatter.formatStack(expectation.stack), 4));
      }
    });

    formatter.printNewline();
  }

  this.jasmineStarted = function (specInfo) {
    if (options.isVerbose) {
      var plural = formatter.pluralize('spec', specInfo.totalSpecsDefined);
      formatter.print('Running ' + specInfo.totalSpecsDefined + ' ' + plural + '.');
      formatter.printNewline();
    }
    specCount = 0;
    pendingCount = 0;
    options.timer.start();
  };

  this.jasmineDone = function () {
    formatter.printNewline();
    if (failedSpecs.length) {
      formatter.printNewline();
      formatter.print('Failures: ');
      failedSpecs.forEach(specFailureDetails);
    }

    formatter.printNewline();
    var specCounts = specCount + ' ' + formatter.pluralize('spec', specCount) + ', ' +
      failedSpecs.length + ' ' + formatter.pluralize('failure', failedSpecs.length);

    if (pendingCount) {
      specCounts += ', ' + pendingCount + ' pending ' + formatter.pluralize('spec', pendingCount);
    }

    formatter.print(specCounts);

    formatter.printNewline();
    var seconds = options.timer.elapsed() / 1000;
    formatter.print('Finished in ' + seconds + ' ' + formatter.pluralize('second', seconds));

    formatter.printNewline();

    options.done(failedSpecs.length === 0);
  };

  this.suiteStarted = function (suite) {
    if (options.isVerbose) {
      formatter.printNewline();
      formatter.print(formatter.indent(suite.description, verboseIndent));
      verboseIndent += 2;
    }
  };

  this.suiteDone = function () {
    if (options.isVerbose) {
      verboseIndent -= 2;
    }
  };

  this.specDone = function (result) {
    specCount++;
    var text;
    if (options.isVerbose) {
      formatter.printNewline();
    }

    if (result.status === 'pending') {
      pendingCount++;
      text = options.isVerbose ? formatter.indent(result.description + ': pending', verboseIndent + 2) : '*';
      formatter.print(formatter.colorize('yellow', text));
    } else if (result.status === 'passed') {
      text = options.isVerbose ? formatter.indent(result.description + ': passed', verboseIndent + 2) : '.';
      formatter.print(formatter.colorize('green', text));
    } else if (result.status === 'failed') {
      failedSpecs.push(result);
      text = options.isVerbose ? formatter.indent(result.description + ': failed', verboseIndent + 2) : 'F';
      formatter.print(formatter.colorize('red', text));
    }
  };
};

jasmine.getEnv().addReporter(new jasmineTerminalReporter());
