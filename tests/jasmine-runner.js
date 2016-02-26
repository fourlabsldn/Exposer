var system = require('system');
var Reporter = require('jasmine-terminal-reporter');
var reporter = new Reporter();

if (system.args.length !== 2) {
    console.log('Usage: run-jasmine.js URL');
    phantom.exit(1);
}

// Check for console message indicating jasmine is finished running
var doneRegEx = /\d+ specs, (\d+) failure/;
// var noReallyDoneRegEx = /^Finished in \d[\d\.]* second/;
var rc;

var page = require('webpage').create();

// Route "console.log()" calls from within the Page context
// to the main Phantom context (i.e. current "this")

page.onConsoleMessage = function (msg) {
    system.stdout.write(msg);
    system.stdout.write("\n");
    var match = doneRegEx.exec(msg);
    if (match) {
        rc = match[1]==="0" ? 0 : 1;
        system.stdout.writeLine("");
        phantom.exit(rc);
    }
};

page.open(system.args[1], function(status){
    if (status !== "success") {
        console.log("Couldn't load the page");
    }
    system.stdout.writeLine("");
});
