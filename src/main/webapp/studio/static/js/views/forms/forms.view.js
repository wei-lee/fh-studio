var App = App || {};
App.View = App.View || {};

App.View.Forms = Backbone.View.extend({
  initialize: function(){
    this.compileTemplates();
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
  toFormBuilderType : function(type){
    switch(type){
      case "textarea":
        return "paragraph";
      default:
        return type;
    }
  },
  fromFormBuilderType : function(type){
    switch(type){
      case "paragraph":
        return "textarea";
      default:
        return type;
    }
  },
  formToFormBuilderFields : function(form){
    var self = this,
    pages = form.get('Pages'),
    fields = [];
    pages.each(function(p, i){
      _.each(p.get('Fields'), function(f, i){
        fields.push({
          label :f.Title,
          value :f.DefaultVal,
          field_type : self.toFormBuilderType(f.Type)
        });
        // Push our page break if we have more than 1 page
      });

      //TODO: Relational should mean we can do this, why not?
//      p.get('Fields').each(function(f, i){
//
//      });


      if (i>0){

      }
      fields.push({ label : 'Page Break', value : '', field_type : 'file' });

    });
    return fields;
  }
});