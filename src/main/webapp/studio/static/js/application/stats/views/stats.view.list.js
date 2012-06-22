Stats.View.List = Class.extend({
  model: null,
  controller: null,
  renderTo: null,

  init: function(params) {
    this.controller = params.controller;
    this.model = params.model;
    this.renderTo = params.renderTo;
  }
});