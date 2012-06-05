application.SnippetSupport = Class.extend({  
  init: function () {
    
  },
  
  insertSnippetsIntoGrid: function (container, snippets, snippet_view_callback, shared_column) {
    // find the relevant grid
    var container_id = container.attr('id');
    var grid = container.find('.snippets-list-grid');
    
    if (!grid.hasClass('ui-jqgrid-btable')) {
      Log.append('initialising snippet grid');
      var pager = container.find('.snippets-list-pager');
      // manually set grid and pager id for this container so we can pass it to jqgrid
      var grid_id = container_id + '_grid';
      var pager_id = container_id + '_pager';
      grid.attr('id',grid_id);
      pager.attr('id',pager_id);
      
      var opts = {
        pager: '#' + pager_id,
        colModel : [
          {index : 'id', name : 'id', hidden : true},
          {index : 'label', name : 'label', editible : false},
          {index : 'description', name : 'description', editible : false}, 
          {index : 'tags', name : 'tags', editible : false}
        ],
        colNames : [    
          'ID', $fw_manager.client.lang.getLangString('snippet_details_name'), $fw_manager.client.lang.getLangString('snippet_details_description'), $fw_manager.client.lang.getLangString('snippet_details_tags')
        ],
        onSelectRow: function (id) {
          Log.append('row selected:' + id);
          snippet_view_callback(id);
        }
      };
      
      if (shared_column) {
        opts.colModel.push({ index: 'shared', name: 'shared', editable: false, formatter:'checkbox'});
        opts.colNames.push($fw_manager.client.lang.getLangString('snippet_details_shared'));
      }
      
      grid = proto.Grid.load(grid, opts);
    }
    
    grid.jqGrid('clearGridData');
    // iterate over each snippet, inserting them into the grid and binding view callbacks
    Log.append('add snippets to grid');
    for (var si=0; si<snippets.length; si++) {
      var snippet = snippets[si];
      grid.jqGrid('addRowData', snippet.id, snippet);
    }
    
    // trigger grid reload to allow paging to be updated
    grid.trigger('reloadGrid');  
  },
  
  insertTagsIntoGrid: function (tags) {
    Log.append('insertTagsIntoGrid');
    
    // find the relevant grid
    var container = $('#snippets_tags_list_list');
    // detach table from DOM so we can make changes to it
    var grid = container.find('#snippets_tags_list_grid');
    
    if (!grid.hasClass('ui-jqgrid-btable')) {
      Log.append('initialising tags grid');
      
      var opts = {
        pager: '#snippets_tags_list_pager',
        colModel : [
          {index : 'id', name : 'id', hidden : true},
          {index : 'name', name : 'name', editible : false},
          {index : 'snippets', name : 'snippets', editible : false}
        ],
        colNames : [    
          'ID', $fw_manager.client.lang.getLangString('snippet_tags_name'), $fw_manager.client.lang.getLangString('snippet_tags_num')
        ],
        onSelectRow: function (tag_name) {
          Log.append('row selected:' + tag_name);
          $fw_manager.client.model.Snippet.listByTag(tag_name, function (snippets) {
            $('#tags_list_snippets_tag').text(tag_name);
            // put data into dom
            var container = $('#snippets_tags_list_snippets');
            $fw_manager.client.snippet.insertSnippetsIntoGrid(container, snippets, function (id) {
              $fw_manager.client.snippet.doViewTagged(id);
            });
            // show data
            $fw_manager.client.snippet.doListByTag();
            proto.Grid.resizeVisible();
          });
        }
      };
      
      grid = proto.Grid.load(grid, opts);
    }
    
    grid.jqGrid('clearGridData');
    // iterate over each snippet, inserting them into the grid and binding view callbacks
    Log.append('add snippets to grid');
    for (var ti=0; ti<tags.length; ti++) {
      var tag = tags[ti];
      grid.jqGrid('addRowData', tag.name, {id: tag.name, name: tag.name, snippets: tag.clients.length});
    }
    
    // trigger grid reload to allow paging to be updated
    grid.trigger('reloadGrid');
    proto.Grid.resizeVisible(); 
    
    
    
    /*
    
    
    // empty table body
    var table_body = table.find('tbody').empty().detach();
    
    for (var ti=0; ti<tags.length; ti++) {
      var tag = tags[ti];
      var item = $('<tr>').append($('<td>', {
        text: tag.name
      })).append($('<td>', {
        text: tag.clients.length
      }));
      
      // bind a click event to the entire row, that opens the snippets grid
      item.data('name',tag.name).bind('click', function () {
        var tag_name = $(this).data('name');
        // TODO: should this be a separate function
        $fw_manager.client.model.Snippet.listByTag(tag_name, function (snippets) {
          $('#tags_list_snippets_tag').text(tag_name);
          // put data into dom
          var container = $('#snippets_tags_list_snippets');
          $fw_manager.client.snippet.insertSnippetsIntoGrid(container, snippets, function (id) {
            $fw_manager.client.snippet.doViewTagged(id);
          });
          // show data
          $fw_manager.client.snippet.doListByTag();
          proto.Grid.resizeVisible();
        });
      });
      
      table_body.append(item);
    }
    // re-attach table
    table.append(table_body); */
  },
    
  populateSnippet: function (container, snippet, highlight_code) {
    Log.append('populateSnippet');
    var view_container = container.find('.snippet-view');
    for(var key in snippet) {
      var value = snippet[key];
      var class_name = 'snippet-view-' + key;
      var input_element = view_container.find('.' + class_name);
      if ('boolean' === typeof value) {
        input_element.attr('checked', value ? 'checked' : '');
      }
      else if ('code' === key) {
        var output = container.find('.snippet-view-code-highlighted .code-lines').empty();
        var numbers = container.find('.snippet-view-code-highlighted .code-numbers').empty();
        var lines = container.find('.snippet-view-code-highlighted .code-lines').empty();
        if (!highlight_code) {
          output.hide();
          input_element.val(value).show();
        }
        else {
          input_element.hide();
          var lineNo = 1;
          $fw_manager.client.editor.highlightCode(value, function (line) {
            numbers[0].appendChild(document.createTextNode(String(lineNo++)));
            numbers[0].appendChild(document.createElement("BR"));
            for (var i = 0; i < line.length; i++){
              lines[0].appendChild(line[i]);
            }
            lines[0].appendChild(document.createElement("BR"));
          }, 'js');
          output.show();
        }
      }
      else{
        input_element.val(value);
      }
    }
  },
    
  //TODO: copying text to the clipboard using javascript is no easy task due to cross-browser issues
  // For now, selecting the snippet code will suffice
  selectSnippetCode: function (container) {
    // TODO: move this out to a plugin perhaps
    var text = container.find('.snippet-view .snippet-view-code-highlighted .code-lines')[0];
    if ($.browser.msie) {
        var range = document.body.createTextRange();
        range.moveToElementText(text);
        range.select();
    } else if ($.browser.mozilla || $.browser.opera) {
        var selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(text);
        selection.removeAllRanges();
        selection.addRange(range);
    } else if ($.browser.safari) {
        var selection = window.getSelection();
        selection.setBaseAndExtent(text, 0, text, 1);
    }
  },
  
  disableSnippetEdit: function (container) {
    // disable inputs and make textarea readonly
    container.find('input').attr('disabled', 'disabled')
     .end().find('textarea').attr('readonly', 'readonly');
    // also remove shared checkbox
    container.find('.snippet-view-shared').closest('.form-field').hide();
  }
});