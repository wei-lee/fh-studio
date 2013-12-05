var App = App || {};
App.View = App.View || {};

App.View.Forms = Backbone.View.extend({
  CONSTANTS: {
    FB : {
      FIELD_NAME : 'name',
      LABEL : 'name',
      FIELD_VALUE : 'fieldOptions.definition.defaultValue',
      FIELD_TYPE: 'type',
      DESCRIPTION: 'fieldOptions.definition.helpText',
      DESCRIPTION_TITLE : 'Instructions',
      MINREPITIONS: 'fieldOptions.definition.minRepeat',
      MAXREPITIONS: 'fieldOptions.definition.maxRepeat',
      REPEATING: 'repeating',
      VALIDATE_IMMEDIATELY: 'fieldOptions.validation.validateImmediately',
      OPTIONS : 'fieldOptions.definition.options',
      LENGTH_UNITS : 'fieldOptions.validation.units',
      MIN: 'fieldOptions.definition.min',
      MAX: 'fieldOptions.definition.max',
      MINLENGTH: 'fieldOptions.definition.min',
      MAXLENGTH: 'fieldOptions.definition.max',
      INCLUDE_OTHER: 'fieldOptions.definition.include_other_option',
      INCLUDE_BLANK: 'fieldOptions..definition.include_blank_option',
      SINGLE_CHECKED: 'fieldOptions.definition.checked',
      FIELD_OPTIONS : 'fieldOptions',
      LOCATION_UNIT: 'fieldOptions.definition.locationUnit',
      DATETIME_UNIT: 'fieldOptions.definition.datetimeUnit',
      FILE_SIZE : 'fieldOptions.definition.file_size',
      PHOTO_HEIGHT: 'fieldOptions.definition.photoHeight',
      PHOTO_WIDTH: 'fieldOptions.definition.photoWidth',
      PHOTO_QUALITY: 'fieldOptions.definition.photoQuality',
      TIME_AUTOPOPULATE: 'fieldOptions.definition.timeAutopopulate',
      VALUE : 'fieldOptions.definition.defaultValue',
      REQUIRED : 'required',
      VALUE_HEADER : 'Default Value',
      TYPE_ALIASES : {
        'paragraph' : 'textarea',
        'website' : 'url',
        'price' : 'money',
        'section_break' : 'sectionBreak',
        'email' : 'emailAddress',
        'autodate' : 'dateTime',
        'map' : 'locationMap'
      }
    },
    FORM: {
      NAME: 'name',
      DESC: 'description',
      UPDATED: 'lastUpdated',
      USING: 'appsUsingForm',
      SUBSTODAY: 'submissionsToday',
      SUBS: 'submissionsTotal',
      PAGES: 'pages',
      FIELDS: 'fields',
      PAGE_BREAK: 'page_break'
    },
    THEME : {
      NAME : 'name',
      UPDATED : 'lastUpdated',
      USING: 'appsUsingTheme',
      COLOURS : 'colours',
      TYPOGRAPHY : 'typography',
      BORDERS : 'borders',
      BUTTONS : 'buttons',
      LOGO : 'logo'
    },
    FORMSAPP : {
      NAME : 'title',
      VERSION : 'version',
      UPDATED : 'modified',
      FORMS : 'forms',
      THEMENAME : 'theme.name'
    }
  },
  initialize: function(){
    this.compileTemplates();

    // For all forms views apply form builder field mappings
    _.each(this.CONSTANTS.FB, function(val, key){
      Formbuilder.options.mappings[key] = val;
    });
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
      fields.push({ name :p.get('name'), value : '', cid :p.get('_id'), _id :p.get('_id'), type : self.CONSTANTS.FORM.PAGE_BREAK });
      _.each(p.get(self.CONSTANTS.FORM.FIELDS), function(f, i){
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