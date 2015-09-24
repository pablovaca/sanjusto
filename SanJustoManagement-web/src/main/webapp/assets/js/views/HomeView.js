/*global define*/
define([
    "jquery",
    "underscore",
    "backbone",
    "text!templates/home-template.html",
    "config",
    "services/APIServices"
], function ($, _, Backbone, homeTemplate, Config, apiServices) {

    "use strict";

    /**
     * Singleton Pattern
     */
    var instance = null;

    Config.setUp();

    var HomeView = Backbone.View.extend({
        el: '#app',
        className: 'row',
        template: _.template(homeTemplate),

        initialize: function () {
            this.$main = this.$('#mainView');
        },

        events: {
        },

        render: function () {
            $('#mainView').html('');

            var model = {

            };

            this.$main.html(this.template({
                model: model
            }));

        }
    });

    HomeView.getInstance = function () {
        if (instance === null) {
            instance = new HomeView();
        }
        return instance;
    }

    return HomeView.getInstance();
});
