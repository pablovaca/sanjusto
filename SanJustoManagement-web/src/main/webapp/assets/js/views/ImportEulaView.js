/*global define*/
define([
	'jquery',
	'underscore',
	'backbone',	
	'text!templates/importEula-template.html',
	'text!templates/modal-template.html',
	'config',
    'services/StarMeUpServices'
], function ($, _, Backbone, ImportEulaTemplate, ModalTemplate, Config, smuServices) {
	'use strict';

	Config.setUp();
        
	var ImportEulaView = Backbone.View.extend({
		el : '#app',
		className : '',
		template : _.template(ImportEulaTemplate),		
		modalTemplate : _.template(ModalTemplate),		
		
		
		initialize : function(container) {
			this.$main = this.$('#' + container);			
		},
		
		render : function() {
		
			this.$main.html(this.template());
			
			this.$main.find('#innerfileupload').fileupload({
                autoUpload: true,
                acceptFileTypes: /(\.|\/)(txt)$/i
            }).on('fileuploadadd', _.bind(function (e, data) {
                if(data.files[0].size > 2048000) {
                    this.renderModal($.t('admin.importEula.onlyLowerThan'));
                    e.preventDefault();
                }
                else{
                    var resultRegex = data.files[0].name.match(/(\.|\/)(txt)$/i);
                    if(resultRegex != null){
                        smuServices.importEula(e, data);
                    }
                    else{
                        this.renderModal($.t('admin.importEula.invalidFile'));
                        e.preventDefault();
                    }
                }
            }, this)).on('fileuploadprocessalways', function (e, data) {

            }).on('fileuploadprogressall', function (e, data) {

            }).on('fileuploaddone', _.bind(function (e, data) {
                if(data.result != null && data.result.status === 'OK'){                	
                	this.renderModal($.t('admin.importEula.uploadSuccessfully'));
                }
                else
                {
                    this.renderModal(data.result.message);
                }
            }, this)).prop('disabled', !$.support.fileInput)
                .parent().addClass($.support.fileInput ? undefined : 'disabled');
			
			$(this.$main).i18n($.i18n.options);
			$(this.$fileUpload).i18n($.i18n.options);
		},

		renderModal : function (message){
				var $modal = this.$main.find('#importEulaModalContainer');
				$modal.html(message);
				var modalModel = {
	                    prefix : 'importEula'
	            };
	            $modal.html(this.modalTemplate({
	                model : modalModel
	            }));

	            $modal.find('#importEulaModalTitle').hide();
	            $modal.find('#importEulaModalAcceptButton').text($.t("admin.mainStarPage.accept")).attr('data-dismiss', 'modal');
	            $modal.find('#importEulaModalBody').html('<p>'+ message +'</p>');
	            $modal.find('#importEulaModal').modal('show');
		}
	});
	
	return ImportEulaView;
});
	