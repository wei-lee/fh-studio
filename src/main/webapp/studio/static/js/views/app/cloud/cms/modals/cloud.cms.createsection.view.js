var App = App || {};
App.View = App.View || {};

App.View.CMSCreateSection = App.View.Modal.extend({

  initialize: function(options){
    this.tpl = Handlebars.compile($('#cms_sectionDropDown').html());

    var currentSelection = options.collection.findWhere({ _id : options.current }),
    siblingParent = currentSelection.get('parent'), // on creating, we want to create as a sibling of the current node by default
    parentOptions = this.options.collection.toHTMLOptions(),
    body;
    parentOptions = ["<option value='' data-path='' >-Root</option>"].concat(parentOptions);
    parentOptions = parentOptions.join('');
    body = $(this.tpl({"parentOptions":parentOptions}));

    body.find('select').val(siblingParent);

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
  },
  doCreateSection: function (sectionParams) {
    var self = this,
    id = "temp-"+new Date().getTime(),
    parent = sectionParams.parent,
    node = {
      "path":sectionParams.name,
      "_id":id,
      "name":sectionParams.name,
      "data":sectionParams.name,
      "parent" : "", // assume root, override as needed
      "children":[]
    };

    if (parent && parent!== "root") {
      node.parent = parent;

      var parentModel = self.options.collection.findWhere({"name":parent});
      var path = parentModel.get("path") || "";
      path+= "." + sectionParams.name;
      node.path = path;
    }

    var model = new App.Model.CmsSection(node);
    self.options.collection.push(model);

    this.options.collection.sync('create', model.toJSON(), { success : function(res){
      self.options.collection.fetch({reset : true, success : function(collection){
        // TODO: Non-ideal - only trigger our section change event when the collection has loaded because
        // the POST doesn't return the Id of the newly created section
        var model = collection.findWhere({name : node.name});
        self.trigger('sectionchange', model.get('_id'));
        self.trigger('message', 'Section created successfully');
      }});
    }, error : function(err){
      self.trigger('message', err.toString(), 'danger');
    }});
    if (self.tree && self.tree.$el){
      self.tree.$el.jstree("unset_focus");
    }
  }
});