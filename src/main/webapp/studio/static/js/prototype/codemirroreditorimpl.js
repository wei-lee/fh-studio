proto.CodemirrorEditorImpl = function(params){
  var self = {
    init: function(){
      self.containerId = params.container.find("textarea").attr("id");
      self.editor_manager = params.editor_manager;
      self.defaults = {
          
      };
      self.PARSERS = {
        js:"JSParser",
        html:"HTMLMixedParser",
        css:"CSSParser",
        dummy:"DummyParser"
      };
      self.FILE_TYPES = {
        js:self.PARSERS.js,
        json:self.PARSERS.js,
        html:self.PARSERS.html,
        htm:self.PARSERS.html,
        css:self.PARSERS.css,
        fbml:self.PARSERS.html,
        txt: self.PARSERS.html
      };
      self.config = $.extend({}, self.defaults, params);
      self.initEditor();
      
    },

    isInited: function() {
      return self.inited;
    },
    
    initEditor: function(){
      self.inited = true;
      // TODO: get scheme from location
       var base_path = [window.location.protocol, "//", window.location.host, "/studio/static/common/"].join("");
       var base_files = ["codemirrorbase.js"];
       var js_files_path = [base_path, "js/ui/thirdparty/codemirror/"].join("");
       var css_files_base_path = [base_path, "css/ui/framework/codemirror/"].join("");
       var css_files = [css_files_base_path + "csscolors.css", css_files_base_path + "jscolors.css", css_files_base_path + "xmlcolors.css"];
       self.editor = CodeMirror.fromTextArea(self.containerId, {
         path: js_files_path,
         parserfile: [],
         basefiles: base_files,
         stylesheet: css_files,
         lineNumbers: true,
         height: "100%",
         iframeClass: 'CodeMirror-frame',
         lineNumberDelay: 2000,
         textWrapping: false,
         tabMode: "shift",
         indentUnit: Properties.editor_indent_amount,
         editFunction: function(){
             self.editor_manager.fileEdited(self.current_file_id);
         },
         saveFunction: function(){
             self.editor_manager.saveCurrentFile();
         },
         searchFunction: function(){
             self.editor_manager.search();
         }
       });
    },
    
    openFile: function(file_item){
      if (!self.inited) {
        self.initEditor();
      }
        var content = file_item.contents;
        var ext = file_item.ext;
        self.current_file_id = file_item.id;
        self.editor.setCode(content);
        self.editor.setParser(self.FILE_TYPES[ext]);
        if(file_item.cursor){
            self.editor.selectLines(self.editor.nthLine(file_item.cursor.line), file_item.cursor.character);
        } else {
            self.editor.selectLines(self.editor.nthLine(1), 0);
        }
    },
    
    find: function(search_str, start_at_cursor, match_case, info_div){
        self.search_cursor = self.editor.getSearchCursor(search_str, start_at_cursor, match_case);
        var next = self.search_cursor.findNext();
        if(next){
            self.search_cursor.select();
            if(info_div.css("display") !== "none" && info_div.text() === "String not found"){
                info_div.text("").hide();
            }
        } else {
          var tempCursor = self.editor.getSearchCursor(search_str, false, match_case);
          if (tempCursor.findNext()) {
            info_div.text('Reached end of File, continued from top').show().delay(1000).fadeOut("slow");
            self.find(search_str, false, match_case, info_div);
          } else {
            info_div.text('String not found').show();
          }
        }
    },
    
    replace: function(search_str, replace_str, match_case, info_div){
      Log.append('do replace');
      if(self.search_cursor && self.editor.selection() !== ""){
        var current_selection = self.editor.selection();
        Log.append('current selection: ' + current_selection);
        self.search_cursor.replace(replace_str);
        self.editor_manager.fileEdited(self.current_file_id);
        self.find(search_str, true, match_case, info_div);  
      } else {
        self.find(search_str, true, match_case, info_div);
        self.replace(search_str, replace_str, match_case, info_div);   
      }
    },
    
    replaceAll: function(search_str, replace_str, match_case, info_div){
      var search_cursor = self.editor.getSearchCursor(search_str, false, match_case);
      var next = search_cursor.findNext();
      var count = 0;
      while(next){
          count++;
          search_cursor.replace(replace_str);
          next = search_cursor.findNext();
      }
      if(count > 0){
        self.editor_manager.fileEdited(self.current_file_id);
        info_div.text(count + " matches replaced").show().delay(1000).fadeOut("slow");
      } else {
        info_div.text("String not found").show();
      }
    },
    
    getCurrentFile: function(){
        return {
            id: self.current_file_id,
            contents: self.editor.getCode(),
            cursor: {
                line: self.editor.lineNumber(self.editor.cursorLine()),
                character : self.editor.cursorPosition().character
            }
        };
    },
    
    reset: function(){
        if(self.editor){
            self.editor.setCode("");
        }
        self.current_file_id = null;
        self.search_cursor = null;
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
    inited: self.isInited
  };
};
