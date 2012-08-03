
proto.TreeviewManager = function (params) {
  var self = {
    init: function () {
      self.defaults = {
        "new_folder_name": "Untitled",
        "new_file_name": "Untitled.txt"
      };
      self.data = params.data;
      self.container = params.container;
      self.app_id = params.app_id;
    },

    // TODO: a lot of html construction here. Is this necessary?
    load: function () {
      var dom_obj, anchor_obj, ul_obj, ul_dom, ci, cl;
      
      dom_obj = $('<li>', {
        id: 'root',
        'class': 'folder_item'
      });
      anchor_obj = $('<a>', {
        href: '#',
        text: self.data.name
      });
      if (self.data.children) {
        ul_obj = $('<ul>');
        for (ci = 0, cl = self.data.children.length; ci < cl; ci += 1) {
          self.generateFileTree(self.data.children[ci], ul_obj);
        }
        dom_obj.append(anchor_obj).append(ul_obj);
      } else {
        dom_obj.append(anchor_obj);
      }
      ul_dom = $('<ul>');
      ul_dom.append(dom_obj);
      self.container.html(ul_dom);
      self.initTreeview();
    },

    // TODO: a lot of html construction here. Is this necessary?
    generateFileTree: function (node, parentObj) {
      var li_obj, a_obj, li_class, ul_obj;
      
      li_class = node.type === "file" ? 'file_item' : 'folder_item';

      li_obj = $('<li>', {
        'class': li_class,
        path: node.path
      });
      // only have a guid if it's a file
      if (node.type === 'file') {
        li_obj.attr('data-fileid', node.guid);
      }

      a_obj = $('<a>', {
        href: '#',
        text: node.name
      });

      li_obj.append(a_obj);

      if (node.type !== "file" && node.children) {
        ul_obj = $('<ul>');
        $.each(node.children, function (i, el) {
          self.generateFileTree(el, ul_obj);
        });
        li_obj.append(ul_obj);
      }

      parentObj.append(li_obj);
    },

    initTreeview: function () {
      // Set up the Git message
      $fw.client.editor.initEditorMessage();
      
      var is_template, opts;
      
      is_template = $fw.data.get('template_mode');
      opts = {
        'core': {
          initially_open: ['root']
        },
        'themes': {
          theme: 'classic',
          loaded: true
        },
        'plugins': ['themes', 'html_data', 'ui', 'cookies', 'crrm']
      };
      if (!is_template) {
        opts.plugins.push('contextmenu');
        opts.contextmenu = {
          'items': self.getDefaultContextMenu()
        };
      }
      self.container.jstree(opts);

      if (!is_template) {
        self.container.bind("create.jstree", function (event, data) {
          self.createCallback(event, data);
        }).bind("rename.jstree", function (event, data) {
          self.renameCallback(event, data);
        }).bind("remove.jstree", function (event, data) {
          self.deleteCallback(event, data);
        }).bind("move_node.jstree", function (event, data) {
          self.moveCallback(event, data);
        });
      }

      self.container.bind("open_node.jstree", function (event, data) {
        if ((data.inst._get_parent(data.rslt.obj)).length) {
          data.inst.open_node(data.inst._get_parent(data.rslt.obj), false, true);
        }
      });

      self.container.bind("select_node.jstree", function (e, data) {
        var that = this, el, temp_el, file_guid, file_name, app_id, path;

        el = $(data.rslt.obj);
        // sometimes el can have folder items in it also
        temp_el = el.filter('.file_item');
        if (temp_el.length > 0 && "file" === self.getItemType(temp_el)) {
          file_guid = self.getItemId(temp_el);
          file_name = self.getItemName(temp_el);
          app_id = self.app_id;
          path = $(temp_el).attr('path');

          // Git based files will not have a file_guid
          $fw.client.editor.openFile(file_guid, file_name, null, path, app_id);
//          if (file_guid && file_name) {
//            $fw.client.editor.openFile(file_guid, file_name, null, path, app_id);
//          } else {
//            $fw.client.dialog.info.flash('Please wait for operation complete...');
//          }
        } else {
          if (!that.toggling) {
            that.toggling = true;
            self.container.jstree('toggle_node', el);
            setTimeout(function () {
              that.toggling = false;
            }, 500);
          }

        }
      });
    },

    destroy: function () {
      self.container.jstree("destroy");
      self.container.empty();
    },

    getDefaultContextMenu: function () {
      return {
        "create": {
          "separator_before": false,
          "separator_after": true,
          "label": "Create",
          "action": false,
          "submenu": {
            "create_file": {
              "seperator_before": false,
              "sperator_after": false,
              "label": "New File",
              "action": function (obj) {
                self.create(obj, true);
              }
            },
            "create_folder": {
              "seperator_before": false,
              "sperator_after": false,
              "label": "New Folder",
              "action": function (obj) {
                self.create(obj, false);
              },
              "_disabled": function (obj) {
                // Git does not support creating empty folders
                var allowFolderCreate = ! $fw.data.get('scm_mode');
                return self.checkContextMenuDisabled(obj, true, allowFolderCreate, true);
              }

            }
          }
        },
        "rename": {
          "_disabled": function (obj) {
            var scmAllowRename = $fw_manager.getClientProp('scm-file-rename') == "true";
            var allowRename = $fw.data.get('scm_mode') ? scmAllowRename : true;
            return self.checkContextMenuDisabled(obj, true, allowRename);
          }
        },
        "remove": {
          "label": "Delete",
          "_disabled": function (obj) {
            var scmAllowDelete = $fw_manager.getClientProp('scm-file-delete') == "true";
            var allowDelete = $fw.data.get('scm_mode') ? scmAllowDelete : true;
            return self.checkContextMenuDisabled(obj, true, allowDelete);
          },
          "action": function (obj) {
            self.remove(obj);
          }
        },
        "ccp": {
          "submenu": {
            "cut": {
              "_disabled": function (obj) {
                return self.checkContextMenuDisabled(obj, false);
              }
            },
            //diable copy for now..
            "copy": {
              "_disabled": function (obj) {
                return self.checkContextMenuDisabled(obj, false);
              },
              "_class": 'ui-helper-hidden'
            }
          }
        },
        "import": {
          "separator_before": true,
          "separator_after": false,
          "label": "Import File",
          "action": function (obj) {
            self.doImport(obj);
          },
          "_disabled": function (obj) {
          // Do not allow importing files for git based apps
          var allowImport = ! $fw.data.get('scm_mode');
          return self.checkContextMenuDisabled(obj, true, allowImport, true);
        }
        },

        "index": {
          "separator_before": true,
          "separator_after": false,
          "label": "Set as default",
          "_disabled": function (obj) {
            return self.checkContextMenuDisabled(obj, false);
          },
          "action": function (obj) {
            self.setAsDefault(obj);
          }
        }
      };
    },

    checkContextMenuDisabled: function (li_obj, enabled, scmEnabled, rootAllowed) {
      var id = self.getItemId(li_obj);
      var isFolder = "folder" === self.getItemType(li_obj);
      var isRoot = "root" === id;

      var isDisabled = false;
      
      if ((isFolder && ((isRoot && rootAllowed===false) || !enabled)) || ( scmEnabled === false)) { 
        isDisabled = true;
      }
      
      // console.log("checkContextMenuDisabled - " + id + " => " + isDisabled + " ===== enabled = " + enabled + " :: scmEnabled = " + scmEnabled + " :: isFolder = " + isFolder + " :: is Root = " + isRoot);
      
      return isDisabled;
    },

    create: function (current_node, is_file) {      
      var position, class_name, title; 
      
      position = "inside";
      class_name = "folder_item temp";
      title = self.defaults.new_folder_name;
      
      if ("file" === self.getItemType(current_node)) {
        position = "after";
      }
      if (is_file) {
        class_name = "file_item temp";
        title = self.defaults.new_file_name;
      }
      
      self.container.jstree("create", current_node, position, {
        attr: {
          'class': class_name
        },
        data: title
      });

    },

    addNode: function (current_node, file_name, file_guid) {
      if (self.container.find("#" + file_guid).length === 0) {
        var position, class_name; 
        
        position = "inside";
        class_name = "file_item";
        if ("file" === self.getItemType(current_node)) {
          position = "after";
        }
        self.container.jstree("create_node", current_node, position, {
          attr: {
            "class": class_name,
            "data-fileid": file_guid
          },
          data: file_name
        });
      }
    },

    createCallback: function (event, params) {
      var file_name, node, parent, type, path, data;
      
      file_name = params.rslt.name;
      node = params.rslt.obj;
      parent = params.rslt.parent;
      type = self.getItemType(node);
      if (self.checkDuplicated(parent, node, file_name)) {
        self.container.jstree("delete_node", node);
        $fw.client.dialog.error(js_util.capitalise(type) + " already exists.");
        return;
      }
      if (!self.validateFilename(type, file_name, false)) {
        file_name = type === "file" ? self.defaults.new_file_name : self.dafaults.new_folder_name;
        self.rollbackFilename(node, file_name);
      }
      path = self.getItemPath(parent);
      data = {
        widget: self.app_id,
        filePath: path,
        fileName: file_name,
        type: type
      };
      self.server.create(data, function (res) {
        if (res.guid || res.path) {
          var file_id = res.guid || res.path;
          
          if (res.guid != null) {
            self.setItemId(node, res.guid);
          }
          self.makeRealNode(node);
          node.attr('path', path + file_name);
          
          //self.setItemPath(node, res.path);          
        } else if (res.status === "error") {
          self.container.jstree("delete_node", node);
          $fw.client.dialog.error(res.message);
        }
      });
    },

    remove: function (obj) {
      var icon_html, type, node_id;
      
      icon_html = "<span class=\"ui-icon ui-icon-alert content_icon\"></span>";
      type = self.getItemType(obj);
      $fw.client.dialog.showConfirmDialog('Delete ' + js_util.capitalise(type), icon_html + Lang['delete_' + type + '_confirm_text'], function () {
        // remove entry from tree
        var ori_path = self.getItemPath(obj.parent());
        obj.path = ori_path;
        //log("ori path is " + ori_path);
        self.container.jstree("remove", obj);
        //var ori_path = self.getItemPath(obj.parent());
        //obj.old_delete_folder_path = ori_path;
        // also remove file from editor if it's open

        node_id =  obj.data('fileid');
        if (node_id != null) {
          // deleting a file, make sure to close it if it's open
          $fw.client.editor.closeTab(node_id);
        } else {
          // deleting a folder, make sure to close all child files if they're open
          $(obj).find('.file_item').each(function () {
            node_id =  $(this).data('fileid');
            if (node_id != null) {
              $fw.client.editor.closeTab(node_id);
            }
          });
        }
      });
    },

    renameCallback: function (event, params) {
      var new_name, old_name, node, type, file_id, data;
      
      new_name = params.rslt.new_name;
      old_name = params.rslt.old_name;
      node = params.rslt.obj;
      type = self.getItemType(node);
      // Make sure the new name is different, and its a valid name
      if (new_name === old_name || !self.validateFilename(type, new_name, true, old_name)) {
        self.rollbackFilename(node, old_name);
        return;
      }
      file_id = self.getItemId(node);
      data = {
        'widget': self.app_id,
        'fileGuid': file_id,
        'newFileName': new_name,
        'type': type
      };
      if ("folder" === type) {
        data.oldFileName = old_name;
        data.filePath = self.getItemPath(node.parent()) + old_name;
      }
      self.server.rename(data, function (res) {
        if (res.error) {
          self.rollbackFilename(node, old_name);
          $fw.client.dialog.error(res.error);
        } else {
          //  self.setItemPath(node, res.path);         
          // callback to editor manager
          $fw.client.editor.renameCallback(file_id, new_name, old_name);
        }
      });

    },

    deleteCallback: function (event, params) {
      var node, type, id, name, path, data;
      
      node = params.args[0];
      id = self.getItemId(node);
      type = self.getItemType(node);
      name = self.getItemName(node);
      path = node.path;

      data = {
        type: type,
        path: path,
        name: name,
        appId: self.app_id
      };

      // only set guid if it's a file, otherwise path is enough delete a folder
      if (id != null) {
        data.guid = id;
      }
      self.server.removeFile(data, function (res) {
        if (res.error || res.status === "error") {
          $fw.client.dialog.error(res.message);
          $.jstree.rollback(params.rlbk);
        }
      });
    },

    moveCallback: function (event, params) {
      var node, new_parent_node, old_parent_node, type, item_name, copy, data;
      
      node = params.rslt.o;
      new_parent_node = params.rslt.np;
      old_parent_node = params.rslt.op;
      type = self.getItemType(node);
      item_name = self.getItemName(node);
      copy = params.args[3] === undefined ? false : true;
      if ("file" === type) {
        data = {
          "widget": self.app_id,
          "fileGuid": self.getItemId(node),
          "newFilePath": self.getItemPath(new_parent_node),
          "copy": copy
        };
        self.server.moveFile(data, function (res) {
          if (res.error || res.status === "error") {
            $fw.client.dialog.error("Can not paste file " + item_name);
            $.jstree.rollback(params.rlbk);
          }
        });
      } else {
        data = {
          "widget": self.app_id,
          "oldPath": self.getItemPath(old_parent_node),
          "folderName": item_name,
          "newPath": self.getItemPath(new_parent_node),
          "copy": copy
        };
        self.server.moveFolder(data, function (res) {
          if (res.error || res.status === "error") {
            $fw.client.dialog.error("Can not paste folder " + item_name);
            $.jstree.rollback(params.rlbk);
          }
        });
      }
    },

    setAsDefault: function (current_node) {
      var filePath, data;
      
      filePath = self.getItemPath(current_node);
      if (filePath.charAt(0) === "/") {
        filePath = filePath.substring(1);
      }
      if (filePath.charAt(filePath.length - 1) === "/") {
        filePath = filePath.substring(0, filePath.length - 1);
      }
      console.log("default file path :: " + filePath);
      data = {
        appId: self.app_id,
        'filePath': filePath
      };
      self.server.updateIndex(data, function (res) {
        $fw.client.preview.show();
      });
    },

    doImport: function (current_node) {
      var import_file_wizard, step, current_path, file_path, file_name;
      
      import_file_wizard = proto.Wizard.load('import_file_wizard', {
        validate: true
      });
      import_file_wizard.validate({
        rules: {
          //TODO: add file ext validation?
          location: 'required'
        }
      });
      // When next is clicked on details page, intercept and send back to details page until 
      // import is attempted
      import_file_wizard.find('#import_file_progress').bind('show', function () {
        console.log('doing import file');
        step = $(this);

        import_file_wizard.find('#import_file_app_guid').val(self.app_id);
        current_path = "";
        if ("folder" === self.getItemType(current_node)) {
          current_path = self.getItemPath(current_node);
        } else {
          current_path = self.getItemPath(current_node.parent());
        }

        console.log("Current path is " + current_path);
        import_file_wizard.find('#import_file_path').val(current_path);
        file_path = import_file_wizard.find("#import_file_location").val();
        console.log("file path:" + file_path);
        file_name = js_util.getFileNameFromPath(file_path);
        console.log("upload file: " + file_name);

        // show import progress
        // TODO: tidy up all these calls and refactor
        proto.ProgressDialog.resetBarAndLog(step);
        proto.ProgressDialog.setProgress(step, 20);
        proto.ProgressDialog.append(step, 'Starting Import');

        import_file_wizard.ajaxSubmit({
          url: Constants.IMPORT_FILE_URL,
          dataType: 'json',
          success: function (result) {
            console.log('import result > ' + JSON.stringify(result));
            if ('string' === typeof result.guid) {
              // TODO: better way for this temporary workaround for finishing wizard after successful upload  
              import_file_wizard.find('.jw-button-finish').trigger('click');

              // All good, finish step
              proto.ProgressDialog.setProgress(step, 100);
              proto.ProgressDialog.append(step, 'Import Complete');
              console.log('import successful, good to go > ' + result.guid);
              self.addNode(current_node, file_name, result.guid);
            } else {
              console.log('import failed');
              self.handleImportFailed(import_file_wizard, 'server');
            }
          },
          error: function (jqXHR, textStatus, errorThrown) {
            console.log('import failed > ' + errorThrown);

            self.handleImportFailed(import_file_wizard, jqXHR.error);
          }
        });

      });
    },

    handleImportFailed: function (wizard, error) {
      var errorMsg;

      errorMsg = 'import_failed_generic';

      if ('timeout' === error) {
        errorMsg = 'import_failed_timeout';
      } else if ('server' === error) {
        errorMsg = 'import_failed_server';
      }

      proto.Wizard.jumpToStep(wizard, 1, $fw.client.lang.getLangString(errorMsg));
    },

    validateFilename: function (type, file_name, is_rename, old_name) {
      var valid = true;
      if (type === "file" && file_name.indexOf(".") === -1) {
        valid = false;
        $fw.client.dialog.error("Please give the full name of the file");
      } else if (type === "file" && !is_rename && self.isBinaryFile(file_name)) {
        valid = false;
        $fw.client.dialog.error("Sorry, you can't create a binary file.");
      } else if (type === "file" && is_rename && self.isBinaryFile(old_name) && !self.isBinaryFile(file_name)) {
        valid = false;
        $fw.client.dialog.error("Sorry, this file is a binary file.");
      } else if (type === "file" && is_rename && !self.isBinaryFile(old_name) && self.isBinaryFile(file_name)) {
        valid = false;
        $fw.client.dialog.error("Sorry, this file is a text file.");
      }
      if (valid && file_name.indexOf("/") !== -1) {
        valid = false;
        $fw.client.dialog.error("Sorry, '/' can not be contained in the " + type + " name");
      }
      return valid;
    },

    makeTempNode: function (item) {
      item.addClass('temp');
    },

    makeRealNode: function (item) {
      item.removeClass('temp');
    },

    getItemType: function (item) {
      if (item.hasClass("file_item")) {
        return "file";
      } else {
        return "folder";
      }
    },

    checkDuplicated: function (item_parent, item, name) {
      var duplicated, children, child, ci, cl;
      
      duplicated = false;
      children = item_parent.children('ul').children();
      for (ci = 0, cl = children.length; ci < cl; ci += 1) {
        child = children[ci];
        if ($.trim($(child).children('a').text()) === name && (self.getItemType(item) === self.getItemType($(child))) && item.data('fileid') !== $(child).data("fileid")) {
          duplicated = true;
          break;
        }
      }
      return duplicated;
    },

    getItemId: function (item) {
      return item.data('fileid');
    },

    setItemId: function (item, id) {
      item.attr("data-fileid", id);
    },

    getItemPath: function (item) {
      var path = self.container.jstree('get_path', item);
      if (path && path.length > 1) {
        path = "/" + path.slice(1).join("/") + "/";
      } else {
        //path = item.attr('path');
        path = '/';
      }
      //log("getItemPath: " + path);
      return path;
    },

/*
      setItemPath: function (item, path) {
        item.attr('path', path);
      },*/

    getItemName: function (item) {
      return item.find("a:first").text().replace(/\s/g, "");
    },

    isBinaryFile: function (file_name) {
      return js_util.isBinaryExt(file_name);
    },

    rollbackFilename: function (node, ori_file_name) {
      var icon_html = "<ins class='jstree-icon'>&nbsp;</ins>";
      node.find('a').html(icon_html + ori_file_name);
    },

    server: {
      call: function (url, data, callback) {
        $.post(url, JSON.stringify(data), function (res) {
          callback(res);
        });
      },
      create: function (data, callback) {
        var url = Constants.CREATE_FILE_URL;        
        self.server.call(url, data, callback);
      },
      rename: function (data, callback) {
        var url = Constants.RENAME_FILE_URL;
        self.server.call(url, data, callback);
      },
      removeFile: function (data, callback) {
        var url = Constants.DELETE_FILE_URL;
        self.server.call(url, data, callback);
      },
      removeFolder: function (data, callback) {
        var url = Constants.REMOVE_FILE_URL;
        self.server.call(url, data, callback);
      },
      moveFile: function (data, callback) {
        var url = Constants.MOVE_FILE_URL;
        self.server.call(url, data, callback);
      },
      moveFolder: function (data, callback) {
        //TODO: which url for moving folders?
        //var url = "";
        //self.server.call(url, data, callback);
      },
      updateIndex: function (data, callback) {
        var url = Constants.START_FILE_URL;
        self.server.call(url, data, callback);
      }
    },

    /*
     * Select the File with the given ID
     */
    selectNode: function (file_id) {
      // TODO: Issue where id is not unique in dom, and used multiple times by jstree (as folder items). 
      //       workaround is to find file items first, then filter by id
      var file = self.container.find('.file_item').filter('#' + file_id),
        folder = file.parentsUntil('#editor_files_list').filter('.folder_item');
      self.container.jstree('open_node', folder, $.noop, true);
      file.find('a').trigger('click');
    }
  };
  self.init();
  return {
    load: self.load,
    destroy: self.destroy,
    selectNode: self.selectNode
  };
};