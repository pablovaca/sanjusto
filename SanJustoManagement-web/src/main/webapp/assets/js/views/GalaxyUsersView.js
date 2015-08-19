/*global define*/
define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/galaxy-template.html',
	'collections/customer-user-collection',
	'config',	
    'services/StarMeUpServices'
], function ($, _, Backbone, GalaxyTemplate, CustomerUserCollection, Config, smuServices) {
	'use strict';

	Config.setUp();
        
	var GalaxyUsersView = Backbone.View.extend({
		el : '#app',
		className : '',
		template : _.template(GalaxyTemplate),
		container : {},
		usersCollection : {},
		
		initialize : function(container) {			
			this.$main = this.$('#' + container);		    
		    this.container = container;		    	    
		    this.usersCollection = new CustomerUserCollection();
		    this.listenTo(this.usersCollection,'ready', this.render);
		    this.$main.html('');
		},
		
		render : function() {
			
			var model = {
				users : this.usersCollection.toJSON()
			};							
			
			this.$main.html(this.template({
				model : model
			}));

			this.$main.find('.js-users').on('click', _.bind(this.selectedUser, this));
			this.$main.i18n($.i18n.options);			
		},

		selectedUser : function(event){			
            var selectedUser = {};
            var selectedId = $(event.target).data('id');
            if(selectedId == null){
                selectedId = $(event.target).parent().data('id');
            }

            var receivers = this.usersCollection.toJSON();

            _.each(receivers,function(element,index){
                if(element.id == selectedId){
                    selectedUser = element;
                }
            });
            this.trigger('userSelection', selectedUser);
        }
	});
	
	return GalaxyUsersView;
});
	