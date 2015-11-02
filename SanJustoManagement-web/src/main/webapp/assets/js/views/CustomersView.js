/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/customers-template.html',
    'config',
    'collections/customers-collection',
    'services/APIServices'
], function ($, _, Backbone, customersTemplate, Config, CustomersCollection, api) {
    'use strict';

    Config.setUp();

    var CustomerView = Backbone.View.extend({
        el : '#app',
        className : 'row',
        template : _.template(customersTemplate),
        customersCollection : {},
        container : 'centerPanel',
        pagesSelector : new Array(),

        initialize : function() {
            this.$main = this.$('#' + this.container);
            this.customersCollection = new CustomersCollection();
            this.listenTo(this.customersCollection, 'ready', this.render);
            this.customersCollection.callPage(0);
        },

        events : {
            'click .js-click-page-customers': 'goPage'
        },

        render : function() {
            if (!this.customersCollection.isReady) {
                return;
            }

            var totalPages = Math.ceil(this.customersCollection.totalRows / this.customersCollection.pageSize);
            var page = this.customersCollection.page+1;
            var prevPage = page-1;
            var nextPage = page+1;

            if (totalPages>=5) {
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
                customers : this.customersCollection.toJSON(),
                totalRows : this.customersCollection.totalRows,
                currentPage : this.customersCollection.page,
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
            this.customersCollection.callPage(id);
        }

    });

    return CustomerView;
});