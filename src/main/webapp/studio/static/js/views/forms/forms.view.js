var App = App || {};
App.View = App.View || {};

App.View.Forms = Backbone.View.extend({
  CONSTANTS: {
    FB : {
      FIELD_NAME : 'name',
      FIELD_VALUE : 'defaultval',
      FIELD_TYPE: 'type',
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
      SUBS: 'Submissions'

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
  formsBreadcrumb : function(path){
    var crumbs = [];
    crumbs.push('<ul class="breadcrumb">');
    _.each(path.split('.'), function(crumb, index, list){
      if (index === list.length-1){
        crumbs.push('<li class="active">' + crumb  + '</li>');
      }else{
        crumbs.push('<li><a href="#">' + crumb + '</a> <span class="divider">/</span></li>');
      }
    });
    crumbs.push('</ul>');
    return crumbs.join('');
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
    pages = form.get('Pages'),
    fields = [];
    pages.each(function(p, i){
      _.each(p.get('Fields'), function(f, i){
        var notYetDone = ['shortname', 'europhone', 'likert']; // TODO Do these then remove
        if (notYetDone.indexOf(f.Type)>-1){
          f.Type = "text";
        }
        fields.push({
          name :f.Title,
          value :f.DefaultVal,
          type : f.Type
        });
        // Push our page break if we have more than 1 page
      });

      //TODO: Relational should mean we can do this, why not?
//      p.get('Fields').each(function(f, i){
//
//      });

      if (i>0){
        fields.push({ name : 'Page Break', value : '', type : 'file' });
      }

    });
    return fields;
  }
});