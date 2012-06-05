application.SnippetManager = Class.extend({
  support: null,
  
  init: function () {
    this.support = new application.SnippetSupport();
  },
  
  doCreate: function () {
    // initialise buttons if requried
    if (null === snippets_mine_snippet_view_save_create_button) {
      snippets_mine_snippet_view_save_create_button = $('#snippets_mine_snippet_view_save_create_button').bind('click', $fw_manager.client.snippet.validateCreateSnippet);
      $('#snippets_mine_snippet_create_back_button').bind('click', $fw_manager.client.snippet.doList);
    }
    // show the container
    $fw_manager.app.showAndHide('#snippets_mine_snippet_create', '.snippets-mine-container');
  },
  
  doViewMine: function (guid) {
    $fw_manager.client.model.Snippet.read(guid, function (snippet) {
      $fw_manager.client.snippet.populateSnippet($('#snippets_mine_snippet_view'), snippet, false);
      // initialise buttons if requried
      if (null === snippets_mine_snippet_view_save_update_button) {
        snippets_mine_snippet_view_save_update_button = $('#snippets_mine_snippet_view_save_update_button').bind('click', $fw_manager.client.snippet.validateUpdateSnippet);
        $('#snippets_mine_snippet_view_back_button').bind('click', $fw_manager.client.snippet.doList);
      }
      
      // show the container
      $fw_manager.app.showAndHide('#snippets_mine_snippet_view', '.snippets-mine-container');
    });
  },
  
  doViewTagged: function (guid) {
    $fw_manager.client.model.Snippet.read(guid, function (snippet) {
      $fw_manager.client.snippet.populateSnippet($('#snippets_tags_list_snippet_view'), snippet, true);
      // once off stuff
      if (null === snippets_tags_list_snippet_view_copy_snippet_button) {
        snippets_tags_list_snippet_view_copy_snippet_button = $('#snippets_tags_list_snippet_view_copy_snippet_button').bind('click', function () {
          $fw_manager.client.snippet.selectSnippetCode($('#snippets_tags_list_snippet_view'));
        });
        $('#snippets_tags_list_snippet_view_back_button').bind('click', function () {
          $fw_manager.client.snippet.doListByTag();
        });
        // disable input fields (as we're only viewing a snippet)
        $fw_manager.client.snippet.disableSnippetEdit($('#snippets_tags_list_snippet_view'));
      }
      // show container
      $fw_manager.app.showAndHide('#snippets_tags_list_snippet_view', '.snippets-tags-list-container');
    });
  },
  
  doViewSearched: function (guid) {
    Log.append('doViewSearched:' + guid);
    $fw_manager.client.model.Snippet.read(guid, function (snippet) {
      $fw_manager.client.snippet.populateSnippet($('#snippets_search_view'), snippet, true);
      if (null === snippets_search_view_back_button) {
        snippets_search_view_back_button = $('#snippets_search_view_back_button').bind('click', $fw_manager.client.snippet.doSearch);
        $('#snippets_search_view_copy_snippet_button').bind('click', function () {
          $fw_manager.client.snippet.selectSnippetCode($('#snippets_search_view'));
        });
        $fw_manager.client.snippet.disableSnippetEdit($('#snippets_search_view'));
      }
      $fw_manager.app.showAndHide('#snippets_search_view', '.snippets-search-container');
    });
  },
    
  /*
   * List all snippets belonging to logged in user
   */
  doList: function () {
    // bind element callbacks, if required
    if (null === snippets_mine_snippets_new_button) {
      snippet_create_button = $('#snippets_mine_snippets_new_button').bind('click', $fw_manager.client.snippet.doCreate);
    }
    
    // hide all snippet content expect snippet list
    $fw_manager.app.showAndHide('#snippets_mine_snippets', '.snippets-mine-container');
    
    // call the list function
    $fw_manager.client.model.Snippet.list( function (snippets) {
      // insert all snippets into the snippet grid
      var container = $('#snippets_mine_snippets');
      $fw_manager.client.snippet.insertSnippetsIntoGrid(container, snippets, function (id) {
        $fw_manager.client.snippet.doViewMine(id);
      }, true);
      // resize and recalibrate grid paging
      proto.Grid.resizeVisible();
    });
  },
  
  doListByTag: function () {
    // initialise buttons if requried
    if (null === snippets_tags_list_snippets_back_button) {
      snippets_tags_list_snippets_back_button = $('#snippets_tags_list_snippets_back_button').bind('click', function () {
        $fw_manager.client.snippet.doTagsList();
      });
    }
    $fw_manager.app.showAndHide('#snippets_tags_list_snippets', '.snippets-tags-list-container');
  },
  
  doTagsList: function () {
    Log.append('doTagsList');
    $fw_manager.client.model.Snippet.listTags( $fw_manager.client.snippet.insertTagsIntoGrid );
    $fw_manager.app.showAndHide('#snippets_tags_list_list', '.snippets-tags-list-container');
  },
  
  doSearch: function () {
    if (null === snippets_search_page_button) {
      snippets_search_page_button = $('#snippets_search_page_button').bind('click', $fw_manager.client.snippet.validateSearchSnippets);
      // bind 'enter' key
      $('#snippets_search_page_query').bind('keypress', function (e) {
         var code = (e.keyCode ? e.keyCode : e.which);
         if(code === 13) { //Enter keycode
           $fw_manager.client.snippet.validateSearchSnippets();
           // important to return false so form submit doesn't happen
           return false;
         }
      });
    }
    $fw_manager.app.showAndHide('#snippets_search_page', '.snippets-search-container');
  },
  
  // TODO: some of these could be support functions
  validateUpdateSnippet: function () {
    var form = $('#snippet_update_form');
    var validated_form = $fw_manager.client.snippet.validateSnippetForm(form);
    if (form.valid()) {
      Log.append('valid');
      var fields = $fw_manager.client.snippet.getSnippetFieldsFromForm(validated_form);
      var guid = validated_form.findByName("id").val();
      $fw_manager.client.model.Snippet.update(guid, fields, function (snippet) {
        Log.append('update success:' + snippet.guid);
        $fw_manager.client.snippet.doList();
      });
    }
  },
  
  validateCreateSnippet: function () {
    var form = $('#snippet_create_form');
    var validated_form = $fw_manager.client.snippet.validateSnippetForm(form);
    if (form.valid()) {
      Log.append('valid');
      var fields = $fw_manager.client.snippet.getSnippetFieldsFromForm(validated_form);
      $fw_manager.client.model.Snippet.create(fields, function (snippet) {
        Log.append('create success:' + snippet.guid);
        $fw_manager.client.snippet.doList();
      });
    }
  },
  
  // TODO: this could be genericised!!
  getSnippetFieldsFromForm: function (form) {
    var fields = {};
    
    fields.label = form.findByName('label').val();
    fields.description = form.findByName('description').val();
    fields.tags = form.findByName('tags').val();
    fields.code = form.findByName('code').val();
    fields.shared = form.findByName('shared').is(':checked');
    
    return fields;
  },
  
  validateSnippetForm: function (form) {
    return form.validate({
      rules: {
        'label': 'required',
        'description': 'required',
        'tags': 'required',
        'code': 'required'
      }
    });
  },
  
  validateSearchSnippets: function () {
    Log.append('snippet search form valid');
    var query = $('#snippets_search_page_query').val();
    //var description = $('#snippet_search_description').is(':checked');
    $fw_manager.client.model.Snippet.search(query, $fw_manager.client.snippet.handleSearchSnippetsSuccess);
  },
  
  handleSearchSnippetsSuccess: function (snippets) {
    Log.append('handleSearchSnippetsSuccess');
    // put data into dom
    var container = $('#snippets_search_page');
    $fw_manager.client.snippet.insertSnippetsIntoGrid(container, snippets, function (id) {
      $fw_manager.client.snippet.doViewSearched(id);
    });
    // show snippets
    $fw_manager.client.snippet.doSearch();
    proto.Grid.resizeVisible();
  },
  
  /* Support functions */
  
  insertSnippetsIntoGrid: function (container, snippets, snippet_view_callback, shared_column) {
    return $fw_manager.client.snippet.support.insertSnippetsIntoGrid(container, snippets, snippet_view_callback, shared_column);
  },
  
  insertTagsIntoGrid: function (tags) {
    return $fw_manager.client.snippet.support.insertTagsIntoGrid(tags);
  },
  
  populateSnippet: function (container, snippet, highlight_code) {
    return $fw_manager.client.snippet.support.populateSnippet(container, snippet, highlight_code);
  },
  
  selectSnippetCode: function (container) {
    return $fw_manager.client.snippet.support.selectSnippetCode(container);
  },
  
  disableSnippetEdit: function (container) {
    return $fw_manager.client.snippet.support.disableSnippetEdit(container);
  }
  
});