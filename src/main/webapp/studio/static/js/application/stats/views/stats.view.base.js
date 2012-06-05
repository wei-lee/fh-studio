var Stats = Stats || {};

Stats.View = Class.extend({
  controller: null,
  model: null,
  chart_container: null,
  table_container: null,
  init: function(params) {
    this.controller = params.controller;
    this.model = params.model;
  }
});