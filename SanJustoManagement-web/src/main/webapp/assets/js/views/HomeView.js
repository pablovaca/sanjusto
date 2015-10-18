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
        treatmentsView : {},

        initialize: function () {
            this.$main = this.$('#mainView');
        },

        events: {
            "click .js-click-treatments": "internalNavigation"
        },

        render: function () {
            $('#mainView').html('');

            var model = {
            };

            apiServices.initializeLanguage();
            this.$main.html(this.template({
                model: model
            }));

        },

        internalNavigation: function (event) {
            var cssClass = $(event.target).attr('class');
            if (cssClass === 'js-click-treatments') {
                this.treatments(event);
                this.currentLocation = 'treatments';
                return;
            };
        },

        treatments: function (evt) {
            if(evt){
                evt.preventDefault();
            }

            this.renderTreatmentsView();
        },

        renderTreatmentsView: function () {
            require(['views/HomeView', 'views/TreatmentsView', 'backbone'], function (HomeView, TreatmentsView, Backbone) {
                HomeView.treatmentsView = new TreatmentsView();
                HomeView.treatmentsView.listenTo(Backbone,'NO_RIGHTS',HomeView.errorFunc);
            });
        },

        errorFunc : function(){
            apiServices.clearCookies();
            Backbone.history.navigate('/login',{trigger: true, replace: true});
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
