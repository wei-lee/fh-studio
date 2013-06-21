var Apps = Apps || {};

Apps.Editor = Apps.Editor || {};

Apps.Editor.Controller = Apps.Controller.extend({

  models: {
    file: new model.File()
  },

  views: {
    editor_files_container: "#editor_files_container"
  },

  container: null,
  showPreview: true,

  actual_tabs_width: 0,
  scroll_step_value: 100,
  file_manager: {},
  modified_files: {},
  container_id: 'editor_files_container',

  init: function() {
    this.initFn = _.once(this.initBindings);
  },

  initBindings: function() {
    var self = this;

    var pleaseWaitText = $fw.client.lang.getLangString('please_wait_text');
    var scmTriggerButtonText = $fw.client.lang.getLangString('scm_trigger_button_text');

    // Set up scm trigger button in editor
    var scmTriggerButtonEditor = $('#scm_trigger_button_editor');
    scmTriggerButtonEditor.text(scmTriggerButtonText).bind('click', function() {
      scmTriggerButtonEditor.attr('disabled', 'disabled').text(pleaseWaitText);
      $fw.client.tab.apps.manageapps.triggerScm(function() {
        self.loadAppFiles($fw.data.get('app').guid);
        // FIXME: should this be .reload()??
        $fw.client.tab.apps.manageapps.getController('apps.preview.controller').show();
        self.reloadFiles();
      }, $.noop, function() {
        scmTriggerButtonEditor.removeAttr('disabled').text(scmTriggerButtonText).removeClass('ui-state-hover');
      });
    });

    this.initToolbar();

    this.tabs_container = $("#editor_titles");
    this.container = this.views.editor_files_container;
    var container = $(this.container);
    this.text_content_container = container.find(".text_content").hide();
    this.img_content_container = container.find(".img_content").hide();
    var editorProp = $fw.getClientProp('editor');
    // always use codemirror for unsupported browsers of ace editor
    if ('undefined' === typeof Worker || ('function' !== typeof Worker)) {
      editorProp = 'Codemirror';
    }
    this.editor_impl = new proto[editorProp + 'EditorImpl']({
      container: this.text_content_container,
      editor_manager: this
    });
    this.initSearchDialog();
  },

  reset: function() {
    if (null != this.treeviewManager) {
      this.treeviewManager.destroy();
      this.treeviewManager = null;
    }

    if (null != this.tabs_container) {
      this.tabs_container.find("li").remove();
    }

    this.resetContent();
    this.file_manager = {};
    this.modified_files = {};
    this.actual_tabs_width = 0;
    this.resetSearchDialog();
    this.tab_position_map = {};
    this.disableEditor();
  },

  show: function() {
    var self = this;

    this._super();

    this.hide();
    this.initFn();

    var setOpenFile = function () {
      var initFile = $fw.data.get('initFile');
      if (initFile != null) {
        $fw.data.set('initFile', null);
        self.treeviewManager.selectNodeByPath(initFile);
      }
    };
    
    $(this.container).show();

    if (null == self.treeviewManager) {
      this.loadAppFiles($fw.data.get('app').guid, setOpenFile);
    } else {
      setOpenFile();
    }

  },

  constructFileTreeView: function(res, guid) {
    this.treeviewManager = new proto.TreeviewManager({
      data: res,
      container: $('#editor_files_list'),
      app_id: guid
    });
    this.treeviewManager.load();
    $('#editor_loading_view').hide();
    $('#editor_files_list').show();
  },

  initToolbar: function() {
    var self = this;

    $('#editor_save_btn').click(function() {
      self.saveCurrentFile();
    });
    $('#editor_save_all_btn').click(function() {
      self.saveAllFiles();
    });
    $('#editor_find_btn').click(function() {
      self.search();
    });
    var that = this;
    $('#editor_titles_wrapper').bind('mouseover', function() {
      if (that.showTabScrollers.call(that)) {
        $('.editor_tabs_scroller').show();
      }
    }).bind('mouseout', function() {
      $('.editor_tabs_scroller').hide();
    });
    $('.editor_tabs_scroller').mouseover(function() {
      $(this).addClass('ui-state-hover');
    }).mouseout(function() {
      $(this).removeClass('ui-state-hover');
    });
    $('#editor_tabs_scroller_left').click(function() {
      that.doScroll.call(that, that.scroll_step_value);
    });
    $('#editor_tabs_scroller_right').click(function() {
      that.doScroll.call(that, that.scroll_step_value * (-1));
    });
  },

  initEditorMessage: function() {
    var editorMessageDiv = $('#editor_message');
    var is_scm = $fw.client.tab.apps.manageapps.isScmApp();

    // console.log('initEditorMessage :: initEditorMessage - is_scm = ' + is_scm);
    if (is_scm) {
      var editorMessageText = $fw.getClientProp('scm-editor-text');
      editorMessageDiv.text(editorMessageText);
      editorMessageDiv.show();
    } else {
      editorMessageDiv.text("");
      editorMessageDiv.hide();
    }
    var scmCrudEnabled = $fw.getClientProp('scmCrudEnabled') == "true";
  },

  initSearchDialog: function() {
    var self = this;
    this.find_dialog = proto.Dialog.load($('#editor_find_dialog'), {
      modal: false,
      draggable: true,
      dialogClass: '',
      width: 370,
      title: "Find/Replace",
      buttons: {
        Find: function() {
          self.find(true);
        },
        Replace: function() {
          self.replace(false);
        },
        'Replace All': function() {
          self.replace(true);
        },
        Cancel: function() {
          self.resetSearchDialog();
          $(this).dialog("close");
        }
      }
    });
  },

  openFile: function(file_guid, file_name, file_version, path, app_id) {
    this.enableEditor();
    var file_id = file_guid || path;
    // console.log("file_id = " + file_id);
    var existed = false;
    if (!this.file_manager[file_id]) {
      // cache the current file content
      if (typeof this.current_file !== "undefined") {
        this.cacheCurrentFileContent();
      }
      var tab_item = this.createNewTabItem(file_id, file_name);
      this.resetTabs();
      this.appendTab(tab_item, file_id);
      this.file_manager[file_id] = {};
      this.current_file = file_id;
      this.loadSingleFile(file_guid, file_name, file_version, path, app_id);
    } else {
      existed = true;
      if (file_id !== this.current_file) {
        this.changeTab(file_id, true);
      }
    }
    this.setActiveTab(file_id);
    if (existed) {
      this.scrollToTab(file_id);
    } else {
      this.scrollTo(0);
    }
  },

  loadSingleFile: function(file_guid, file_name, file_version, path, app_id) {
    var file_id = file_guid || path;
    var self = this;
    var data = {
      guid: file_guid,
      appId: app_id,
      path: path
    };
    var ext = js_util.getFileExt(file_name);
    if (js_util.isBinaryExt(file_name)) {
      this.createImageContent(file_id, app_id, path);
      this.changeView(true);
      this.file_manager[file_id] = {
        id: file_id,
        name: file_name,
        path: path,
        app_id: app_id,
        version: file_version || false,
        ext: ext,
        is_binary: true
      };
    } else {
      this.setWaitCursor();
      this.changeView(false);
      self.loadTextFile(data, function(res) {
        var params = {
          id: file_id,
          name: file_name,
          path: path,
          app_id: app_id,
          contents: res.contents,
          version: file_version || false,
          ext: ext,
          is_binary: false
        };
        self.file_manager[file_id] = params;
        self.editor_impl.openFile(params);
        self.modified_files[file_id] = false;
        self.removeModifiedMark(file_id);
        self.removeWaitCursor();
      });
    }
  },


  fileEdited: function(id) {
    if (!this.modified_files[id]) {
      this.modified_files[id] = true;
      this.markAsModified(id);
    }
  },

  markAsModified: function(id) {
    var tab = this.getTabForFileId(id).find("a");
    tab.text("*" + tab.text());
  },

  removeModifiedMark: function(id) {
    var tab = this.getTabForFileId(id).find("a");
    if (tab.text().indexOf("*") === 0) {
      tab.text(tab.text().substring(1));
    }
  },

  getTabForFileId: function(id) {
    var tab = this.tabs_container.find("[data-file_id='" + id + "']");
    return tab;
  },

  changeTab: function(file_id, cache_current) {
    this.resetTabs();
    this.setActiveTab(file_id);
    this.current_file = file_id;
    var file_item = this.file_manager[file_id];
    if (file_item.is_binary) {
      this.createImageContent(file_id, file_item.app_id, file_item.path);
      this.changeView(true);
    } else {
      this.changeView(false);
      if (cache_current) {
        this.cacheCurrentFileContent();
      }
      this.editor_impl.openFile(this.file_manager[file_id]);
    }
    if (file_item.reload) {
      this.checkReloadFile(file_id);
    }
    // make sure file treeview is on selected file
    this.treeviewManager.selectNode(file_id);
  },

  cacheCurrentFileContent: function() {
    var current_file = this.editor_impl.inited() ? this.editor_impl.getCurrentFile() : undefined;
    if (typeof current_file !== "undefined" && typeof current_file.id !== "undefined" && typeof this.file_manager[current_file.id] !== "undefined") {
      this.file_manager[current_file.id].contents = current_file.contents;
      this.file_manager[current_file.id].cursor = current_file.cursor;
    }
  },

  reloadFiles: function() {
    var self = this;
    for (var i in self.file_manager) {
      self.file_manager[i].reload = true;
    }
    if (self.current_file) {
      self.checkReloadFile(self.current_file);
    }
  },

  checkReloadFile: function(file_id) {
    var self = this;
    var file_obj = self.file_manager[file_id];
    if (file_obj && file_obj.reload) {
      //if the file need to be reloaded, check if there is any local changes
      if (self.modified_files[file_id]) {
        //if there is, ask user what to do
        var icon_html = "<span class=\"ui-icon ui-icon-alert content_icon\"></span>";
        $fw.client.dialog.showConfirmDialog($fw.client.lang.getLangString('caution'), icon_html + $fw.client.lang.getLangString('reload_file_content_alert'), function() {
          self.loadSingleFile(file_obj.id, file_obj.name, file_obj.version, file_obj.path, file_obj.app_id);
        }, function() {
          file_obj.reload = false;
          if (self.editor_impl.getCurrentFile().id != file_obj.id) {
            if (file_obj.is_binary) {
              self.createImageContent(file_obj.id, file_obj.app_id, file_obj.path);
              self.changeView(true);
            } else {
              self.changeView(false);
              self.editor_impl.openFile(self.file_manager[file_id]);
            }
          }

        });
      } else {
        //no local changes, reload the file
        self.loadSingleFile(file_obj.id, file_obj.name, file_obj.version, file_obj.path, file_obj.app_id);
      }
    }
  },


  // TODO: code duplication below between 2 save functions
  saveCurrentFile: function() {
    var self = this;

    // Set cursor to hourglass
    this.setWaitCursor();

    var current_file = this.editor_impl.getCurrentFile();
    if (current_file.id && this.modified_files[current_file.id]) {
      var file_info = this.file_manager[current_file.id];
      var file = [{
        guid: current_file.id,
        path: file_info.path,
        contents: current_file.contents
      }];
      var data = {
        files: file,
        appId: $fw.data.get('app').guid
      };
      this.saveTextFile(data, function(res) {
        // Turn hourglass off
        self.removeWaitCursor();

        if (res.message) {
          alert(res.message);
        } else {
          $fw.client.dialog.info.flash($fw.client.lang.getLangString('file_saved'));
          self.modified_files[current_file.id] = undefined;
          self.removeModifiedMark(current_file.id);
          $fw.client.tab.apps.manageapps.getController('apps.preview.controller').show();
        }
      });
    } else {
      this.removeModifiedMark(current_file.id);
      this.removeWaitCursor();
    }
  },

  saveAllFiles: function() {
    var files_data, current_file, file, file_id;

    var self = this;

    files_data = [];
    current_file = this.editor_impl.getCurrentFile();

    for (file_id in this.modified_files) {
      if (this.modified_files.hasOwnProperty(file_id)) {
        // Make sure the file in question has been modified before adding it to
        // our files list
        if (this.modified_files[file_id]) {
          var file_info = this.file_manager[file_id];
          if (file_info != null) {
            file = {};
            file.path = file_info.path;
            file.guid = file_id;
            if (current_file.id === file_id) {
              file.contents = current_file.contents;
            } else {
              file.contents = file_info.contents;
            }
            files_data.push(file);
          }
        }
      }
    }

    self.saveTextFiles(files_data);
  },

  saveTextFiles: function(textFiles) {
    var self = this;

    if (textFiles.length > 0) {
      // Set cursor to hourglass
      self.setWaitCursor();

      // Send all the files contents to the server to be saved
      this.saveTextFile({
        files: textFiles,
        appId: $fw.data.get('app').guid
      }, function(res) {
        // Turn hourglass off
        self.removeWaitCursor();

        if (res.message) {
          alert(res.message);
        } else {
          self.saveAllComplete();
        }
      });
    }
  },

  /*
   * When saving is complete, mark all files as not modified and reload the
   * preview
   */
  saveAllComplete: function() {
    var file_id, self = this;

    // Let the user know files were saved
    $fw.client.dialog.info.flash($fw.client.lang.getLangString('files_saved'));

    // Remove modified visible modified marks and internal modification tracking
    // for all files
    for (file_id in this.modified_files) {
      if (this.modified_files.hasOwnProperty(file_id)) {
        self.modified_files[file_id] = undefined;
        self.removeModifiedMark(file_id);
      }
    }
    $fw.client.tab.apps.manageapps.getController('apps.preview.controller').show();
  },

  search: function() {
    this.resetSearchDialog();
    this.find_dialog.dialog("open");
  },

  find: function(start_at_cursor) {
    var search_str = this.find_dialog.find('#editor_find_text').val();
    if (search_str.length > 0) {
      var match_case = this.find_dialog.find("#editor_find_match_case").attr("checked");
      this.editor_impl.find(search_str, start_at_cursor, match_case, this.find_dialog.find("#search_info"));
    }
  },

  replace: function(all) {
    var search_str = this.find_dialog.find('#editor_find_text').val();
    var replace_str = this.find_dialog.find('#editor_replace_text').val();
    if (search_str.length > 0 && replace_str.length >= 0 && (search_str !== replace_str)) {
      var match_case = !this.find_dialog.find("#editor_find_match_case").attr("checked");
      if (all) {
        this.editor_impl.replaceAll(search_str, replace_str, match_case, this.find_dialog.find("#search_info"));
      } else {
        this.editor_impl.replace(search_str, replace_str, match_case, this.find_dialog.find("#search_info"));
      }
    }
  },

  /*
   * Remove the tab from the tab header and any references to the file
   */
  closeTab: function(id) {
    // TODO: needs a little tidying up here
    var current_tab = this.getTabForFileId(id);
    if (this.current_file === id) {
      var next = current_tab.next();
      if (next.length === 0) {
        next = current_tab.prev();
      }
      if (next.length === 0) {
        next = null;
      }
      this.removeTab(current_tab);
      this.modified_files[id] = false;
      this.file_manager[id] = undefined;
      if (next !== null) {
        var next_id = next.attr('data-file_id');
        this.changeTab(next_id, false);
      } else {
        this.resetContent();
      }
    } else {
      this.removeTab(current_tab);
      this.modified_files[id] = false;
      this.file_manager[id] = undefined;
    }
  },

  createNewTabItem: function(id, tab_text) {
    var self = this;

    var tab_item = $("<li>", {
      "class": "ui-state-default ui-corner-top ui-tabs-selected ui-state-active editor-tab",
      "data-file_id": id
    }).append($("<a>", {
      text: tab_text
    })).append($("<i>", {
      "class": "icon-remove"
    }).click(function() {
      self.closeTab(id);
    })).bind('click', function() {
      self.changeTab(id, true);
    });
    return tab_item;
  },

  appendTab: function(tab_item, file_id) {
    this.tabs_container.prepend(tab_item);
    // Includes 5 padding for filename changes
    this.actual_tabs_width = this.actual_tabs_width + tab_item.outerWidth(true) + 5;
    this.resizeTabs();
  },

  removeTab: function(tab_item) {
    this.actual_tabs_width = this.actual_tabs_width - tab_item.outerWidth(true) - 5;
    tab_item.remove();
    this.resizeTabs();
  },

  resizeTabs: function() {
    var container_width = this.tabs_container.parent().width();
    if (this.actual_tabs_width > container_width) {
      this.tabs_container.width(this.actual_tabs_width);
    } else {
      this.tabs_container.width(container_width);
    }
  },

  showTabScrollers: function() {
    var showScollers = false;
    if ((this.actual_tabs_width > this.tabs_container.parent().width()) || (this.tabs_container.parent().scrollLeft() !== 0)) {
      showScollers = true;
    }
    return showScollers;
  },

  doScroll: function(scroll_step_val) {
    var current_scroll_left = this.tabs_container.parent().scrollLeft();
    var current_container_width = this.tabs_container.parent().width();
    var available_scroll_value = scroll_step_val < 0 ? Math.abs(current_scroll_left) : (this.actual_tabs_width - current_scroll_left - current_container_width);
    if (available_scroll_value > 0) {
      var actual_scroll_step_val = Math.min(available_scroll_value, Math.abs(scroll_step_val));
      var actual_scroll_val = scroll_step_val < 0 ? (current_scroll_left - actual_scroll_step_val) : (current_scroll_left + actual_scroll_step_val);
      this.scrollTo(actual_scroll_val);
    }
  },

  scrollTo: function(to_val) {
    this.tabs_container.parent().scrollLeft(to_val);
  },

  scrollToTab: function(file_id) {
    var tab_item = this.getTabForFileId(file_id);
    var offset = tab_item.offset();
    var parent_offset = tab_item.parent().offset();
    var scroll_position;
    if (offset.left * parent_offset.left > 0) {
      scroll_position = Math.abs(Math.abs(parent_offset.left) - Math.abs(offset.left)) + tab_item.outerWidth(true) - this.tabs_container.parent().width();
    } else {
      scroll_position = Math.abs(Math.abs(parent_offset.left) + Math.abs(offset.left)) + tab_item.outerWidth(true) - this.tabs_container.parent().width();
    }
    this.scrollTo(scroll_position);
  },

  createImageContent: function(id, appId, path) {
    var url = Constants.VIEW_IMAGE_URL + "?guid=" + id + "&appId=" + appId + "&path=" + path;
    var img_content = $('<img>', {
      src: url
    });
    this.img_content_container.html(img_content);
  },

  changeView: function(is_binary_content) {
    if (is_binary_content) {
      this.text_content_container.hide();
      this.img_content_container.show();
    } else {
      this.img_content_container.hide();
      this.text_content_container.show();
    }
  },

  disableEditor: function() {
    //$('#editor_files_container').hide();//.addClass("ui-helper-hidden-accessible");
    $('#editor_text_content').hide();
    $('#editor_toolbar').find('button').attr("disabled", "disabled");
  },

  enableEditor: function() {
    //$('#editor_files_container').show();//.removeClass("ui-helper-hidden-accessible");
    $('#editor_text_content').show();
    $('#editor_toolbar').find('button').removeAttr("disabled");
  },

  resetTabs: function() {
    this.tabs_container.find("li.ui-state-active").removeClass("ui-state-active").removeClass("ui-state-selected").removeClass("current-selected-tab");
  },

  resetContent: function() {
    console.log("resetContent");
    if (null != this.editor_impl) {
      this.editor_impl.reset();
      this.img_content_container.empty();
      this.disableEditor();
    }
  },

  setActiveTab: function(id) {
    var tab = this.getTabForFileId(id);
    tab.addClass("ui-state-active").addClass("ui-state-selected").addClass("current-selected-tab");
  },

  resetSearchDialog: function() {
    if (null != this.find_dialog) {
      this.find_dialog.find("input").val("");
      this.find_dialog.find("#search_info").text("").hide();
    }
  },

  // update any text references to the files name with the new name
  renameCallback: function(id, new_name, old_name) {
    this.file_manager[id].name = new_name;
    var tab = this.getTabForFileId(id);
    tab.find('a').text(new_name);
  },

  call: function(method, url, data, callback) {
    // TODO: will be replaced by a globle ajax function
    $.ajax({
      type: method,
      url: url,
      data: data,
      success: function(res) {
        callback(res);
      }
    });
  },

  saveTextFile: function(data, callback) {
    // TODO:
    // EITHER all editor callbacks should route through a single callback to
    // allow filtering for templates
    // OR initialise a readonly codemirror (if possible) for templates
    var template_mode = $fw.data.get('template_mode');
    if (!template_mode) {
      var url = Constants.SAVE_FILE_URL;
      this.call("POST", url, JSON.stringify(data), callback);
    }
  },

  loadAppFiles: function(guid, cb){
    var self = this;

    var request_data = {active: 'true', app: guid};
    $fw.server.post(Constants.LIST_FILES_URL, request_data, function(res){
      self.constructFileTreeView(res, guid);
      if ($.isFunction(cb)) {
        cb();
      }
    });
  },
  
  loadTextFile: function(data, success) {
    $fw.server.post(Constants.LOAD_FILE_URL, data, success);
  },

  highlightCode: function(string, callback, parser) {
    // TODO: Editor shouldn't know about any of CodeMirrors parsers
    parser = JSParser;
    parser = parser.make(stringStream($fw.client.editor.normaliseString(string)));
    var line = [];
    if (callback.nodeType === 1) {
      var node = callback;
      callback = function(line) {
        for (var i = 0; i < line.length; i++) {
          node.appendChild(line[i]);
          node.appendChild(document.createElement("br"));
        }
      };
    }

    try {
      while (true) {
        var token = parser.next();
        if (token.value === "\n") {
          callback(line);
          line = [];
        } else {
          var span = document.createElement("span");
          span.className = token.style;
          span.appendChild(document.createTextNode(token.value));
          line.push(span);
        }
      }
    } catch (e) {
      if (e !== StopIteration) {
        throw e;
      }
    }
    if (line.length) {
      callback(line);
    }
  },

  resize: function() {
    if (null != this.editor_impl && 'function' === typeof this.editor_impl.resize) {
      this.editor_impl.resize();
    }
    this.resizeTabs();
  },

  normaliseString: function(string) {
    var tab = "";
    for (var i = 0; i < Properties.editor_indent_amount; i++) {
      tab += " ";
    }

    string = string.replace(/\t/g, tab).replace(/\u00a0/g, " ").replace(/\r\n?/g, "\n");
    var pos = 0,
      parts = [],
      lines = string.split("\n");
    for (var line = 0; line < lines.length; line++) {
      if (line !== 0) parts.push("\n");
      parts.push(lines[line]);
    }

    return {
      next: function() {
        if (pos < parts.length) return parts[pos++];
        else throw StopIteration;
      }
    };
  },

  setWaitCursor: function() {
    $("*").css("cursor", "progress");
  },

  removeWaitCursor: function() {
    $("*").css("cursor", "default");
  }

});
