proto.AceEditorImpl = function (params) {
  var self = {
    changingFile: false,

    init: function () {
      self.container = params.container.css({
        position: 'relative'
      });
      self.editor_manager = params.editor_manager;
      self.defaults = {

      };
      // ace's supported parsers
      self.PARSERS = {
        js: "javascript",
        json: "json",
        html: "html",
        xml: "xml",
        css: "css"
      };
      self.FILE_TYPES = {
        js: self.PARSERS.js,
        json: self.PARSERS.json,
        html: self.PARSERS.html,
        htm: self.PARSERS.html,
        css: self.PARSERS.css,
        fbml: self.PARSERS.xml,
        xml: self.PARSERS.xml
      };
      self.config = $.extend({}, self.defaults, params);

    },

    initEditor: function () {
      self.inited = true;
      self.editor = ace.edit(self.container.attr('id'));
      self.editor.setTheme("ace/theme/textmate");

      self.editor.getSession().on('change', function () {
        if (!self.changingFile) {
          self.editor_manager.fileEdited(self.current_file_id);
        }
      });
      self.editor.commands.addCommand({
        name: 'find',
        bindKey: {
          win: 'Ctrl-F',
          mac: 'Command-F',
          sender: 'editor'
        },
        exec: function (env, args, request) {
          self.editor_manager.search();
        }
      });

      self.editor.commands.addCommand({
        name: 'save',
        bindKey: {
          win: 'Ctrl-S',
          mac: 'Command-S',
          sender: 'editor'
        },
        exec: function (env, args, request) {
          self.editor_manager.saveCurrentFile();
        }
      });
      
      // tab size is 2 spaces
      self.editor.getSession().setTabSize(2);
      self.editor.getSession().setUseSoftTabs(true);

    },

    openFile: function (file_item) {
      if (!self.inited) {
        self.initEditor();
      }

      // update contents of editor
      var content = file_item.contents;
      var ext = file_item.ext;
      self.current_file_id = file_item.id;
      self.changingFile = true;
      self.editor.getSession().setValue(content);
      self.changingFile = false;

      // Restore cursor position
      if (file_item.cursor) {
        self.editor.gotoLine(file_item.cursor.line + 1, file_item.cursor.character);
      } else {
        self.editor.gotoLine(1, 0);
      }

      // set correct parser mode
      var fileType = self.FILE_TYPES[ext];
      var mode;
      if ('undefined' === typeof fileType) {
        mode = ace.require("ace/mode/text");
      } else {
        mode = ace.require("ace/mode/" + fileType);
      }
      self.editor.getSession().setMode(new mode.Mode());
    },

    find: function (search_str, start_at_cursor, match_case, info_div) {
      // use ace's built in find
      self.editor.find(search_str, {
        backwards: false,
        wrap: true,
        caseSensitive: match_case,
        wholeWord: false,
        regExp: false
      });
    },

    replace: function (search_str, replace_str, match_case, info_div) {
      // TODO: find better solution for the way ace replace works. Requires at least one find before replace
      self.editor.replace(replace_str);
    },

    replaceAll: function (search_str, replace_str, match_case, info_div) {
      // use ace's built in replaceAll
      self.editor.find(search_str, {
        backwards: false,
        wrap: true,
        caseSensitive: match_case,
        wholeWord: false,
        regExp: false
      });
      self.editor.replaceAll(replace_str);
    },

    getCurrentFile: function () {
      return {
        id: self.current_file_id,
        contents: self.editor.getSession().getValue(),
        cursor: {
          line: self.editor.getCursorPosition().row,
          character: self.editor.getCursorPosition().column
        }
      };
    },

    reset: function () {
      if (self.editor) {
        self.editor.getSession().setValue("");
      }
      self.current_file_id = null;
    },
    
    resize: function () {
      if (self.editor !== null) {
        self.editor.resize();
        self.editor.focus();
      }
    },
    
    isInited: function() {
      return self.inited;
    }
  };
  self.init();
  return {
    openFile: self.openFile,
    getCurrentFile: self.getCurrentFile,
    find: self.find,
    replace: self.replace,
    replaceAll: self.replaceAll,
    reset: self.reset,
    resize: self.resize,
    inited: self.isInited
  };
};