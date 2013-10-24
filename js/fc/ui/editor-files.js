// TODO: proper UI. alerts and prompts make me sad.

define(function(require) {
  var $ = require("jquery-tipsy"),
    JSZip = require("jszip");

  return function EditorFiles(options) {
    var container = options.container,
      fileList = $('<ul></ul>')
        .appendTo(container),
      toolBar = $('<div></div>')
        .addClass('toolbar'),
      addFileButton = $('<li>New</li>')
        .addClass('add-file')
        .appendTo(fileList),
      downloadAllButton = $('<li>Download</li>')
        .addClass('download-all glyphicon-download')
        .appendTo(fileList),
      deleteButton = $('<button></button>')
        .addClass('delete glyphicon glyphicon-remove')
        .appendTo(toolBar);

    var panes = options.panes;

    var files = {};

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

        var el = $('<li></li>')
          .addClass('type-' + ext)
          .addClass('file')
          .text(name)
          .data('file-name', name)
          .insertBefore(addFileButton);

        files[name] = el;

        } else {
          alert("You can only make HTML, CSS or JS files.");
          return null;
        }
    }

    function deleteFile(name) {
      var el = files[name];
      if (el) {
        el.remove();
        delete files[name];
        panes.deleteDocument(name);
        files[options.files.main].trigger('click');
      }
    }

    function downloadAll() {
      var files = get(),
        zip = new JSZip();

      for (var filename in files) {
        if (files.hasOwnProperty(filename)) {
          zip.file(filename, files[filename]);
        }
      }

      var a = $('<a></a>')
        .attr('href', 'data:application/zip;base64,' + zip.generate())
        .attr('download', 'code.zip')
        .appendTo(document.body)
        .text('download');

      a[0].click();

      a.remove();
    }

    function get() {
      return panes.getFiles();
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

    addFileButton.on('click', function() {
      addFile(prompt("New file:"));
    });

    fileList.on('click', '.file', function() {
      var $this = $(this);
      panes.switchDocument($this.data('file-name'));
      toolBar.appendTo($this);
      fileList.find('.active').removeClass('active');
      $this.addClass('active');
    });

    toolBar.on('click', '.delete', function() {
      toolBar.detach();
      var filename = fileList.find('.active').data('file-name');
      deleteFile(filename);
    });

    downloadAllButton.on('click', function(e) {
      e.stopPropagation();
      downloadAll();
    });

    files[options.files.main].trigger('click');

    return {
      addFile: addFile,
      deleteFile: deleteFile,
      get: get
    };
  };
});
