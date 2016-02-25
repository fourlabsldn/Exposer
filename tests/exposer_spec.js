describe("Exposer module", function () {

  //Mock module
  function MockModule (var1, var2) {
    function private1() {}

    function private2 () {}

    function private3 (){}

    function private4(){}

    var private5 = function () {};

    var private6 = (function () {}());

    var private7 = (function () {}());

    //This is actually global, but we must account for that too.
    private8 = (function () {})();

    this.public1 = function () {};

    this.public2 = function public2 () {};

    this.public3 = (function public3(){});

    this.public4 = (function (){});

    return this;
  }

  it("Should have loaded the module", function () {
    expect(Exposer).toBeDefined();
  });

  it("")
})
