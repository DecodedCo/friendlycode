define(function(require) {
  var $ = require("jquery"),
      Slowparse = require("slowparse/slowparse"),
      TreeInspectors = require("slowparse/tree-inspectors"),
      ParsingCodeMirror = require("fc/ui/parsing-codemirror"),
      CodeMirror = require("codemirror"),
      Help = require("fc/help"),
      LivePreview = require("fc/ui/live-preview"),
      ErrorHelp = require("fc/ui/error-help"),
      ContextSensitiveHelp = require("fc/ui/context-sensitive-help"),
      PreviewToEditorMapping = require("fc/ui/preview-to-editor-mapping"),
      Relocator = require("fc/ui/relocator"),
      HelpMsgTemplate = require("template!help-msg"),
      ErrorMsgTemplate = require("template!error-msg");

  require('slowparse-errors');
  require("codemirror/html");

  return function EditorPanes(options) {
    var self = {},
        div = options.container,
        initialValue = options.value || "",
        allowJS = options.allowJS || false,
        sourceCode = $('<div class="source-code"></div>').appendTo(div),
        previewArea = $('<div class="preview-holder"></div>').appendTo(div),
        helpArea = $('<div class="help hidden"></div>').appendTo(div),
        errorArea =  $('<div class="error hidden"></div>').appendTo(div);

    var codeMirror = self.codeMirror = ParsingCodeMirror(sourceCode[0], {
      mode: "text/html",
      theme: "jsbin",
      tabMode: "indent",
      lineWrapping: true,
      lineNumbers: true,
      gutters: [
        "CodeMirror-linenumbers",
        "gutter-markers"
      ],
      value: initialValue,
      parse: function(code) {
        function offsetObjChars(n, obj) {
          for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
              if (prop === 'start' || prop === 'end') {
                obj[prop] -= n;
              } else if (typeof obj[prop] === 'object') {
                offsetObjChars(n, obj[prop]);
              }
            }
          }
        }

        function offsetNodeChars(n, node) {
          if (node.parseInfo) {
            offsetObjChars(n, node.parseInfo);
          } else {
            for (var i = 0, l = node.childNodes.length; i < l; i++) {
              offsetNodeChars(n, node.childNodes[i]);
            }
          }
        }

        function offsetChars(n, parsed) {
          if (parsed.error) {
            offsetObjChars(n, parsed.error);
          }

          offsetNodeChars(n, parsed.document);

          return parsed;
        }

        var out = {};

        switch (codeMirror.getDoc().modeOption) {
          case 'text/html':
            out = Slowparse.HTML(document, code,
                                  allowJS ? [] : [TreeInspectors.forbidJS]);
            break;

          case 'text/css':
            out = offsetChars(7, Slowparse.HTML(document, '<style>' + code + '</style>',
                                  allowJS ? [] : [TreeInspectors.forbidJS]));
            break;

          case 'text/javascript':
            out = offsetChars(8, Slowparse.HTML(document, '<script>' + code + '</script>',
                                  allowJS ? [] : [TreeInspectors.forbidJS]));
            break;
        }

        out.documents = documents;
        out.currentDocument = self.currentDocument;

        return out;
      }
    });
    var relocator = Relocator(codeMirror);
    var cursorHelp = self.cursorHelp = ContextSensitiveHelp({
      codeMirror: codeMirror,
      helpIndex: Help.Index(),
      template: HelpMsgTemplate,
      helpArea: helpArea,
      relocator: relocator
    });
    var errorHelp = ErrorHelp({
      codeMirror: codeMirror,
      template: ErrorMsgTemplate,
      errorArea: errorArea,
      relocator: relocator
    });
    var preview = self.preview = LivePreview({
      codeMirror: codeMirror,
      ignoreErrors: true,
      previewArea: previewArea,
      previewLoader: options.previewLoader
    });
    var previewToEditorMapping = PreviewToEditorMapping(preview);

    var documents = self.documents = {};

    self.newDocument = function(name, content, mode) {
      var doc = CodeMirror.Doc(content, mode);

      documents[name] = doc;
    };

    self.switchDocument = function(name) {
      var doc = documents[name];

      if (doc) {
        codeMirror.swapDoc(doc);

        self.currentDocument = name;

        CodeMirror.signal(codeMirror, 'change');
        codeMirror.reparse();
      }

    };

    self.setMain = function(name) {
      documents.main = name;
    };

    return self;
  };
});
