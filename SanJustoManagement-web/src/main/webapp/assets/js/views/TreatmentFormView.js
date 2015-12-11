/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/treatment-form-template.html',
    'text!templates/searchCustomers-template.html',
    'collections/users-collection',
    'collections/types-collection',
    'collections/treatments-collection',
    'config',
    'services/APIServices',
    'typeahead'
], function ($, _, Backbone, newTreatmentTemplate, searchTemplate, UsersCollection, TypesCollection, TreatmentCollection, Config, api) {
    'use strict';

    Config.setUp();

    var TreatmentFormView = Backbone.View.extend({
        el : '#app',
        className : 'row',
        template : _.template(newTreatmentTemplate),
        searchTemplate : _.template(searchTemplate),
        container : 'centerPanel',
        typeAheadCustomersCallback: {},
        employeesCollection: {},
        typesCollection: {},
        formData: {},
        localTreatmentView: {},
        treatmentCollection: {},
        action:{},

        initialize : function(action, treatmentId, treatmentView) {
            this.localTreatmentView = treatmentView;
            this.$main = this.$('#' + this.container);
            this.employeesCollection = new UsersCollection();
            this.listenTo(this.employeesCollection, 'ready', this.render);
            this.typesCollection = new TypesCollection();
            this.typesCollection.getTypes('MOTIVES');
            this.listenTo(this.typesCollection, 'ready', this.render);
            this.action = action;
            if (treatmentId && treatmentId > 0 && 'edit'===action) {
                this.treatmentCollection = new TreatmentCollection();
                this.treatmentCollection.getTreatment(treatmentId);
                this.listenTo(this.treatmentCollection, 'ready', this.render);
            }
        },

        events : {
            "typeahead:selected #customerSearch": "searchListenerCustomer",
            "click .js-save-treatment" : "saveTreatment"
        },

        render : function() {
            if (!this.employeesCollection.isReady || !this.typesCollection.isReady
                || (!this.treatmentCollection.isReady && this.action==='edit')) {
                return;
            }

            var model = {
                treatment : this.treatmentCollection.toJSON(),
                employees : this.employeesCollection.toJSON(),
                motives : this.typesCollection.toJSON()
            };
            this.$main.html(this.template({
                model : model
            }));
            this.$main.i18n($.i18n.options);
            $('#customerSearch .typeahead').typeahead({
                    hint: true,
                    highlight: true,
                    minLength: 3
                },
                {
                    name: 'customers',
                    source: _.bind(this.searchCustomers, this),
                    engine: _,
                    templates: {
                        empty: [
                            '<div class="empty-message">',
                                'Not found',
                            '</div>'
                        ].join('\n'),
                        suggestion : _.bind(function(data){
                            var model = {
                                id : data.id,
                                name : data.name,
                                type : "CUSTOMER"
                            };

                            return this.searchTemplate({model:model});
                          }, this)
                    }
                });
            $('#customerSearch').on('blur', _.bind(this.customerSearchBlur, this));
            if ('edit'===this.action) {
                var customerId = this.treatmentCollection.toJSON()[0].customerId;
                api.getBranchesByCustomer(_.bind(this.fillBranchesByCustomer,this),customerId)
            }
        },

        searchCustomers: function (search, callback) {
            this.typeAheadCustomersCallback = callback;
            api.locateCustomers(_.bind(this.customersAreLocated, this), '%' + search + '%');
        },

        customersAreLocated: function (result, status, message) {
            if (status === "OK") {
                this.typeAheadCustomersCallback(result);
            } else if (message === "NO_RIGHTS") {
                Backbone.trigger('NO_RIGHTS');
            } else {
                console.log(message);
            }
        },

        customerSearchBlur: function (evt) {
            $('#customerSearch').val($('#treatmentCustomer').val());
        },

        searchListenerCustomer : function (jqobj, item, srcname) {
            $('#customerId').val(item.id);
            $('#customerName').html(item.name);
            api.getBranchesByCustomer(_.bind(this.fillBranchesByCustomer,this),item.id)
        },

        fillBranchesByCustomer : function (result, status, message) {
            if (status === "OK") {
                var branches = '<option value=""></option>';
                $('#treatmentBranch').html('');
                _.each(result,function(item) {
                    if ('edit'===this.action && item.id===this.treatmentCollection.toJSON()[0].branchId) {
                        branches += '<option selected value="' + item.id + '">' + item.name + '</option>';
                    } else {
                        branches += '<option value="' + item.id + '">' + item.name + '</option>';
                    }
                },this);
                $('#treatmentBranch').html(branches);
            } else if (message === "NO_RIGHTS") {
                Backbone.trigger('NO_RIGHTS');
            } else {
                console.log(message);
            }
        },

        saveTreatment : function(evt) {
            evt.preventDefault();
            var treatmentId = $('#treatmentId').val();
            var branchId = $('#treatmentBranch').val();
            var employeeId = $('#treatmentEmployee').val();
            var treatmentDate = $('#treatmentDate').val();
            var treatmentCertified = false;
            if ($('#treatmentCertified').is(':checked')) {
                treatmentCertified = true;
            }
            var treatmentFinished = false;
            if ($('#treatmentFinished').is(':checked')) {
                treatmentFinished = true;
            }
            var treatmentCoordinated = false;
            if ($('#treatmentCoordinated').is(':checked')) {
                treatmentCoordinated = true;
            }
            var treatmentMotives = $('#treatmentMotives').val();
            var treatmentComments = $('#treatmentComments').val();
            var date = new Date(treatmentDate);
            var dateUTC = new Date(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate(),0,0,0);

            this.formData.treatmentId = treatmentId;
            this.formData.branchId = branchId;
            this.formData.employeeId = employeeId;
            this.formData.treatmentDate = dateUTC.getTime();
            this.formData.treatmentCertified = treatmentCertified;
            this.formData.treatmentFinished = treatmentFinished;
            this.formData.treatmentCoordinated = treatmentCoordinated;
            this.formData.treatmentMotives = treatmentMotives;
            this.formData.treatmentComments = treatmentComments;

            api.saveTreatment(_.bind(this.renderTreatmentsView,this),this.formData);
        },

        renderTreatmentsView: function () {
            require(['views/HomeView', 'views/TreatmentsView', 'backbone'], function (HomeView, TreatmentsView, Backbone) {
                HomeView.treatmentsView = new TreatmentsView();
                HomeView.treatmentsView.listenTo(Backbone,'NO_RIGHTS',HomeView.errorFunc);
            });
        }
    });

    return TreatmentFormView;
});