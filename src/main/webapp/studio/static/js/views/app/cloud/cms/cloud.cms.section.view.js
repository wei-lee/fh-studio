var App = App || {};
App.View = App.View || {};

App.View.CMSSection = App.View.CMS.extend({

  events: {
    'submit #configureSectionForm' : 'onSectionSave',
    'reset #configureSectionForm' : 'onSectionDiscard',
    'click btn-deletesection' : 'onDeleteSection',
    'focus input[name=publishdate]' : 'onPublishDateFocus'
  },
  templates : {
    'cms_configureSection' : '#cms_configureSection',
    'cms_sectionExtraTabs' : '#cms_sectionExtraTabs'
  },
  initialize: function(options){
    this.collection = options.collection;
    this.section = options.section;
    this.compileTemplates();
  },
  render : function(){
    var self = this;

    var section = this.collection.findSectionByHash(this.section),
    fields = this.massageSection(section);

    if (!section || !fields){
      alert("Error loading section");
      console.log('Error finding section or fields on rendering section view');
      //TODO: Modal, fire up event?
    }

    // Save some data massaging
    this.fb = new Formbuilder(this.$el, {
      noScroll : true,
      noEditOnDrop : true,
      bootstrapData: fields
    });
    this.fb.on('save', function(payload){
      self.draft = payload;
    });

    this.$el.find('.fb-tabs').append(this.templates.$cms_sectionExtraTabs());
    this.$el.find('.fb-tab-content').append(this.templates.$cms_configureSection());

    return this;
  },
  massageSection : function(section){
    if (!section || !section.fields){
      return undefined;
    }
    var fields = [];

    _.each(section.fields, function(field){
      var newField = {};
      switch(field.type){
        case "string":
          newField.field_type = "text";
          break;
        case "list": // TODO
          newField.field_type = "text";
          break;
        default:
          newField.field_type = field.type;
          break;
      }
      newField.label = field.name;
      newField.value = field.value;
      fields.push(newField);
    });
    return fields;
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
  setSection : function(section){
    this.section = section;
    this.render();
  }
});