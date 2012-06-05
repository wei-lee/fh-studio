var UIInputTag = UITag.extend({
	
	init: function(opts){
		this._super(opts);
		if('undefined' === typeof this.inputtype){
		    this.inputtype = 'text';
		}
	},
	
	load: function(container){
	    switch (this.inputtype) {
	    	case 'dropdown':
	    	  this.constructDropdown(container);
	    	  break;
	    	default:
	    	  this.constructInput(container);
	    	  break;
	    }
	},
	
	constructInput: function(container){
	    //IE doesn't allow creating an input element and change its type, need to put the type into the html string
	    var input_id = this.id + "_content";
        var html_str = '<input id="'+input_id+'" type="'+this.inputtype+'" ';
        if(this.inputtype === 'checkbox' && this.defaultvalue == true){
            html_str += 'checked="yes" '
        } else if(this.defaultvalue && typeof this.defaultvalue === 'string'){
            html_str += 'value="'+this.manager.getLang(this.defaultvalue)+'"'
        }
        html_str += ' />'; 
        var input_obj = $(html_str);
        this.constructObject(input_obj, container);
	},
	
	constructDropdown: function(container){
	    var input_id = this.id + "_content";
	    var select_obj = $('<select>', {id: input_id});
	    if(this.options && this.values && $.isArray(this.options) && $.isArray(this.values) && this.values.length == this.options.length){
	        for(var i =0 ;i < this.options.length; i++){
	            this.constructOption(this.options[i], this.values[i], select_obj);
	        };
	    };
	    this.constructObject(select_obj, container);
	},
	
	getData: function(){
	  var contentObj = this.dom_object.find('#' + this.id + '_content');
	  if(contentObj.attr('type') != 'checkbox'){
	      return contentObj.val();
	  } else {
	      if(contentObj.attr('checked')){
	          return true;
	      } else {
	          return false;
	      }
	  }
	},
	
	setData: function(data){
	    var contentObj = this.dom_object.find('#' + this.id + '_content');
	    if(contentObj.attr('type') != 'checkbox'){
          contentObj.val(data);
        } else {
          if(data == true){
              contentObj.attr('checked', true);
          } else {
              contentObj.removeAttr('checked');
          }
        }
	},
	
	constructOption: function(o_text, o_val, select_obj){
	    var option_html = '<option value="' + o_val + '" ';
	    if(o_val == this.defaultvalue){
	        option_html += 'selected="selected"';
	    }
	    option_html += ' >' + this.manager.getLang(o_text) + '</option>';
	    var option_obj = $(option_html);
	    select_obj.append(option_obj);
	},
	
    constructObject: function(content, container){
        var parent_div = this.constructParentDiv();
        var label_obj = null;
        if(this.label){
           label_obj = this.constructLabel();
        }
        if(null != label_obj){
            parent_div.append(label_obj);
        }
        parent_div.append(content);
        container.append(parent_div);
        if(null != label_obj){
            this.setTooltip(label_obj);
        } else {
            this.setTooltip(content);
        }
        this.dom_object = parent_div;
    },
	
	constructParentDiv: function(){
	    var div_attrs = {};
        div_attrs.id = this.id;
        if(this.classes){
            div_attrs['class'] = this.classes;
        }
        var divObj = $('<div>', div_attrs);
        return divObj;
	},
	
	constructLabel: function(){
	    return $('<label>', {id: this.id + "_label", 'for': this.id + "_content", text: this.manager.getLang(this.label)});
	},
	
	setTooltip: function(ele){
	    if(this.tooltip && typeof this.tooltip === 'string'){
	        ele.qtip({
              content: {
                text: this.manager.getLang(this.tooltip),
                prerender: this.manager.doTooltipPrerender() 
              },
              show: 'mouseover',
              hide: 'mouseout'
            });
	    }
	}
})