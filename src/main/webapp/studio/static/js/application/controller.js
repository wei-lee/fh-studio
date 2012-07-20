var Controller = Class.extend({
  init: function () {
    // generic controller stuff
  },

  show: function () {
    // generic show
  },

  hide: function () {
    // generic hide
  },

  // Generic Swap select controller
  bindSwapSelect: function(container) {
    $(container).find('.swap-select').each(function(i, item){
      var add_button = $('.add', item);
      var remove_button = $('.remove', item);
      var swap_from = $('.swap-from', item);
      var swap_to = $('.swap-to', item);

      add_button.unbind().click(function() {
        $('option:selected', swap_from).each(function() {
          swap_to.append("<option value='" + $(this).val() + "'>" + $(this).text() + "</option>");
          $(this).remove();
        });
        return false;
      });
      remove_button.unbind().click(function() {
        $('option:selected', swap_to).each(function() {
          swap_from.append("<option value='" + $(this).val() + "'>" + $(this).text() + "</option>");
          $(this).remove();
        });
        return false;
      });
    });
  }

});