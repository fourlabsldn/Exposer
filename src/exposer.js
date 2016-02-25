function Exposer(constructor) {
  'uses strict';
  consStr = constructor.toString();

  if (!(this instanceof Exposer)) {
    return new Exposer(arguments[0]);
  }

  this.removeComments = function removeComments(funcStr) {
    return funcStr.replace(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s;])+\/\/(?:.*)$)/gm, ' ');
  };

  function removeModuleWrapping(funcStr) {
    var cleanFuncStr = funcStr;

    //Remove header
    cleanFuncStr = cleanFuncStr.replace(/function\s*?\w*?\((\w|\s|\,)*?\)\s*?\{/, '');
    cleanFuncStr = cleanFuncStr.replace(/\}\s*$/, '');

    return cleanFuncStr;
  }

  function getFunctionName(funcStr, pointer) {
    var scavange = funcStr.slice(pointer);

    var funcName = scavange.match(/\w*\s*\(/)[0];
    funcName = funcName.replace(/\s/g, '').replace('(', '');

    if (funcName === '') {
      scavange = funcStr.slice(0, pointer);
      funcName = scavange.match(/\w*\s*?=\s*?\(?\s*?function$/)[0];
      funcName = funcName.replace(/\s/g, '').replace(/\s*?=\s*?\(?\s*?function/, '');
    }

    return funcName;
  }

  function matchingChar(char) {
    var answer;
    switch (char) {
      case '{':
        answer = '}';
        break;
      case '}':
        answer = '{';
        break;
      case '\'':
        answer = '\'';
        break;
      case '"':
        answer = '"';
        break;
    }
    return answer;
  }

  function getFunctionLength(scavange) {
    var toBeMatched = [];
    var len = 0;
    var lastMatch;
    var currMatch;
    var idx;

    do {
      lastMatch = toBeMatched[toBeMatched.length - 1];
      idx = scavange.search(/\{|\}|\'|\"/);
      currMatch = scavange.charAt(idx);

      if (lastMatch === matchingChar(currMatch) &&
            scavange.charAt(idx - 1) !== '\\') {
        toBeMatched.pop();
      } else if (lastMatch !== "'" || lastMatch !== '"') {
        toBeMatched.push(currMatch);
      }

      scavange = scavange.slice(idx + 1);
      len += idx + 1;
    } while (toBeMatched.length > 0 && scavange.length > 0 && idx >= 0);

    if (toBeMatched.length > 0) {
      throw 'Parsing error';
    }

    return len;
  }

  this.getFunctions = function getFunctions(funcStr) {
    funcStr = funcStr || consStr;
    funcStr = this.removeComments(funcStr);

    //Isolate module from other code in file
    var moduleStr = funcStr.slice(0, getFunctionLength(funcStr));
    var moduleClean = removeModuleWrapping(moduleStr);

    var functions = [];
    var pointer = 0;
    var cutFrom;
    var FUNCWORDLEN = 'function'.length;
    var scavange = moduleClean;

    while (pointer < moduleClean.length) {
      // Go to next function
      idx = scavange.indexOf('function');
      if (idx < 0) { break; }

      cutFrom = idx + FUNCWORDLEN;
      pointer += cutFrom;
      scavange = scavange.slice(cutFrom);

      funcName = getFunctionName(moduleClean, pointer);
      functions.push(funcName);
      funcLen = getFunctionLength(scavange);
      scavange = scavange.slice(funcLen);
      pointer += funcLen;
    }

    return functions;
  };

  this.exposeAll = function exposeAll(func) {
    var funcStr = (func && func.toString) ? func.toString() : consStr;
    var closingBracketIdx = funcStr.search(/\}[^\}]*$/);

    var functionsExposition = '';
    var functions = this.getFunctions(funcStr);
    var funcName;
    while (functions.length) {
      funcName = functions.pop();
      functionsExposition += '\n\tthis._' + funcName + ' = ' + funcName + ';';
    }

    var topPart = funcStr.slice(0, closingBracketIdx);
    var bottomPart = funcStr.slice(closingBracketIdx, funcStr.length);
    var outcome = topPart + functionsExposition + bottomPart;

    eval.call(window, outcome);
  };

  return this;
}
