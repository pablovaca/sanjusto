/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/talent-template.html',
    'text!templates/modal-template.html',
    'text!templates/talentModal-template.html',
    'config',
    'services/StarMeUpServices',
    'select2',
    'radar-custom'
], function ($, _, Backbone, talentTemplate, ModalTemplate, TalentModalTemplate, Config, smuServices, select2) {
    'use strict';

    Config.setUp();

    var TalentsView = Backbone.View.extend({
        el : '#app',
        className : '',
        template : _.template(talentTemplate),
        modalTemplate : _.template(ModalTemplate),
        modalContentTemplate : _.template(TalentModalTemplate),
        currentLoggedUser : false,
        currentUser : {},
        starsGiven : 0,
        maxStarsToGive : 0,
        skillsReady : false,
        readyForChart : false,
        userSkillsDetails : {},
        userSkillsByLevel : {},

        initialize : function(container, currentUser, currentLoggedUser, starGiven, maxStarsToGive) {
            this.$main = this.$('#' + container);
            this.$main.html('');
            this.currentLoggedUser = currentLoggedUser;
            this.currentUser = currentUser;
            this.starsGiven = starGiven;
            this.maxStarsToGive = maxStarsToGive;
            this.callback();
            this.listenTo(this,'change', this.render);
        },

        callback : function(){
            smuServices.countstarsbytypeandusergroupedbylevel(_.bind(this.callBackSkillsByLevel, this), this.currentUser.id);
            smuServices.countStarsByTypeAndUserIncludingImportedSkills(_.bind(this.callBackSkillsDetails, this), this.currentUser.id);
        },

        render : function() {

            if(!this.skillsReady || !this.readyForChart || this.userSkillsByLevel.length < 0){
                this.$main.html('')
                return;
            }

            var model = {
                user : this.currentUser,
                skills : this.userSkillsDetails,
                loggedUser : this.currentLoggedUser,
                maxStars : this.maxStarsToGive - this.starsGiven
            };

            this.$main.html(this.template({
                model : model
            }));

            $('.select2-input').on('focus', function(){
                $('#talentErrorMsgs').fadeOut('800');
            })
            $(this.$main).i18n($.i18n.options);
            this.renderSpiderChart();
            this.unbind();
        },

        callBackSkillsByLevel : function (result, status, message){
            if(status == 'OK'){
                if(result != null && result.length >0){
                    this.userSkillsByLevel = result;
                }
                this.readyForChart = true;
                this.trigger('change');
            } else if (message=="NO_RIGHTS") {
                Backbone.trigger('NO_RIGHTS');
            } else {
            console.log(message);
            }
        },

        callBackSkillsDetails : function (result, status, message){
            if(status == 'OK'){
                if(result != null && result.length >0){
                    this.userSkillsDetails = result;
                } 
                this.skillsReady = true;
                this.trigger('change');
            } else if (message=="NO_RIGHTS") {
                Backbone.trigger('NO_RIGHTS');
            } else {
            console.log(message);
            }
        },

        renderSpiderChart : function(){
            var countData = 0;
            var data = [
            {
                className: 'talents',
                axes : []
            }
            ];
            if(this.userSkillsByLevel && this.userSkillsByLevel.length > 0){
                _.each(this.userSkillsByLevel, function(skill){
                    data[0].axes.push({axis:skill.name.slice(0,12), value:skill.stars+1, fullName:skill.name});
                }, this);


            var weight = 275,
                heigth = 275;

            //custom values to draw, to see more customize values got to rada-custom.js
            var config = {
                    w: weight,
                    h: heigth,
                    labelScale : 1.1,
                    facet: false,
                    levels: 4,
                    maxValue: 1,
                    translateX: weight / 4,
                    translateY: heigth / 4,
                    colors: d3.scale.category10(),
                    showLevels: true,
                    showLevelsLabels: true,
                    showAxesLabels: true,
                    showAxes: true,
                    showLegend: false,
                    paddingX: 5,
                    paddingY: 0,
                    polygonPointSize: 6
            };

            //custom radar function to draw
            RadarChart.draw('#spiderTalent',data, config);
            }
        }

    });

    return TalentsView;
});