/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/contacts-template.html',
    'config',
    'collections/contacts-collection',
    'services/APIServices'
], function ($, _, Backbone, contactsTemplate, Config, ContactsCollection, api) {
    'use strict';

    Config.setUp();

    var ContactView = Backbone.View.extend({
        el : '#app',
        className : 'row',
        template : _.template(contactsTemplate),
        contactsCollection : {},
        container : 'centerPanel',
        pagesSelector : new Array(),

        initialize : function() {
            this.$main = this.$('#' + this.container);
            this.contactsCollection = new ContactsCollection();
            this.listenTo(this.contactsCollection, 'ready', this.render);
            this.contactsCollection.callPage(0);
        },

        events : {
            'click .js-click-page-contacts': 'goPage'
        },

        render : function() {
            if (!this.contactsCollection.isReady) {
                return;
            }

            var totalPages = Math.ceil(this.contactsCollection.totalRows / this.contactsCollection.pageSize);
            var page = this.contactsCollection.page+1;
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
            } else if (totalPages >1){
                for (var i=0;i<totalPages;i++) {
                    this.pagesSelector[i] = i+1;
                }
            }

            var model = {
                contacts : this.contactsCollection.toJSON(),
                totalRows : this.contactsCollection.totalRows,
                currentPage : this.contactsCollection.page,
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
            this.contactsCollection.callPage(id);
        }

    });

    return ContactView;
});