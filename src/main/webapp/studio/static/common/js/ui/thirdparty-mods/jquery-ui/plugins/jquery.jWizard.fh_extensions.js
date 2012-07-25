var fh_extensions_jquery_jwizard = {
  _step_history: [],
  
  firstStep: function () {
    this._step_history = [];
    this._changeStep(0);
  },
  
  /**
   * @description Jumps to the next step in the wizard's step collection
   * The next step is determined by checking in order a number of possible locations
   * - getNextStep function attached to the current step's data
   * - next attribute on checked radio option inside the current step
   * - next attribute on current step
   * - next step in DOM order
   * @return void
   */
  nextStep: function () {
    var current_step = this.element.find('.jw-step:eq(' + this._stepIndex + ')');
    var next_step = null;
    
    // possible next step locations
    var getNextStep = current_step.data('getNextStep');
    var radio_next = current_step.find('input:radio:checked').attr('next');
    var next_attr = current_step.attr('next');
    
    if ('function' === typeof getNextStep) {
      // is there a callback function to get the next step?
      next_step = getNextStep.call(current_step);
    }
    else if ('undefined' !== typeof radio_next) {
      // is the next step id in an attribute of a checked radio input?
      next_step = this.element.find('#' + radio_next);
    }
    else if ('undefined' !== typeof next_attr) {
      // is the next step id in an attribute of the current step?
      next_step = this.element.find('#' + next_attr);
    }
    else {
      // fallback to regular next step
      next_step = this.element.find('.jw-step:eq(' + (this._stepIndex + 1) + ')');
    }
    this._changeStep(next_step);
  },
  
  previousStep: function () {
    // Get previous step from step history stack
    var previous_step = this._step_history[this._step_history.length - 1];
    this._changeStep(previous_step);
  },
  
  _changeStep: function (nextStep, bIsFirstStep) {
    var $steps = this.element.find(".jw-step");
    var $currentStep = bIsFirstStep ? undefined : $($steps[this._stepIndex]);

    bIsFirstStep = bIsFirstStep || false;

    var current_step_index = $currentStep == undefined ? 0 : $steps.index($currentStep);
    var next_step_index = null;
    if (typeof nextStep === "number") {
      if (nextStep < 0 || nextStep > ($steps.length - 1)) {
        alert("Index " + nextStep + " Out of Range");
        return false;
      }
      next_step_index = nextStep;
      nextStep = $steps.eq(nextStep);
    } else if (typeof nextStep === "object") {
      if (!nextStep.is($steps.selector)) {
        alert("Supplied Element is NOT one of the Wizard Steps");
        return false;
      }
      next_step_index = $steps.index(nextStep);
    }
    
    // If we're going forward, trigger goingForward callback i.e. validation
    // TODO: figure out why this fails sometimes in IE
    try {
      if (next_step_index > current_step_index) {
        if ($currentStep.triggerHandler("goingForward") === false) {
          return false;
        }
      }
    }
    catch (e) {
      log(e);
    }
    
    // Every check passed for a valid step change, so lets update the step index
    this._stepIndex = next_step_index;
    
    // If we're going forward, add current step to history
    if (this._stepIndex > current_step_index) {
      // make sure we have a step first
      if ($currentStep.length > 0) {
        this._step_history.push($currentStep);
        // call the 'leaving step' callback, if any
        $currentStep.triggerHandler("leavingForward");
        //$currentStep.find('input,textarea');
      }
    }
    // If we're going back, pop off all previous steps from history back to required step
    else if (this._stepIndex < current_step_index) {
      var history_step_id = null;
      //var nextStep = $($steps[this._stepIndex]);
      while (nextStep.attr('id') != history_step_id) {
        history_step_id = this._step_history.pop().attr('id');
      }
    }

    nextStep.data('step_data', this.getStepData(nextStep));
    
    // trigger next callback after step data is populated
    if (next_step_index > current_step_index) {
      // only trigger 'next' callback if we've already started the wizard i.e. current step is at least 0
      if (current_step_index > -1) {
        // TODO: use a calculated step no. here instead
        this._trigger('next', {}, [nextStep, $currentStep]);
      }
    }
    
    $currentStep = nextStep;
    
    this._updateTitle(bIsFirstStep, nextStep);
    if (this.options.menuEnable) {
      this._updateMenu();
    }
    if (this.options.counter.enable) {
      this._updateCounter(nextStep);
    }
    
    
    
    if (typeof $currentStep !== "undefined") {
      this.options.effects.step.hide.callback = $.proxy(function () {
        this._effect(nextStep, "step", "show", "show");
        nextStep.trigger("show");
      }, this);

      this.element.find(".jw-step").hide();
      this._effect($currentStep, "step", "hide", "hide");
    } else {
      this._effect(nextStep, "step", "show", "show");
      nextStep.trigger("show");
    }
    
    // If we're on a progress step, hide buttons, otherwise re-show them
    if (nextStep.hasClass('progress-step')) {
      this.element.find('.jw-buttons').hide();
    }
    else {
      this.element.find('.jw-buttons').show();
    }

    this._updateButtons();
    // TODO: need a post  show callback here for initialising dynamic content in steps or extra validation that can only be done after step is changed
    nextStep.trigger('postShow');
  },
  
  // Insert a sub-title and step number
  _buildTitle: function () {
    var oDivAttributes = {
      "class": ["jw-header", "ui-widget-header", "ui-corner-top"]
    };
    if (this.options.hideTitle) {
      oDivAttributes["class"].push("ui-helper-hidden");
    }
    oDivAttributes["class"] = oDivAttributes["class"].join(" ");
    this.element.prepend(this._html("div", oDivAttributes, '<h1 class="jw-supertitle" /><h2 class="jw-title" />'));
  },

  // Update sub-title and step number
  _updateTitle: function (bIsFirstStep, nextStep) {
    var $title = this.element.find(".jw-title"),
        $super_title = this.element.find(".jw-supertitle");

    if (nextStep.length === 0) {
      nextStep = this.element.find(".jw-step:first");
    }

    if (!bIsFirstStep) {
      this._effect($title, "title", "hide", "hide");
    }
    $super_title.text(this.element.attr(this.options.titleAttr) || '');
    
    var step_data = nextStep.data('step_data');
    var title = 'Step ' + step_data.current + ': ';
    var post_title = nextStep.attr(this.options.titleAttr);
    if ( post_title !== 'null' ) {
      title += post_title;
    }
    $title.text(title);

    if (!bIsFirstStep) {
      this._effect($title, "title", "show", "show");
    }
  },
  
  getStepData: function (step_id) {
    var data = {};
    
    data.current = this._step_history.length + 1;
    
    var step = 'string' === typeof step_id ? this.element.find(step_id) : step_id;
    
    var max_steps_left = this._search_tree(step, 0);
    data.total = data.current + max_steps_left;
    
    data.percent = Math.round( ( this._step_history.length / data.total) * 100) * 0.01;
    
    return data;
  },
  
  _search_tree: function (node, depth) {
    var max_depth = depth;
    var child_depth = depth + 1;
    
    var children = this._getChildren(node);
    for (var li=0; li<children.length; li++) {
      var temp = children[li];
      var my_depth = this._search_tree(temp, child_depth);
      if (my_depth > max_depth) {
        max_depth = my_depth;
      }
    }
    
    return max_depth;
  },
  
  _getChildren: function (node) {
    var that = this;
    var children = [];
    
    if (node.attr('next') === 'finish') {
      return children;
    }
    
    // TODO: refactor duplicated code
    var radio_next = node.find('input:radio')
    var next_attr = node.attr('next');
    
    if (radio_next.attr('next')) {
      // is the next step id in an attribute of a checked radio input?
      radio_next.each( function () {
        children.push(that.element.find('#' + $(this).attr('next')));
      });
    }
    else if (next_attr) {
      // is the next step id in an attribute of the current step?
      children.push(that.element.find('#' + next_attr));
    }
    else {
      // fallback to regular next step
      if (node.next().length > 0) {
        children.push(node.next());
      }
    }
    
    return children;
  },
  
  _updateCounter: function (nextStep) {
    var $counter = this.element.find(".jw-counter"),
        counterOptions = this.options.counter;

    if (nextStep.length === 0) {
      nextStep = this.element.find(".jw-step:first");
    }
    
    var step_data = nextStep.data('step_data');
    var percentage = Math.round( step_data.percent * 100 );
    if (counterOptions.type === "percentage") {
      counterText = ((percentage <= 100) ? percentage : 100) + "%";
    }
      
    if (counterOptions.progressbar) {
      this.element.find(".jw-counter-progressbar").progressbar("option", "value", percentage);
      this.element.find(".jw-counter-text").text(counterText);
    }
  },

  _buildSteps: function () {
    var $steps = this.element.children("div, fieldset");

    this._stepCount = $steps.length;
    var that = this;
    
    $steps.addClass("jw-step").each(function (x) {
      var $step = $(this);
    });

    if (this.options.validate) {
      $steps.bind("goingForward", function (event) {
        var $inputs = $(this).find(":input");

        if ($inputs.length > 0) {
          return Boolean($inputs.valid());
        }

        return true;
      });
    }

    $steps.hide().wrapAll(this._html("div", {
      "class": "jw-content ui-widget-content ui-helper-clearfix"
    }, this._html("div", {
      "class": "jw-steps-wrap"
    })));
  },
    
  options: {
    titleAttr: 'jwtitle',
    next: $.noop
  }
};