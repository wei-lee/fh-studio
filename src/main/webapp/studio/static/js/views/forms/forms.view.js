var App = App || {};
App.View = App.View || {};

App.View.Forms = Backbone.View.extend({
  CONSTANTS: {
    FB : {
      FIELD_NAME : 'Title',
      FIELD_VALUE : 'Defaultval',
      FIELD_TYPE: 'Type',
      TYPE_ALIASES : {
        'paragraph' : 'textarea',
        'checkboxes' : 'checkbox',
        'dropdown' : 'select',
        'website' : 'url',
        'price' : 'money'
      }
    },
    FORM: {
      NAME: 'Name',
      DESC: 'Description',
      UPDATED: 'DateUpdated',
      USING: 'Using',
      SUBSTODAY: 'SubmissionsToday',
      SUBS: 'Submissions',
      PAGES: 'Pages',
      FIELDS: 'Fields'

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
    crumbEl.html(crumbs.join(''))
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
      _.each(p.get(self.CONSTANTS.FORM.FIELDS), function(f, i){
        var notYetDone = ['shortname', 'europhone', 'likert']; // TODO Do these then remove
        if (notYetDone.indexOf(f.Type)>-1){
          f.Type = "text";
        }
        fields.push(f);
      });

      //TODO: Relational should mean we can do this, why not?
//      p.get('Fields').each(function(f, i){
//
//      });
      // Push our page break if we have more than 1 page
      if (i>0){
        fields.push({ name : 'Page Break', value : '', type : 'page_break' });
      }
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