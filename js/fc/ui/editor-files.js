// TODO: proper UI. alerts and prompts make me sad.

define(function(require) {
  var $ = require("jquery-tipsy");

  return function EditorFiles(options) {
    var container = options.container,
      fileList = $('<ul></ul>')
        .appendTo(container),
      addFileButton = $('<li>New</li>')
        .addClass('add-file')
        .appendTo(fileList);

    var panes = options.panes;

    var modes = {
      js: 'text/javascript',
      css: 'text/css',
      html: 'text/html'
    };

    function addFile(name, content) {
      var ext = name.replace(/^[\s\S]+\./, '').toLowerCase();

      if (content === undefined) {
        content = '';
      }

      if (ext === 'htm') {
        ext = 'html';
      }

      if (ext === 'html' || ext === 'css' || ext === 'js') {
        panes.newDocument(name, content, modes[ext]);

        return $('<li></li>')
          .addClass('type-' + ext)
          .addClass('file')
          .text(name)
          .data('file-name', name)
          .insertBefore(addFileButton);
        } else {
          alert("You can only make HTML, CSS or JS files.");
          return null;
        }
    }

    var filename, content;
    if (typeof options.files === 'object') {
      for (filename in options.files) {
        if (options.files.hasOwnProperty(filename) && filename !== 'main') {
          content = options.files[filename];
          addFile(filename, content);
        }
      }
    }

    panes.setMain(options.files.main);
    panes.switchDocument(options.files.main);


    addFileButton.on('click', function() {
      addFile(prompt("New file:"));
    });

    fileList.on('click', '.file', function() {
      var file = $(this).data('file-name');
      panes.switchDocument(file);
    });
  };
});
