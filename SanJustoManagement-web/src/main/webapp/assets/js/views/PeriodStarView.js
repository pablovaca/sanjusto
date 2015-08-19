/*global define*/
define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/periodStar-template.html',
	'text!templates/periodStar-item-ro-template.html',
	'text!templates/periodStar-item-rw-template.html',
	'text!templates/modal-template.html',
	'config',
	'collections/periodStar-collection',
    'services/StarMeUpServices'
], function ($, _, Backbone, PeriodStarTemplate,PeriodStarReadOnlyTemplate, PeriodStarReadWriteTemplate, ModalTemplate,Config, PeriodStarCollection, smuServices) {
	'use strict';

	Config.setUp();
        
	var PeriodStarView = Backbone.View.extend({
		el : '#app',
		className : '',
		template : _.template(PeriodStarTemplate),
		modalTemplate : _.template(ModalTemplate),
		periodStarCollection : {},
		selectedPeriod : {},
		maxStarToGive : 0,
		container : {},

		
		initialize : function(container, maxStarToGive) {
			this.$main = this.$('#' + container);
		    this.maxStarToGive = maxStarToGive;
		    this.container = container;
			this.render();
		},
		
		render : function() {		
		
            if(this.maxStarToGive == null && this.maxStarToGive < 0){
                return;
            }
			var model = {
				//periodStar : this.periodStarCollection.toJSON()
			};		

			//var startDate = new Date(this.periodStar.startDatePeriod);						
			
			this.$main.html(this.template({
				model : model
			}));
			
			this.selectedPeriod = {
					id: null,		           		            
		            startDatePeriod: new Date(),
		            startDateToShow: null,
		            periodValue: 1,
		            periodUnit: "MONTH"					
			};

			this.$main.find('#maxStar').val(this.maxStarToGive);
			this.$main.find('.js-saveMax').on('click',_.bind(this.savePeriod, this));
			this.$main.i18n($.i18n.options);
		},
		
		savePeriod : function(){
			var maxStar = $('#maxStar').val();
			var periodUnit = $('#periodUnit').text();
			var periodValue = $('#duration').val();			
			
			if(maxStar != null && maxStar != '' && maxStar > 0){
			    if(maxStar != this.maxStarToGive){
			        smuServices.setMaxStarsToGive(_.bind(this.changeMaxStarToGive, this), maxStar);
			    }
			} else {
				this.renderModal($.t("translation:admin.mainStarPage.maxStarsCantBeZero"));
				this.$main.find('#maxStar').val(this.maxStarToGive);
			}
		},
		
		changeMaxStarToGive : function (result,status,message){
			if(status == 'OK'){
				this.trigger('changeMaxStarToGive');
				this.initialize(this.container, $('#maxStar').val());
				this.renderModal($.t("admin.mainStarPage.maxStarsChanged"));
			} else if (message=="NO_RIGHTS") {
				Backbone.trigger('NO_RIGHTS');				
			} else {
			console.log(message);
			}
		},

		renderModal : function (message){
				var $modal = $('#maxStarModal');
				$modal.html(message);
				var modalModel = {
	                    prefix : 'maxStarChange'
	            };
	            $modal.html(this.modalTemplate({
	                model : modalModel
	            }));

	            $modal.find('#maxStarChangeModalTitle').hide();
	            $modal.find('#maxStarChangeModalAcceptButton').text($.t("admin.mainStarPage.accept")).attr('data-dismiss', 'modal');
	            $modal.find('#maxStarChangeModalBody').html('<p>'+ message +'</p>');
	            $modal.find('#maxStarChangeModal').modal('show');
			}
	});
	
	return PeriodStarView;
});
	