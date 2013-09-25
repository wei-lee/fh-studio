App.View.DataBrowserAdvancedEditor = App.View.DataBrowserView.extend({
  templates : {
    databrowserNavbar : '#databrowserNavbar',
    dataviewAdvancedEditorBarItems: '#dataviewAdvancedEditorBarItems',
    dataviewInlineError : '#dataviewInlineError'
  },
  events : {
    'click .btn-advancededitor-cancel' : 'onEditorCancel',
    'click .btn-advancededitor-save' : 'onEditorSave',
    'click .btn-dynamic-editor' : 'onEditorDynamic',
    'click .btn-raw-editor' : 'onEditorRaw'
  },
  json : undefined,
  initialize : function(opts){
    this.parent = opts.parent;
    this.compileTemplates();
  },
  render: function() {
    var barItems = this.templates.$dataviewAdvancedEditorBarItems(),
    nav = this.templates.$databrowserNavbar({ brand : 'Advanced Editor', 'class' : 'advancededitorBar', baritems : barItems });
    this.$el.empty();
    this.$el.append(nav);

    var container = document.createElement('div');
    this.editor = new jsoneditor.JSONEditor(container, {
      error : function(){ /* handled in below try catch - this doesn't get fired */}
    });
    this.$el.append(container);
    return this;
  },
  onEditorDynamic : function(){
    this.editor.setMode('tree');
  },
  onEditorRaw : function(){
    this.editor.setMode('text');
    // 'code' sets the Ace Editor mode - but there seems to be an incompatability of versions :-(
  },
  onEditorSave : function(e){
    try{
      this.json = this.editor.get();
    }catch(err){
      this.onJSONError(err);
      return;
    }
    this.model.set('fields', this.json);
    this.model.save();
    this.parent.onRowAdvancedEditDone(e);
  },
  onEditorCancel : function(e){
    this.parent.onRowAdvancedEditCancel(e);
  },
  update : function(model){
    this.model = model;
    this.editor.set(model.get('fields'));
  },
  onJSONError : function(err){
    var self = this;
    this.err = $(this.templates.$dataviewInlineError({ message : 'Error saving JSON: ' + err.toString() }));
    this.$el.prepend(this.err);
    setTimeout(function(){
      $(self.err).remove();
    }, 5000);
    console.log(arguments);
  }
});