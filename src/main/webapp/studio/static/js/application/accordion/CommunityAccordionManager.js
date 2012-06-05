/*
 * Contains callbacks for accordion containers
 */
application.CommunityAccordionManager = application.AccordionManager.extend({
    
  init: function (accordion_name) {
    this._super(accordion_name);
  },

  postSelectSnippetsTags: function () {
    Log.append('snippets_tags_container postSelect callback');

    // initilalise tabs if required
    if (null === snippets_tags_tabs) {
      snippets_tags_tabs = proto.Tabs.load($('#snippets_tags_container'), {
        show: $fw_manager.app.postShowTab
      });
    } else {
      // TODO: reload tag cloud also when implemented
      $fw_manager.client.snippet.doTagsList();
    }
  },

  postSelectSnippetsMine: function () {
    // show the snippets list first
    $fw_manager.client.snippet.doList();
  },

  postSelectSnippetsSearch: function () {
    Log.append('postSelectSnippetsSearchContainer');
    $fw_manager.client.snippet.doSearch();
  }

});