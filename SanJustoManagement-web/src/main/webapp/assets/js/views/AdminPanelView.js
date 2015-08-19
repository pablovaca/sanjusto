/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/adminPanel-template.html',
    'text!templates/modal-template.html',
    'text!templates/modal-warning-template.html',
    'config',
    'services/StarMeUpServices',
    'views/EditStarView',   
    'views/PeriodStarView',
    'views/ImportUsersView',
    'views/ImportEulaView',
    'bootstrap-switch'
], function ($, _, Backbone, adminPanelTemplate, ModalTemplate, ModalBodyTemplate, Config, smuServices, EditStarView, PeriodStarView, ImportUsersView, ImportEulaView) {
    'use strict';

    Config.setUp();

    var AdminPanelView = Backbone.View.extend({
        el : '#app',
        className : '',
        template : _.template(adminPanelTemplate),
        modalTemplate : _.template(ModalTemplate),
        modalBodyTemaplate : _.template(ModalBodyTemplate),
        container : '',
        starView : {},
        periodStarView : {},
        importUsersView : {},
        importEulaView : {},
        maxStarToGive : 0,
        privateModeEnabled : false,
        emailSettings : true,
        organizationId : null,
        webOnEnabled : true,
        messageWebOffEnabled : false,
        eulaState : false,

        initialize : function(container, maxStarToGive, organizationId, privateModeEnabled, emailSettings) {            
            this.$main = this.$('#' + container);
            this.container = container;
            this.maxStarToGive = maxStarToGive;
            this.organizationId = organizationId;
            this.privateModeEnabled = privateModeEnabled;
            this.emailSettings = emailSettings;
            this.webOnEnabled = smuServices.getAdditionalInfo().organization.webOn;
            this.messageWebOffEnabled = smuServices.getAdditionalInfo().organization.messageWebOffEnabled;
            this.eulaState = smuServices.getAdditionalInfo().organization.eulaEnabled;
            this.render();            
        },

        render : function() {
            this.$main.html(this.template());
            this.renderPeriodStarView();
            this.renderEditStarView();
            this.renderImportUsersView();
            this.renderImportEulaView();
            $.fn.bootstrapSwitch.defaults.size = 'mini';
            $("[name='disableEmailSettings-checkbox']").bootstrapSwitch('state', this.emailSettings, true);
            $("[name='privateMode-checkbox']").bootstrapSwitch('state', this.privateModeEnabled, true);
            $("[name='webOn-checkbox']").bootstrapSwitch('state', this.webOnEnabled, true);
            $("[name='messageWebOff-checkbox']").bootstrapSwitch('state', this.messageWebOffEnabled, true);
            $("[name='enabledEulaSettings-checkbox']").bootstrapSwitch('state', this.eulaState, true);
            $("[name='privateMode-checkbox']").on('switchChange.bootstrapSwitch', _.bind( this.switchPrivateMode ,this));
            $("[name='disableEmailSettings-checkbox']").on('switchChange.bootstrapSwitch', _.bind( this.switchEmailSettings ,this));
            $("[name='webOn-checkbox']").on('switchChange.bootstrapSwitch', _.bind( this.switchWebOn ,this));
            $("[name='messageWebOff-checkbox']").on('switchChange.bootstrapSwitch', _.bind( this.switchMessageWebOff ,this));
            $("[name='enabledEulaSettings-checkbox']").on('switchChange.bootstrapSwitch', _.bind( this.switchEula ,this));
            $("#privatemodeModal").on('hidden.bs.modal', _.bind(this.privateModeChange, this));
            
            $(this.$main).i18n($.i18n.options);
            $('.js-question').on('click', _.bind(function(){
                $('#question').show();
            }));
            $('#closeAlert').on('click', _.bind(function(){
                $('#question').hide();
            }))
        },

        renderPeriodStarView : function(){
            this.periodStarView = new PeriodStarView('periodStar', this.maxStarToGive);
            this.periodStarView.on('changeMaxStarToGive', _.bind(this.loadMaxStar, this));
        },

        renderEditStarView : function(){
            this.starView = new EditStarView('editStarView');
            this.starView.on('starEditEvent', _.bind(this.render,this));
            this.starView.render();
        },

        renderImportUsersView : function(){
            this.importUsersView = new ImportUsersView('importUsers','importUsersFileUpload');
            this.importUsersView.render();
        },

        renderImportEulaView : function(){
            this.importEulaView = new ImportEulaView('importEulaFileUpload');
            this.importEulaView.render();
        },

        loadMaxStar : function(){
           this.trigger('changeMaxStarToGive');
        },

        privateModeChange : function(){
            this.trigger('privateMode');
        },

        switchPrivateMode : function(event, state){
            $("[name='privateMode-checkbox']").bootstrapSwitch('state',state, true);
            if(state){
                smuServices.privateMode(_.bind(this.changePrivateMode, this), state);
            }
            else{
                smuServices.privateMode(_.bind(this.changePrivateMode, this), state);
            }
        },

        switchWebOn : function(event, state){
            smuServices.webOn(_.bind(function(result,status,message){
                if(status == 'OK'){
                    console.log(result);
                    $("[name='webOn-checkbox']").bootstrapSwitch('state',state, true);
                } else if (message=="NO_RIGHTS") {
                    Backbone.trigger('NO_RIGHTS');
                } else {
                    console.log(message);
                }
            }, this), state);
        },

        switchEula : function(event, state){
            smuServices.setEulaEnabled(_.bind(function(result,status,message){
                if(status == 'OK'){
                    console.log(result);
                    $("[name='webOn-checkbox']").bootstrapSwitch('state',state, true);
                } else if (message=="NO_RIGHTS") {
                    Backbone.trigger('NO_RIGHTS');
                } else {
                    console.log(message);
                }
            }, this), state);
        },        

        switchMessageWebOff : function(event, state){
            smuServices.messageWebOn(_.bind(function(result,status,message){
                if(status == 'OK'){
                    console.log(result);
                    $("[name='messageWebOff-checkbox']").bootstrapSwitch('state',state, true);
                } else if (message=="NO_RIGHTS") {
                    Backbone.trigger('NO_RIGHTS');
                } else {
                    console.log(message);
                }
            }, this), state);
        },

        switchEmailSettings : function (event, state){
            var val = 1;
            if(!state)
                val = 0;
            smuServices.setOrganizationEmailSettings(_.bind(function(result,status,message){
                if(status == 'OK'){
                    $("[name='disableEmailSettings-checkbox']").bootstrapSwitch('state',state, true);
                } else if (message=="NO_RIGHTS") {
                    Backbone.trigger('NO_RIGHTS');
                } else {
                console.log(message);
                }
            }, this), val);
        },

        changePrivateMode : function (result,status,message){
            if(status == 'OK'){
                var mode = "Disabled";
                if(result.privateModeEnabled){
                    mode = "Enabled";
                }
                this.renderModal("Private Mode is " + mode);
            } else if (message=="NO_RIGHTS") {
                Backbone.trigger('NO_RIGHTS');
            } else {
            console.log(message);
            }
        },

        renderModal : function (message){
            var $modal = $('#privatemodeModal');
            $modal.html(message);
            var modalModel = {
                    prefix : 'privateMode'
            };
            $modal.html(this.modalTemplate({
                model : modalModel
            }));

            $modal.find('#privateModeModalTitle').hide();
            $modal.find('#privateModeModalAcceptButton').text($.t("admin.mainStarPage.accept")).attr('data-dismiss', 'modal');
            $modal.find('#privateModeModalBody').html(this.modalBodyTemaplate());
            $modal.find('#privateModeModal').modal('show');
        }
    });

    return AdminPanelView;
});
