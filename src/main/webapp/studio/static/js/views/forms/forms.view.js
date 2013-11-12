var App = App || {};
App.View = App.View || {};

App.View.Forms = Backbone.View.extend({
  CONSTANTS: {
    FB : {
      FIELD_NAME : 'name',
      FIELD_VALUE : 'fieldOptions.definition.defaultValue',
      FIELD_TYPE: 'type',
      DESCRIPTION: 'helpText',
      MINREPITIONS: 'fieldOptions.definition.minRepeat',
      MAXREPITIONS: 'fieldOptions.definition.maxRepeat',
      TYPE_ALIASES : {
        'paragraph' : 'textarea',
        'checkboxes' : 'checkbox',
        'dropdown' : 'select',
        'website' : 'url',
        'price' : 'money',
        'section_break' : 'sectionBreak',
        'email' : 'emailAddress'
      }
    },
    FORM: {
      NAME: 'name',
      DESC: 'description',
      UPDATED: 'lastUpdated',
      USING: 'using',
      SUBSTODAY: 'submissionsToday',
      SUBS: 'submissions',
      PAGES: 'pages',
      FIELDS: 'fields'

    }
  },
  initialize: function(){
    this.compileTemplates();

    // For all forms views apply form builder field mappings
    Formbuilder.options.mappings.LABEL = this.CONSTANTS.FB.FIELD_NAME;
    Formbuilder.options.mappings.VALUE = this.CONSTANTS.FB.FIELD_VALUE;
    Formbuilder.options.mappings.FIELD_TYPE = this.CONSTANTS.FB.FIELD_TYPE;
    Formbuilder.options.mappings.TYPE_ALIASES = this.CONSTANTS.FB.TYPE_ALIASES;
  },
  breadcrumb : function(trail){
    var crumbs = [],
    crumbEl = $('#forms_layout ul.breadcrumb');
    _.each(trail, function(crumb, index, list){
      if (index === list.length-1){
        crumbs.push('<li class="active">' + crumb  + '</li>');
      }else{
        crumbs.push('<li><a href="#">' + crumb + '</a> <span class="divider">/</span></li>');
      }
    });
    crumbEl.html(crumbs.join(''));
    return crumbEl;
  },
  modal : function(msg, title){
    title = title || 'Confirm';
    this.modalView = new App.View.Modal({
      body : msg,
      title : title,
      cancelText : false
    });
    this.$el.append(this.modalView.render().$el);
  },
  formToFormBuilderFields : function(form){
    var self = this,
    pages = form.get(this.CONSTANTS.FORM.PAGES),
    fields = [];
    pages.each(function(p, i){
      fields.push({ name :p.get('name'), value : '', cid :p.get('_id'), _id :p.get('_id'), type : 'page_break' });
      _.each(p.get(self.CONSTANTS.FORM.FIELDS), function(f, i){
        var notYetDone = ['shortname', 'europhone', 'likert', 'locationLatLong', 'locationNorthEast', 'locationMap', 'timeField', 'dateTimeField', 'dateTime']; // TODO Do these then remove
        if (notYetDone.indexOf(f.type)>-1){
          f.type = "text";
        }
        fields.push(f);
      });

      //TODO: Relational should mean we can do this, why not?
//      p.get('Fields').each(function(f, i){
//
//      });
    });
    return fields;
  },
  message : function(msg, cls){
    cls = cls || 'success';
    msg = msg || 'Save successful';

    var form_message = Handlebars.compile($('#form_message').html()),
    alertBox = $(form_message({ cls : cls, msg : msg })),
    el = $('#forms_container');
    $(el).prepend(alertBox);

    // Fade out then remove our message
    setTimeout(function(){
      alertBox.fadeOut('fast', function(){
        alertBox.remove();
      });
    }, 3000);
  }
});