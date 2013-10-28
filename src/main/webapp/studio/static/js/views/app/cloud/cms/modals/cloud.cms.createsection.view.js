var App = App || {};
App.View = App.View || {};

App.View.CMSCreateSection = App.View.Modal.extend({

  initialize: function(options){
    this.tpl = Handlebars.compile($('#cms_sectionDropDown').html());

    var parentOptions = this.options.collection.toHTMLOptions(),
    body;
    parentOptions = ["<option value='' data-path='' >-Root</option>"].concat(parentOptions);
    parentOptions = parentOptions.join('');
    body = $(this.tpl({"parentOptions":parentOptions}));

    body.find('select').val(this.activeSection); // TODO Fix me so active selection is the selected node in here..

    body.append('<br/> <input class="input-large" placeholder="Enter a Section name" id="newCollectionName">');

    this.options = options = {
     collection : options.collection,
      title: 'Create New Section',
      okText: 'Create',
      ok : this.ok,
      body : body
    };

    return this.constructor.__super__.initialize.apply(this, [options]);

  },
  ok: function (e) {
    var el = $(e.target),
    input = el.parents('.modal').find('input#newCollectionName'),
    sectionIn = el.parents('.modal').find("select[name='parentName']").find('option').filter(":selected").val(),
    secVal = input.val();
    this.doCreateSection({ name : secVal.toString(), parent : sectionIn.toString()});
    this.trigger('activeChanged', sectionIn);
  },
  doCreateSection: function (sectionParams) {
    var self = this,
    selectedSection = sectionParams.parent,
    node;

    var parentSection = (selectedSection === "root") ? "" : self.options.collection.findWhere({"name":selectedSection});
    var id = "temp-"+new Date().getTime();

    var childrenKey = App.Model.CmsSection.CONST.CHILDREN;

    if (parentSection) {
      if (!parentSection.get(childrenKey)){
        parentSection.set(childrenKey,[]);
      }

      var path = parentSection.get("path") || "";
      path+= "." + sectionParams.name;

      node = {
        "path": path,
        "_id": id,
        "name": sectionParams.name,
        "data": sectionParams.name,
        "parent" : sectionParams.parent,
        "children": []
      };

      parentSection.attributes.children.push(node.hash);
    }else{
      //add new parent section
      node = {
        "path":sectionParams.name,
        "_id":id,
        "name":sectionParams.name,
        "data":sectionParams.name,
        "parent" : sectionParams.parent,
        "children":[]
      };
    }

    var model = new App.Model.CmsSection(node);
    self.options.collection.push(model);

    this.options.collection.sync('create', model.toJSON(), { success : function(res){

      self.options.collection.fetch({reset : true, success : function(){
        self.trigger('message', 'Section successfully saved');
      }});
    }, error : function(err){
      self.trigger('message', err.toString(), 'danger');
    }});
    if (self.tree && self.tree.$el){
      self.tree.$el.jstree("unset_focus");
    }
  }
});