/*global define*/
define([ 
    "jquery",
    "underscore",
    "backbone",
    "text!templates/leaderBoardReportFilter-template.html",
    "text!templates/leaderBoardReport-template.html",
    "config",
    "collections/star-collection",
    "collections/userStarsCount-collection",
    "collections/organizationOffice-collection",
    "services/StarMeUpServices"
    ], function($, _, Backbone, leaderBoardReportFilterTemplate, leaderBoardReportTemplate, Config, StarsCollection, UsersStarsCountCollection, OrganizationOfficeCollection, smuServices) {
    "use strict";

    Config.setUp();

    var LeaderBoardReportView = Backbone.View.extend({
        el : '#app',
        className : 'row',
        $filterContainer : '',
        filterTemplate : _.template(leaderBoardReportFilterTemplate),
        template : _.template(leaderBoardReportTemplate),
        starsCollection : {},
        receiversCollection : {},
        organizationOfficesCollection : {},
        receiversListSize : 10,
        reportListSize : 0,
        currentUserIsAdmin : false,
        initialize : function(filterContainer, container, organizationValues) {
            this.$filterContainer = this.$('#' + filterContainer);
            this.$main = this.$('#' + container);

            //Stars
            this.starsCollection = new StarsCollection(null, organizationValues);
            this.listenTo(this.starsCollection, 'ready', this.renderFilter);

            //Receivers
            this.receiversCollection = new UsersStarsCountCollection();
            this.listenTo(this.receiversCollection, 'ready', this.renderContent);

            //Organization Offices
            this.organizationOfficesCollection = new OrganizationOfficeCollection();
            this.listenTo(this.organizationOfficesCollection, 'ready', this.renderFilter);

            this.currentUserIsAdmin = smuServices.userHasRights('AdminPanel');

            this.render();
        },
        render : function() {
            this.renderFilter();
            this.filterView();
            this.renderContent();
            $(this.$main).i18n($.i18n.options);
        },
        renderFilter : function(){
            if (!(this.starsCollection.isReady && this.organizationOfficesCollection.isReady)) {
                return;
            }

            var stars = this.starsCollection.toJSON();
            var locations = this.organizationOfficesCollection.toJSON();

            var filterModel = {
                stars : stars,
                locations : locations,
                currentUserIsAdmin : this.currentUserIsAdmin,
                isTalentModuleEnabled : smuServices.isTalentModuleEnabled()
            };
            this.$filterContainer.html(this.filterTemplate({
                model : filterModel
            }));

            var nowTemp = new Date();
            var from = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
            var to = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
            from.setDate(from.getDate() - 29);

            this.$filterContainer.find('#leaderBoardPeriod').on('change',_.bind(this.filterView,this));
            this.$filterContainer.find('#leaderBoardStarType').on('change',_.bind(this.filterView,this));
            this.$filterContainer.find('#leaderBoardLocation').on('change',_.bind(this.filterView,this));
            this.$filterContainer.find('#leaderBoardAction').on('change',_.bind(this.filterView,this));

            this.filterView();
            // $(this.$main).i18n($.i18n.options);
            $(this.$filterContainer).i18n($.i18n.options);

        },
        renderContent : function(){
            if (!this.receiversCollection.isReady) {
                return;
            }

            var receivers = this.receiversCollection.toJSON();

            _.each(receivers,function(element,index){
                element.profileImageId = smuServices.getProfileImage(element.profileImageId)
            });

            var model = {
                receivers : receivers,
                leaderboardReportEnabled : smuServices.userHasRights('LeaderboardReport')
            };
            this.$main.html(this.template({
                model : model
            }));

            this.$main.find('.img-circle').on('click',_.bind(this.selectedUser, this));

            this.$main.find('#exportReceiversToCsv').on('click',_.bind(this.exportReceiversToCsv,this));
            $(this.$main).i18n($.i18n.options);
        },
        selectedUser : function(event){
            var selectedUser = {};
            var selectedId = $(event.target).data('id');

            var receivers = this.receiversCollection.toJSON();

            _.each(receivers,function(element,index){
                if(element.id == selectedId){
                    selectedUser = element;
                }
            });

            this.trigger('userSelection', selectedUser);
        },
        filterView : function(){
            if (!(this.$filterContainer.children().length > 0)) {
                return;
            }

            var selectedPeriod = this.getSelectedPeriod();
            var from = selectedPeriod.from;
            var to = selectedPeriod.to;

            from = from.getTime();
            to = to.getTime();

            var organizationValueId = this.$filterContainer.find('#leaderBoardStarType').val();
            var locationId = this.$filterContainer.find('#leaderBoardLocation').val();
            var actionId = this.$filterContainer.find('#leaderBoardAction').val();

            if(actionId == '1'){
                //Senders
                this.receiversCollection.initializeSendersCollectionFiltered(this.receiversListSize, from, to, organizationValueId, locationId);
            }
            if(actionId == '2'){
                //Receivers
                this.receiversCollection.initializeReceiversCollectionFiltered(this.receiversListSize, from, to, organizationValueId, locationId);
            }
        },

        exportReceiversToCsv : function(event){
            event.preventDefault();

            var selectedPeriod = this.getSelectedPeriod();
            var from = selectedPeriod.from;
            var to = selectedPeriod.to;

            var organizationValueId = this.$filterContainer.find('#leaderBoardStarType').val();
            var locationId = this.$filterContainer.find('#leaderBoardLocation').val();
            var actionId = this.$filterContainer.find('#leaderBoardAction').val();
            var action = 'all';

            if(actionId == '1'){
                action = 'sent';
            }
            if(actionId == '2'){
                action = 'received';
            }

            smuServices.leaderboardreport(this.reportListSize, from.getTime(), to.getTime(), organizationValueId, action, locationId);
        },

        getSelectedPeriod : function(){
            var from = null;
            var to = null;

            /*var from = this.$filterContainer.find('#leaderBoardDateFrom').data("DateTimePicker").date().toDate().getTime();
            var to = this.$filterContainer.find('#leaderBoardDateTo').data("DateTimePicker").date().toDate();
            to.setDate(to.getDate() + 1);
            to = to.getTime();*/

            var period = this.$filterContainer.find('#leaderBoardPeriod').val();

            var nowTemp = new Date();

            if(period == 0){ //All time
                from = new Date(0, 0, 0, 0, 0, 0, 0);
                to = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate() + 1, 0, 0, 0, 0);
            }else if(period == 1){ //Last year
                from = new Date(nowTemp.getFullYear() - 1, 1, 1, 0, 0, 0, 0);
                to = new Date(nowTemp.getFullYear(), 1, 1, 0, 0, 0, 0);
            }else if(period == 2){ //This year
                from = new Date(nowTemp.getFullYear(), 1, 1, 0, 0, 0, 0);
                to = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate() + 1, 0, 0, 0, 0);
            }else if(period == 3){ //Last month
                from = new Date(nowTemp.getFullYear(), nowTemp.getMonth() - 1, 1, 0, 0, 0, 0);
                to = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), 1, 0, 0, 0, 0);
            }else if(period == 4){ //This month
                from = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), 1, 0, 0, 0, 0);
                to = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate() + 1, 0, 0, 0, 0);
            }

            return {from: from, to: to};
        }
    });

    return LeaderBoardReportView;
});
