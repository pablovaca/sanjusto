/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/branches-template.html',
    'config',
    'collections/branches-collection',
    'services/APIServices'
], function ($, _, Backbone, branchesTemplate, Config, BranchesCollection, api) {
    'use strict';

    Config.setUp();

    var BranchView = Backbone.View.extend({
        el : '#app',
        className : 'row',
        template : _.template(branchesTemplate),
        branchesCollection : {},
        container : 'centerPanel',
        pagesSelector : new Array(),

        initialize : function() {
            this.$main = this.$('#' + this.container);
            this.branchesCollection = new BranchesCollection();
            this.listenTo(this.branchesCollection, 'ready', this.render);
            this.branchesCollection.callPage(0);
        },

        events : {
            'click .js-click-page': 'goPage'
        },

        render : function() {
            if (!this.branchesCollection.isReady) {
                return;
            }

            var totalPages = Math.ceil(this.branchesCollection.totalRows / this.branchesCollection.pageSize);
            var page = this.branchesCollection.page+1;
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
            } else {
                for (var i=0;i<totalPages;i++) {
                    this.pagesSelector[i] = i+1;
                }
            }

            var model = {
                branches : this.branchesCollection.toJSON(),
                totalRows : this.branchesCollection.totalRows,
                currentPage : this.branchesCollection.page,
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
            this.branchesCollection.callPage(id);
        }

    });

    return BranchView;
});