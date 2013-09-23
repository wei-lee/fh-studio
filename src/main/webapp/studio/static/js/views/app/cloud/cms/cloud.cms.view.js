var App = App || {};
App.View = App.View || {};

App.View.CMS = Backbone.View.extend({

  events: {
    'click table tbody tr': 'showDetails',
    'submit #configureSectionForm' : 'onSectionSave',
    'reset #configureSectionForm' : 'onSectionDiscard',
    'click btn-deletesection' : 'onDeleteSection',
    'focus input[name=publishdate]' : 'onPublishDateFocus'
  },
  templates : {
    'cms_home' : '#cms_home',
    'cms_left' : '#cms_left',
    'cms_configureSection' : '#cms_configureSection',
    'cms_sectionExtraTabs' : '#cms_sectionExtraTabs'
  },
  initialize: function(){
    this.compileTemplates();
  },
  render: function(){
    this.renderFormBuilder();
    this.$el.addClass('row nomargin');

    this.renderTree();
    this.$el.find('.fb-tabs').append(this.templates.$cms_sectionExtraTabs());
    this.$el.find('.fb-tab-content').append(this.templates.$cms_configureSection());

    return this;
  },
  renderTree : function(){
    this.$el.prepend(this.templates.$cms_left());
    this.$el.find('.treeContainer').jstree({
      "json_data" : {
        "data" : [
          {
            "data" : "A node",
            "metadata" : { id : 23 },
            "children" : [ "Child 1", "A Child 2" ]
          },
          {
            "attr" : { "id" : "li.node.id1" },
            "data" : {
              "title" : "Long format demo",
              "attr" : { "href" : "#" }
            }
          }
        ]
      },
      'core': {
        initially_open: ['root'],
        animation: 0
      },
      'themes': {
        theme: 'classic',
        loaded: true
      },
      'plugins': ['themes', 'json_data', 'ui', 'cookies', 'crrm']
    }).bind("select_node.jstree", function (e, data) { alert(data.rslt.obj.data("id")); });
  },
  renderFormBuilder : function(){
    var self = this;
    this.fb = new Formbuilder(this.$el, {
      noScroll : true,
      noEditOnDrop : true,
      bootstrapData: [{"label":"Please enter your clearance number","field_type":"text","required":true,"field_options":{},"cid":"c6"}]
    });
    this.fb.on('save', function(payload){
      self.draft = payload;
    });

  },
  onSectionSave : function(e){
    e.preventDefault();
    var vals = {};
    $($(e.target).serializeArray()).each(function(idx, el){
      vals[el.name] = el.value;
    });
    if (vals.publishRadio && vals.publishRadio === "now"){
      vals.publishdate = new Date(); // TODO: Maybe this should be handled on the user's computer?
    }
    vals.fields = this.fb.mainView.collection.toJSON();
    console.log(vals);
    //TODO: Dispatch to server

    return false;
  },
  onSectionDiscard : function(){
    this.render();
    //TODO: Discard draft on server
  },
  onSectionDelete : function(){
    // TODO: Delete section on server
  },
  onPublishDateFocus : function(){
    this.$el.find('#publishRadioLater').attr('checked', true);
  },
  compileTemplates: function() {
    var templates = {};
    for (var key in this.templates){
      if (this.templates.hasOwnProperty(key)){
        var tpl = this.templates[key],
        html = $(tpl, this.$container).html();
        if (!html){
          throw new Error("No html found for " + key);
        }
        templates['$' + key] = Handlebars.compile(html);
      }
    }
    this.templates = templates;
  },
});