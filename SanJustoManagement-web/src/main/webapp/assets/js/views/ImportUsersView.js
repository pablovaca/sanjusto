/*global define*/
define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/importUsers-template.html',
	'text!templates/importUsersFileUpload-template.html',
	'text!templates/modal-template.html',
    "text!templates/pager-template.html",
	'config',
    'services/StarMeUpServices'
], function ($, _, Backbone, ImportUsersTemplate, ImportUsersFileUploadTemplate, ModalTemplate, PagerTemplate, Config, smuServices) {
	'use strict';

	Config.setUp();
        
	var ImportUsersView = Backbone.View.extend({
		el : '#app',
		className : '',
		template : _.template(ImportUsersTemplate),
		uploadTemplate : _.template(ImportUsersFileUploadTemplate),
		modalTemplate : _.template(ModalTemplate),
		pagerTemplate : _.template(PagerTemplate),
		files : {},
		currentPage : 0,
		recordsPerPage : 10,
		totalPages : 0,
		
		
		initialize : function(container, uploadContainer) {
			this.$main = this.$('#' + container);
			this.$fileUpload = this.$('#' + uploadContainer);
			this.renderFiles(0);
		},
		
		render : function() {		
		
			this.$fileUpload.html(this.uploadTemplate());
			
			this.$fileUpload.find('#innerfileupload').fileupload({
                autoUpload: true,
                acceptFileTypes: /(\.|\/)(csv)$/i
            }).on('fileuploadadd', _.bind(function (e, data) {
                if(data.files[0].size > 2048000) {
                    this.renderModal($.t('admin.importUsers.onlyLowerThan'));
                    e.preventDefault();
                }
                else{
                    var resultRegex = data.files[0].name.match(/(\.|\/)(csv)$/i);
                    if(resultRegex != null){
                        smuServices.uploadUsersFile(e, data);
                    }
                    else{
                        this.renderModal($.t('admin.importUsers.invalidFile'));
                        e.preventDefault();
                    }
                }
            }, this)).on('fileuploadprocessalways', function (e, data) {

            }).on('fileuploadprogressall', function (e, data) {

            }).on('fileuploaddone', _.bind(function (e, data) {
                if(data.result != null && data.result.status === 'OK'){
                	this.renderFiles(0);
                	this.renderModal($.t('admin.importUsers.uploadSuccessfully'));
                }
                else
                {
                    this.renderModal(data.result.message);
                }
            }, this)).on('fileuploadfail', _.bind(function (e, data) {
                    this.$fileUpload.find('#importResult').html('');
                    $('#generalErrorModal').modal('show');
            }, this))
            .prop('disabled', !$.support.fileInput)
                .parent().addClass($.support.fileInput ? undefined : 'disabled');
			
			$(this.$main).i18n($.i18n.options);
			$(this.$fileUpload).i18n($.i18n.options);
		},
				
		renderFiles : function(page){
			if(!page && page == null){
                var page = 0;
            }
			
			smuServices.getUsersFiles(_.bind(
				function(result, status, message){
					if(status === 'OK'){
						this.files = result.usersFileList;
						this.totalRecords = result.total;
                        this.totalPages = Math.ceil(this.totalRecords/this.recordsPerPage);
						this.callBackRenderFiles();
					}
					else if (message==="NO_RIGHTS") {
						 Backbone.trigger('NO_RIGHTS');
		            } else {
		            	 console.log(message);
		            }
				},this),page,this.recordsPerPage);
		},

		callBackRenderFiles : function(){
			
			var lastResult = 0;
            if(this.currentPage > 0){
                lastResult = this.recordsPerPage*this.currentPage;
            }
			
			var filesModel = {
					files : this.files,
					lastResult : lastResult
			};
			
			this.$main.html(this.template({
                model : filesModel
            }));
			
			this.$main.find('.js-result').on('click',_.bind(function(event){
				event.preventDefault();
				
				var fileId = $(event.target).data('id');
				
				var resultText = '';
				
				_.each(this.files, function(item, index){
					if(item.id == fileId){
						resultText = item.userUploadSummary;
						return;
					}
				}, this);
				
				if(resultText != null){
					this.renderModal(resultText);
				}
				
			},this));
			
			this.$pagerContainerTop = this.$main.find('#pager-top');
            this.$pagerContainerBottom = this.$main.find('#pager-bottom');
			
            this.renderPager(this.$pagerContainerTop);
            this.renderPager(this.$pagerContainerBottom);
            
			$(this.$main).i18n($.i18n.options);
		},
		
		renderPager : function (container){
            var lowerLimit = this.currentPage;
            var upperLimit = this.currentPage;

            while(upperLimit - lowerLimit + 1 < 5){
                if(lowerLimit > 0 && (lowerLimit > this.currentPage-2 || this.totalPages - lowerLimit < 5)){
                    lowerLimit--;
                } else {
                    upperLimit ++;
                }
            }
            if(upperLimit > this.totalPages-1){
                upperLimit = this.totalPages-1;
            }

            var model = {
                lowerLimit : lowerLimit,
                upperLimit : upperLimit,
                totalPages : this.totalPages,
                currentPage : this.currentPage
            };

            container.html(this.pagerTemplate({
                model : model
            }));
            container.find('#page-'+(this.currentPage+1)).addClass('active');

            container.find('#firts-page').removeClass('disabled');
            container.find('#firts-page a').removeClass('disabled');
            container.find('#firts-page a span').removeClass('disabled');
            container.find('#previous-page').removeClass('disabled');
            container.find('#previous-page a').removeClass('disabled');
            container.find('#previous-page a span').removeClass('disabled');
            container.find('#last-page').removeClass('disabled');
            container.find('#last-page a').removeClass('disabled');
            container.find('#last-page a span').removeClass('disabled');
            container.find('#next-page').removeClass('disabled');
            container.find('#next-page a').removeClass('disabled');
            container.find('#next-page a span').removeClass('disabled');

            if(this.currentPage == 0){
                container.find('#firts-page').addClass('disabled');
                container.find('#firts-page a').addClass('disabled');
                container.find('#firts-page a span').addClass('disabled');
                container.find('#previous-page').addClass('disabled');
                container.find('#previous-page a').addClass('disabled');
                container.find('#previous-page a span').addClass('disabled');
            }
            if(this.currentPage == this.totalPages-1){
                container.find('#last-page').addClass('disabled');
                container.find('#last-page a').addClass('disabled');
                container.find('#last-page a span').addClass('disabled');
                container.find('#next-page').addClass('disabled');
                container.find('#next-page a').addClass('disabled');
                container.find('#next-page a span').addClass('disabled');

            }
            container.find('.js-page').on('click', _.bind(this.pageNavigation, this));
            container.find('.js-navigate').on('click', _.bind(this.pageNavigation, this));
        },
		
        pageNavigation : function (event){
            event.preventDefault();
            var pageSelected = $(event.target).data('id');

            if(pageSelected == null){
                pageSelected = $(event.target).parent().data('id');
            }
            var e = null;

            if(pageSelected == 'first'){
                this.currentPage = 0;
            }
            if(pageSelected == 'last'){
                this.currentPage = this.totalPages-1;
            }
            if(pageSelected == 'previous' && this.currentPage > 0){
                this.currentPage--;
            }
            if(pageSelected == 'next' && this.currentPage < this.totalPages-1){
                this.currentPage++;
            }
            if(pageSelected >= 0) {
                this.currentPage = pageSelected;
            }


            this.renderFiles(this.currentPage);
        },
        
		renderModal : function (message){
				var $modal = this.$fileUpload.find('#importUsersModalContainer');
				$modal.html(message);
				var modalModel = {
	                    prefix : 'importUsers'
	            };
	            $modal.html(this.modalTemplate({
	                model : modalModel
	            }));

	            $modal.find('#importUsersModalTitle').hide();
	            $modal.find('#importUsersModalAcceptButton').text($.t("admin.mainStarPage.accept")).attr('data-dismiss', 'modal');
	            $modal.find('#importUsersModalBody').html('<p>'+ message +'</p>');
	            $modal.find('#importUsersModal').modal('show');
		}
	});
	
	return ImportUsersView;
});
	