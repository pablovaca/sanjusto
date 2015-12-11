/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/treatments-template.html',
    'text!templates/treatment-form-template.html',
    'config',
    'collections/treatments-collection',
    'services/APIServices'
], function ($, _, Backbone, treatmentsTemplate, newTreatmentTemplate, Config, TreatmentsCollection, api) {
    'use strict';

    Config.setUp();

    var TreatmentView = Backbone.View.extend({
        el : '#app',
        className : 'row',
        template : _.template(treatmentsTemplate),
        templateForm : _.template(newTreatmentTemplate),
        treatmentsCollection : {},
        container : 'centerPanel',
        pagesSelector : new Array(),
        treatmentFormView : {},

        initialize : function() {
            this.$main = this.$('#' + this.container);
            this.treatmentsCollection = new TreatmentsCollection();
            this.listenTo(this.treatmentsCollection, 'ready', this.render);
            this.treatmentsCollection.callPage(0);
        },

        events : {
            'click .js-click-page-treatments': 'goPage',
            'click .js-new-treatment': 'actionTreatment',
            'click .js-edit-treatment': 'actionTreatment'
        },

        render : function() {
            if (!this.treatmentsCollection.isReady) {
                return;
            }

            var totalPages = Math.ceil(this.treatmentsCollection.totalRows / this.treatmentsCollection.pageSize);
            var page = this.treatmentsCollection.page+1;
            var prevPage = page-1;
            var nextPage = page+1;

            if (totalPages >= 5) {
                this.pagesSelector[0] = 1;
                if (prevPage <= 1) {
                    this.pagesSelector[1] = 2;
                    this.pagesSelector[2] = 3;
                    this.pagesSelector[3] = 4;
                } else if (nextPage >= totalPages-1) {
                    this.pagesSelector[1] = totalPages-3;
                    this.pagesSelector[2] = totalPages-2;
                    this.pagesSelector[3] = totalPages-1;
                } else {
                    this.pagesSelector[1] = prevPage;
                    this.pagesSelector[2] = page;
                    this.pagesSelector[3] = nextPage;
                }
                this.pagesSelector[4] = totalPages;
            } else if (totalPages > 1) {
                for (var i=0;i<totalPages;i++) {
                    this.pagesSelector[i] = i+1;
                }
            }

            var model = {
                treatments : this.treatmentsCollection.toJSON(),
                totalRows : this.treatmentsCollection.totalRows,
                currentPage : this.treatmentsCollection.page,
                pagesSelector : this.pagesSelector
            };
            this.$main.html(this.template({
                model : model
            }));
            this.$main.i18n($.i18n.options);
        },

        goPage : function(evt) {
            evt.preventDefault();
            var id=$(evt.target).data('id');
            this.treatmentsCollection.callPage(id);
        },

        actionTreatment : function(evt) {
            evt.preventDefault();
            var action = $(evt.target).data('action');
            if (!action) {
                action = $(evt.target).parent().data('action');
            }
            var id = 0;
            if ("edit"===action) {
                id=$(evt.target).parent().data('id');
            }
            this.renderTreatmentForm(action,id);
        },

        renderTreatmentForm : function(action, treatmentId) {
            require(['views/TreatmentsView', 'views/TreatmentFormView', 'backbone'], function (TreatmentView, TreatmentFormView, Backbone) {
                TreatmentView.treatmentFormView = new TreatmentFormView(action,treatmentId,TreatmentView);
                TreatmentView.treatmentFormView.listenTo(Backbone,'NO_RIGHTS',TreatmentView.errorFunc);
            });
        }
    });

    return TreatmentView;
});