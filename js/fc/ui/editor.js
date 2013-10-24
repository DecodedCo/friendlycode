define([
  "jquery",
  "./editor-panes",
  "./editor-toolbar",
  "./editor-files"
], function($, EditorPanes, EditorToolbar, EditorFiles) {
  return function Editor(options) {
    var value = options.value,
        container = options.container.empty()
          .addClass("friendlycode-base"),
        toolbarDiv = $('<div class="friendlycode-toolbar"></div>')
          .appendTo(container),
        panesDiv = $('<div class="friendlycode-panes"></div>')
          .appendTo(container);

    var panes = EditorPanes({
      container: panesDiv,
      value: value,
      allowJS: options.allowJS,
      previewLoader: options.previewLoader,
      files: options.files
    });
    var toolbar = EditorToolbar({
      container: toolbarDiv,
      panes: panes
    });

    if (options.files) {
      container.addClass('files');

      var filesDiv = $('<div class="friendlycode-files"></div>')
        .appendTo(container);

      var files = EditorFiles({
        container: filesDiv,
        files: options.files,
        panes: panes
      });
    }

    container.removeClass("friendlycode-loading");
    panes.codeMirror.refresh();

    return {
      container: container,
      panes: panes,
      toolbar: toolbar,
      files: files
    };
  };
});
