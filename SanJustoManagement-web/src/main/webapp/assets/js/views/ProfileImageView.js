/*global define*/
define([ 
	'jquery', 
	'underscore', 
	'backbone',
	'text!templates/profileImageModal-template.html',
	'text!templates/modal-template.html', 
	'config',
	'services/StarMeUpServices',
	'jquery.ui.widget',
	'jquery.fileupload',
	'jquery.fileupload-imaget',
	'jquery.fileupload-process',
	'jquery.fileupload-validate',
	'load-image',
	'load-image-exif',
	'load-image-exif-map',
	'load-image-ios',
	'load-image-meta',
	'load-image-orientation',
	'canvas-to-blob'
	], function($, _, Backbone, profileImageTemplate, modalTemplate, Config, smuServices) {
	'use strict';

	Config.setUp();

	var ProfileImageView = Backbone.View.extend({
		el : '#app',
		className : 'row',
		modalTemplate : _.template(modalTemplate),
		modalContentTemplate : _.template(profileImageTemplate),
		currentUser : {},
		firstTime : false,
		prefix : '',
		initialize : function(container, currentUser, firstTime, prefix) {
			this.$main = this.$('#' + container);
			this.currentUser = currentUser;
			this.firstTime = firstTime;
			this.prefix = prefix;
		},		
		render : function() {
			var modalModel = {
					prefix : this.prefix
				};
			this.$main.html(this.modalTemplate({
				model : modalModel
			}));
			
			//Fix scroll bar when modal is closed and prevent body sliding
			_.beautifyModal('#' + this.prefix + 'Modal');
			
			$('#' + this.prefix + 'Modal').on('show.bs.modal', _.bind(this.editProfileImage,this));

		},
		editProfileImage : function(){
			var modalModel ={
					selectedStar : this.selectedStar,
					domain : smuServices.getDomain()
			};
			
			//	$('#' + this.prefix + 'ModalTitle').text('Upload Your Profile Image');
			$('#' + this.prefix + 'ModalTitle').text($.t("translation:profile.uploadProfileImage"));
			

			
			if(this.firstTime)
			{
				$('#' + this.prefix + 'ModalAcceptButton').text('Skip');
			}
			else
			{
				$('#' + this.prefix + 'ModalAcceptButton').hide('hide');
			}
			
			$('#' + this.prefix + 'ModalBody').html(this.modalContentTemplate({
				model : modalModel
			}));
			
			if(this.currentUser != null){
				this.$main.find('#innerProfileImage').attr('src',smuServices.getProfileImage(this.currentUser.profileImageId));
			}
			
			// prevent double-click
			$('#' + this.prefix + 'ModalAcceptButton').on('click', _.debounce(_.bind(this.skipFirstTimeProfileImageSelection, this), 1000, true));
			
			var uploadButton = $('<button/>')
            .addClass('btn btn-default btn-save')
            .css('float', 'none')
            .prop('disabled', true)
            .text('Processing...')
            .on('click', function () {
                var $this = $(this);
                var data = $this.data('data');
                var event = $this.data('event');
                $this
                    .off('click')
                    .text($.t('profile.abort'))
                    .on('click', function () {
                        $this.remove();
                        data.abort();
                    });
                smuServices.insertImage(event, data);
                //.always(function () {
                	//$this.remove();
            //});
            });
			
			this.$main.find('#innerfileupload').fileupload({				
				autoUpload: false,
		        acceptFileTypes: /(\.|\/)(jpe?g|png)$/i,
		        
		        disableImageResize: /Android(?!.*Chrome)|Opera/
		        .test(window.navigator && navigator.userAgent),
		        imageMaxWidth: 200,
		        imageMaxHeight: 200,
		        imageCrop: true // Force cropped images
		    }).on('fileuploadadd', _.bind(function (e, data) {
		    	this.$main.find('#files').html('');		        
		    	data.context = $('<div/>').appendTo(this.$main.find('#files'));
		        $.each(data.files, function (index, file) {
		            var node = $('<p/>')
		                    .append($('<span/>').text(file.name));
		            if (!index) {
		                node
		                    .append('<br>')
		                    .append(uploadButton.clone(true).data('data',data).data('event',e));
		            }
		            node.appendTo(data.context);
		        });		        
		    }, this)).on('fileuploadprocessalways', function (e, data) {
		        var index = data.index,
		            file = data.files[index],
		            node = $(data.context.children()[index]);
		        if (file.preview) {
		            node
		                .prepend('<br>')
		                .prepend(file.preview);
		        }
		        if (file.error) {
		            node
		                .append('<br>')
		                .append($('<span class="text-danger"/>').text($.t("profile.errorMsg")));
		        }
		        if (index + 1 === data.files.length) {
		            data.context.find('button')
		                .text($.t('profile.upload'))
		                .prop('disabled', !!data.files.error);
		        }
		    }).on('fileuploadprogressall', function (e, data) {		    	
		        var progress = parseInt(data.loaded / data.total * 100, 10);		        
		        $('#progress').show();		        
		        $('#progress .progress-bar').css(
		            'width',
		            progress + '%'		            
		        );
		    }).on('fileuploaddone', _.bind(function (e, data) {
		        if(data.textStatus == 'success' && data.result != null && data.result.status == 'OK' && this.currentUser != null){
	        		this.currentUser.profileImageId = data.result.result;
	        		smuServices.setUserProfileImage(_.bind(this.setProfileImage,this), this.currentUser.id, data.result.result);
	        	}
		        else
		        {
		        	data.context.find('button').remove();
		        	$('#progress').hide();	
		        	var error = $('<span class="text-danger"/>').text(data.result.message);
		            $(data.context.children()[0])
		                .append('<br>')
		                .append(error);
		        }
		    }, this)).on('fileuploadfail', function (e, data) {
		        $.each(data.files, function (index) {
		        	$('#generalErrorModal').modal('show');
		        	/*var error = $('<span class="text-danger"/>').text('File upload failed.');
		            $(data.context.children()[index])
		                .append('<br>')
		                .append(error);*/
		        });
		    }).prop('disabled', !$.support.fileInput)
		        .parent().addClass($.support.fileInput ? undefined : 'disabled');
			this.$main.i18n($.i18n.options);
		},
		skipFirstTimeProfileImageSelection : function(){
			if(this.firstTime)
			{
				smuServices.setUserProfileImage(_.bind(function(result, status, message){
					if(status == 'OK' && this.currentUser != null){
						this.currentUser.profileImageId = -1;
						$('#' + this.prefix + 'Modal').modal('hide');
						$('#' + this.prefix + 'ModalBody').html('');
		            	this.trigger("profileImageEvent"); 
					}
				},this), this.currentUser.id, '-1');
			}
		},
        setProfileImage: function(result, status, message){
            if(status == 'OK' && this.currentUser != null){
            	$('#' + this.prefix + 'Modal').modal('hide');
            	$('#' + this.prefix + 'ModalBody').html('');
            	this.trigger("profileImageEvent", this.currentUser.profileImageId); 
            } else if (message=="NO_RIGHTS") {
				Backbone.trigger('NO_RIGHTS');
			} else {
				console.log(message);
			}
        }
		
	});

	return ProfileImageView;
});
	