// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../../codemirror/codemirror", 'codemirror/addon/mode/simple'));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../codemirror", "./simple"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  CodeMirror.defineSimpleMode("agentscript", {
	  // The start state contains the rules that are intially used
	  start: [
	    // Rules are matched in the order in which they appear, so there is
	    // no ambiguity between this one and the one above
	    {regex: /(?:FOR_BEGIN|FOR_END|SET|SETARRY|SETMACRO|SUBSCRIPTSETMACRO|SUBSCRIPT|ASYNC_BEGIN|ASYNC_END|FOR_BEGIN|FOR_END|FOREACH_BEGIN|FOREACH_END|WHILE_BEGIN|WHILE_END|IF_BEGIN|IF_END|SETVAL|SETARRY|SETBINARY|MONITORDATA|LOGIC|WAIT|EXPRESSION|TESTCASE_BEGIN|TESTCASE_END|CHECKPOINT_BEGIN|CHECKPOINT_END)\b/, token: "keyword"},
	     
	    {regex: /true|false|null|undefined/, token: "atom"},
	    {regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i,
	     token: "number"},
	    {regex: /\/\/.*/, token: "comment"},
	    {regex: /\/(?:[^\\]|\\.)*?\//, token: "variable-3"},
	    // A next property will cause the mode to move to a different state
	    {regex: /\/\*/, token: "comment", next: "comment"},
	    // indent and dedent properties guide autoindentation
	    {regex: /[\{\[\(]/, indent: true},
	    {regex: /[\}\]\)]/, dedent: true},
	    {regex: /[a-z$][\w$]*/, token: "variable"},
	    // You can embed other modes with the mode property. This rule
	    // causes all code between << and >> to be highlighted with the XML
	    // mode.
	    {regex: /<</, token: "meta", mode: {spec: "xml", end: />>/}}
	  ],
	  // The multi-line comment state.
	  comment: [
	    {regex: /.*?\*\//, token: "comment", next: "start"},
	    {regex: /.*/, token: "comment"}
	  ],
	  // The meta property contains global information about the mode. It
	  // can contain properties like lineComment, which are supported by
	  // all modes, and also directives like dontIndentStates, which are
	  // specific to simple modes.
	  meta: {
	    dontIndentStates: ["comment"],
	    lineComment: "//"
	  }
  });
  
});
