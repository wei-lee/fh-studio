var Plugins = Plugins || {}; // Todo should this be singular? Singular just for the model?
Plugins.Collection = Plugins.Collection || {};
Plugins.Collections = Plugins.Collections || {};

Plugins.Model = Backbone.Model.extend({

});

Plugins.Collection.Plugin = Backbone.Collection.extend({
  model: Plugins.Model,

  initialize: function() {},


  sync: function(method, model, options){
    if("read" === method){

    } else {

    }
  }
});

Plugins.Collections.Plugins = new Plugins.Collection.Plugin();
