/*globant define*/
define([ 
        'jquery',
        'underscore',
        'backbone',
        'text!templates/adminPanel-star-template.html',
        'views/EditStarEnableView',
        'views/EditStarDisableView',
        'config',
        'text!templates/editStarModal-template.html',
        'services/StarMeUpServices',
        'text!templates/adminModal-template.html',
        'collections/star-collection',
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
],

function ($, _, Backbone, adminPanelStarTemplate, EditStarEnableView, EditStarDisableView, Config, editStarModalTemplate, smuServices, modalTemplate, StarsCollection) {

    'use strict';

    Config.setUp();
    var AdminPanelStarView = Backbone.View.extend({
        el : '#app',
        className : '',
        template : _.template(adminPanelStarTemplate),
        modalTemplate : _.template(modalTemplate),
        modalContentTemplate : _.template(editStarModalTemplate),
        container : '',
        editStarEnableView : {},
        editStarDisableView : {},
        prefix : 'editStar',
        starsCollection : {},
        selectedStar : {},

        initialize : function(container) {
            this.$main = this.$('#' + container);
            this.container = container;
            this.starsCollection = new StarsCollection();

            this.listenTo(this.starsCollection, 'ready', this.render);
        },

        events : {
            'show.bs.modal #editStarModal': 'editStar'
        },

        render : function() {
            if (!(this.starsCollection.isReady)) {
                return;
            }
            var model = {
                };
                this.$main.html(this.template({
                    model : model
                }));

                var modalModel = {
                        prefix : this.prefix
                    };
                this.$main.append(this.modalTemplate({
                    model : modalModel
                }));

                //this.$main.find('#exportStarsToCsv').on('click',_.bind(this.exportStarsToCsv,this));
                this.$main.find('#editStarModalAcceptButton').on('click', _.debounce(_.bind(this.saveChanges, this), 1000, true));
                this.renderEditStarEnableView();
                this.renderEditStarDisableView();
                this.$main.i18n($.i18n.options);
        },

        exportStarsToCsv : function(event){
            event.preventDefault();
            smuServices.starsreport('','');
        },

        editStar : function(event){
                this.$main.find('#editStarModalErrorMessage').hide();

                if(event.relatedTarget == null){
                    return;
                }


                var id = $(event.relatedTarget).data('id');

                var modalTitle = $.t("translation:admin.createStarPopUp.editStar");

                if(id <= 0)
                {
                    this.selectedStar = {};
                    this.selectedStar.id = 0;
                    this.selectedStar.imageId = 0;
                    this.selectedStar.imageUrl = smuServices.getStarImage(2);
                    this.selectedStar.enabled = true;
                    modalTitle = $.t("translation:admin.createStarPopUp.newStar");

                    if(id <= -1){
                        this.selectedStar.enabled = false;
                    }
                }
                else
                {
                    _.each(this.starsCollection.toJSON(),function(element,index){
                        if(element.id == id){
                            this.selectedStar = element;
                            }
                    }, this);
                }

                var modalModel ={
                        selectedStar : this.selectedStar
                };
                
                //prevent scroll hide
                _.beautifyModal('#editStarModal');

                this.$main.find('#editStarModalTitle').text(modalTitle);
                this.$main.find('#editStarModalBody').html(this.modalContentTemplate({
                    model : modalModel
                }));


                ////upload buttom
                var uploadButton = $('<button/>')
                .addClass('btn btn-primary')
                .prop('disabled', true)
                .text('Processing...')
                .on('click', function () {
                    var $this = $(this);
                    var data = $this.data('data');
                    var event = $this.data('event');
                    $this
                        .off('click')
                        .text('Abort')
                        .on('click', function () {
                            $this.remove();
                            data.abort();
                        });
                    smuServices.insertImage(event, data);
                });

                $('#innerfileupload').fileupload({
                    autoUpload: false,
                    acceptFileTypes: /(\.|\/)(jpe?g|png)$/i,

                    disableImageResize: /Android(?!.*Chrome)|Opera/
                        .test(window.navigator && navigator.userAgent),
                    imageMaxWidth: 200,
                    imageMaxHeight: 200,
                    previewMaxHeight: 126,
                    previewMaxWidth: 126,
                    previewMinHeight: 126,
                    previewMinWidth: 126,
                    imageCrop: true,
                    previewCrop: true
                }).on('fileuploadadd', function (e, data) {
                    $('#files').html('');
                    data.context = $('#files');
                    $.each(data.files, function (index, file) {
                        var node = $('<div/>').addClass("img-circle");
                        $('#files').data('data',data).data('event',e);
                        node.appendTo(data.context);
                    });

                }).on('fileuploadprocessalways', function (e, data) {
                    var index = data.index,
                        file = data.files[index],
                        node = $(data.context.children()[index]);
                    if (file.preview) {
                        console.log(file.preview);
                        node
                            .prepend(file.preview);
                    }
                    if (file.error) {
                        node
                            .append('<br>')
                            .append($('<span class="text-danger"/>').text(file.error));
                    }
                    if (index + 1 === data.files.length) {
                        data.context.find('button')
                            .text('Upload')
                            .prop('disabled', !!data.files.error);
                    }

                }).on('fileuploadprogressall', function (e, data) {
                    var progress = parseInt(data.loaded / data.total * 100, 1);
                    $('#progress').show();
                    $('#progress .progress-bar').css(
                        'width',
                        progress + '%'
                    );

                }).on('fileuploaddone', _.bind(function (e, data) {
                    if(data.textStatus == 'success' && data.result != null && data.result.status == 'OK' && this.selectedStar != null){
                        this.selectedStar.imageId = data.result.result;
                        this.starImageSaved(data.result.result);
                        $('#progress').hide();
                    }
                    else
                    {
                        $('#generalErrorModal').modal('show');
                    }
                }, this)).on('fileuploadfail', function (e, data) {
                    $.each(data.files, function (index) {
                        $('#generalErrorModal').modal('show');
                    });

                }).prop('disabled', !$.support.fileInput)
                    .parent().addClass($.support.fileInput ? undefined : 'disabled');

                this.$main.i18n($.i18n.options);
         },

         saveChanges : function(){
             if($('#starName').val() == null || $('#starName').val() == ''){
                    this.showErrorMessage('You have to add a name.');
                    return;
             }

             if($('#starDescription').val() == null || $('#starDescription').val() == ''){
                    this.showErrorMessage('You have to add a description.');
                    return;
             }

             if(this.selectedStar.id == 0 && $('#files').data('data') == null)
             {
                 this.starImageSaved(2);
             }
             else if(this.selectedStar.id > 0 && $('#files').data('data') == null)
             {
                 this.starImageSaved(this.selectedStar.imageId);
             }
             else
             {
                 var data = $('#files').data('data');
                 var event = $('#files').data('event');
                 smuServices.insertImage(event, data);
             }
         },

         showErrorMessage : function(message){
            this.$main.find('#editStarModalErrorMessage').show();
            this.$main.find('#editStarModalErrorMessage').text(message);
         },

         starImageSaved: function(imageId){
            smuServices.setOrganizationValues(_.bind(this.starEdited, this), this.selectedStar.id,
                    this.selectedStar.enabled, $('#starName').val(), $('#starDescription').val(), imageId);
         },

         starEdited : function(result, status, message){
                if (status == "OK") {
                    this.$main.find('#editStarModal').modal('hide');
                    this.trigger("starEditEvent");
                } else if (message=="NO_RIGHTS") {
                    Backbone.trigger('NO_RIGHTS');
                } else {
                    console.log(message);
                }
            },

        renderEditStarEnableView : function(){
            this.editStarEnableView = new EditStarEnableView('enableStarView');
            this.listenTo(this.editStarEnableView,"starEnableDisabled",_.bind(this.starEnableDisable, this));
        },

        renderEditStarDisableView : function(){
            this.editStarDisableView = new EditStarDisableView('disableStarView');
            this.listenTo(this.editStarDisableView,"starEnableDisabled",_.bind(this.starEnableDisable, this));
        },

        starEnableDisable : function() {
            this.trigger("starEditEvent");
        }
    });

    return AdminPanelStarView;

});