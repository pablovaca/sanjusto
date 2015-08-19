/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/dashBoard-template.html',
    'text!templates/dashBoardFilter-template.html',
    'text!templates/dashBoardCounter-template.html',
    'collections/star-collection',
    'collections/user-collection',
    'config',
    'services/StarMeUpServices',
    'd3'
], function ($, _, Backbone, dashBoardPanelTemplate, dashBoardPanelFilterTemplate, dashBoardCounterTemplate, StarsCollection, UserCollection, Config, smuServices, d3) {
    'use strict';

    Config.setUp();

    var DashBoardPanelView = Backbone.View.extend({
        el : '#app',
        className : '',
        template : _.template(dashBoardPanelTemplate),
        filterTemplate : _.template(dashBoardPanelFilterTemplate),
        counterTemplate : _.template(dashBoardCounterTemplate),
        StarsCollection : {},
        UserCollection: {},
        mostRewardedUsers : {},
        totalStars : {},
        mostRewarderUsers : {},
        mostRewardedOffice : {},
        mostGivenValues : {},
        accessCategories : {},
        usersByStars : {},
        dashBoardReady : false,
        totalStarsNumber : "",
        currentStar : {},
        nextColor : 'c34645',
        colors :
        {
            color_c34645 : '#c34645',
            color_bf46ad : '#bf46ad',
            color_01a976 : '#01a976',
            color_0083ad : '#0083ad',
            color_b97244 : '#b97244',
            color_b09b40 : '#b09b40',
            color_6b32a0 : '#6b32a0',
            color_dba300 : '#dba300',
            color_ffcb4b : '#ffcb4b',
            color_01c3c3 : '#01c3c3',
            color_679f46 : '#679f46',
            color_00acae : '#00acae',
            color_1a3933 : '#1a3933',
            color_c95647 : '#c95647',
            color_011341 : '#011341'
        },
        timmerRandomStarCounter : {},

        initialize : function(container, filterContainer) {
            this.$main = this.$('#' + container);
            this.$filter = this.$('#' + filterContainer);
            this.render();
        },

        render : function(){
            this.renderComboPeriod();

            smuServices.intializeServerStarCountNotifications(_.bind(this.serverStarCountNotification, this));
             $(this.$main).i18n($.i18n.options);
             $(this.$filter).i18n($.i18n.options);
        },

        renderComboPeriod : function(){
            var model = {};
            this.$filter.html(this.filterTemplate({model:model}));

            var nowTemp = new Date();
            //first day of the month
            var from = new Date(nowTemp.getFullYear(), nowTemp.getMonth(),1);
            //last day of the month
            var to = new Date(nowTemp.getFullYear(), nowTemp.getMonth()+1,0);

            var fromStringDate = from.getFullYear()+("0"+(from.getMonth()+1)).slice(-2)+("0"+from.getDate()).slice(-2);
            var toStringDate = to.getFullYear()+("0"+(to.getMonth()+1)).slice(-2)+("0"+to.getDate()).slice(-2);

            smuServices.getStellarDashboard(_.bind(this.callBackStellarDashBoard, this), fromStringDate, toStringDate, null, null);
            smuServices.setDatesToPullStarCountNotification(fromStringDate, toStringDate);
            $('#dashBoardPeriod').on('change',_.bind(function(){
                this.timmerRandomStarCounter = setInterval(this.randomStarCounter,200);
                this.getCompleteStellarDashboard();
            },this));
        },

        renderDashBoard : function() {
                if(!this.dashBoardReady){
                return;
            }

            var maxQuantityOfUsersByStars = 0;
            
            if(this.usersByStars != null){
                _.each(this.usersByStars, function(item){
                    if(item.users > maxQuantityOfUsersByStars){
                        maxQuantityOfUsersByStars = item.users;
                    }
                }, this);
            }
                
            var model = {
                    mostAwardedPersonWidget : this.mostRewardedUsers,
                    totalStars : this.totalStars,
                    mostRewarderPersonsWidget : this.mostRewarderUsers,
                    mostGivenValues : this.mostGivenValues,
                    mostRewardedOffice : this.mostRewardedOffice,
                    usersByStars : this.usersByStars,
                    maxQuantityOfUsersByStars : maxQuantityOfUsersByStars
            };

            this.$main.html(this.template({
                model : model
            }));

            this.renderPieChart();
            this.renderAccessPieChart();
            this.renderHistogram();
            this.renderSvgMostActiveLocation();
            $('#exportStarsToCsv').on('click',_.bind(this.exportStarsToCsv,this));

            if(!(this.totalStarsNumber > 0)){
                $('#mostGivenValues').addClass("hide");
                $('#mostGivenValuesInfo').addClass("hide");
            }
            this.$main.find('.img-circle').on('click',_.bind(this.selectedUser, this));

            if(this.timmerRandomStarCounter != null){
                clearTimeout(this.timmerRandomStarCounter);
                this.timmerRandomStarCounter = {};
            }

            $(this.$filter.find('#counterContainer')).html(this.counterTemplate({
                model : model
            }));
            $('#dashBoardPeriod').prop('disabled', false);
            this.$main.find('#toggleCollapseLocations').on('click',_.bind(function(){
                if(this.$main.find('#toggleCollapseLocations').text() === $.t("translation:dashboard.topTenLocations.showMoreLocations")){
                    this.$main.find('#toggleCollapseLocations').text($.t('dashboard.topTenLocations.showLessLocations'));
                } else {
                    this.$main.find('#toggleCollapseLocations').text($.t('dashboard.topTenLocations.showMoreLocations'));
                }
            }, this));
            this.$main.find('#toggleCollapseHistogram').on('click',_.bind(function(){
                if(this.$main.find('#toggleCollapseHistogram').text() === $.t("translation:dashboard.histogram.showMore")){
                    this.$main.find('#toggleCollapseHistogram').text($.t('dashboard.histogram.showLess'));
                } else {
                    this.$main.find('#toggleCollapseHistogram').text($.t('dashboard.histogram.showMore'));
                }
            }, this));
            $(this.$main).i18n($.i18n.options);
            $(this.$filter).i18n($.i18n.options);
        },

        starCountNotification : function(starsCount){         
            if(starsCount > this.totalStarsNumber){             
                this.getCompleteStellarDashboard();
            }
        },

        getCompleteStellarDashboard : function(){
            var selectedPeriod = this.getSelectedPeriod();

            var from = selectedPeriod.fromStringDate;
            var to = selectedPeriod.toStringDate;

            $('#dashBoardPeriod').prop('disabled', 'disabled');
            smuServices.getStellarDashboard(_.bind(this.callBackStellarDashBoard, this), from, to, null, null);
            smuServices.setDatesToPullStarCountNotification(from, to);
        },

        callBackStellarDashBoard : function(result,status,message){
            if(status === 'OK' && result != null && this.totalStarsNumber != null && this.totalStarsNumber !== "undefined"){                            
                var selectedPeriod = this.getSelectedPeriod();
                var from = selectedPeriod.fromStringDate;
                var to = selectedPeriod.toStringDate;
                this.nextColor = 'c34645';

                    _.each(result, function(element,index){

                        if(index == "mostRewardedUsers"){
                            _.each(element,function(opt){
                                opt.profileImageId = smuServices.getProfileImage(opt.profileImageId);
                            });
                            this.mostRewardedUsers = element;
                        }
                        if(index == "totalStars"){
                            var sNumber = element.toString(),
                                output = [],
                                digits = 5;
                            for(var i = 0; i<digits-sNumber.length; i++){
                                output.push(0);
                            }

                            for (var i = 0; i < sNumber.length; i++) {
                                output.push(+sNumber.charAt(i));
                            }
                            this.totalStars = output;
                            this.totalStarsNumber = sNumber;

                        }

                        if(index === "mostRewarderUsers"){
                            _.each(element,function(opt){
                                opt.profileImageId = smuServices.getProfileImage(opt.profileImageId);
                            });
                            this.mostRewarderUsers = element;
                        } else if(index === "mostRewardedOffice"){

                            var max = 0;

                            _.each(element, function(item){
                                if(item != null && item.stars > max){
                                    max = item.stars;
                                }
                            },this);


                            this.mostRewardedOffice = {
                                    element : element,
                                    max : max};
                        } else if(index === "mostGivenValues"){
                            this.mostGivenValues = element;
                            this.currentStar = {};

                            if(element[0] != null){
                                this.currentStar = element[0];
                                smuServices.getStellarDashboard(_.bind(this.callBackDataStar, this), from, to, null, element[0].id);
                            }
                        } else if(index === "accessCategories"){
                            this.accessCategories = element;
                        } else if(index === "usersByStars"){
                            this.usersByStars = element;
                        }
                    },this)

                    this.dashBoardReady = true;
                    this.renderDashBoard();
            } else if (message==="NO_RIGHTS") {
                Backbone.trigger('NO_RIGHTS');
            } else {
                console.log(message);
            }
        },

        exportStarsToCsv : function(event){
            event.preventDefault();

            smuServices.starsreport('','');
        },

        renderSvgMostActiveLocation : function(){

            var index = 0;

            var data = [];
            _.each(this.mostRewardedOffice.element, function(d){
                if(d.stars > 0){
                    if(index < 10){
                        index = index + 1;
                        data.push({name:d.name, TotalStars: d.stars, percentage:d.percentage});
                    }
                }
            });

            var barWidth = 70,
                width = (barWidth + 10) * data.length,
                height = 350;

            var x = d3.scale.linear().domain([0, data.length]).range([0, width]);
            var y = d3.scale.linear().domain([0, d3.max(data, function(d) { return d.TotalStars; })]).
              rangeRound([0, height]);

            var svg = d3.select("#mostActiveLocations").
              append("svg").
              attr("width", width).
              attr("height", height + 120).
              append("g").
              attr("transform", "translate(10,0)");

            svg.selectAll("g").
              data(data).
              enter().
              append("rect").
              attr("x", function(d, i) { return x(i); }).
              attr("y", function(d) { return height + 50 - y(d.TotalStars); }).
              attr("height", function(d) { return y(d.TotalStars); }).
              attr("width", barWidth).
              attr("fill", "#E28726");         

            svg.selectAll("g").
              data(data).
              enter().
              append("text").
              attr("x", function(d, i) { return x(i) + barWidth; }).
              attr("y", function(d) { return height - y(d.TotalStars); }).
              attr("dx", - barWidth/2).
              attr("dy", "1.2em").
              attr("text-anchor", "middle").
              attr("font-size", "10px").
              text(function(d) { return d.name;}).
              attr("fill", "grey");          

            svg.selectAll("g").
              data(data).
              enter().
              append("text").
              attr("x", function(d, i) { return x(i) + barWidth; }).
              attr("y", function(d) { return height - y(d.TotalStars) + 18; }).
              attr("dx", -barWidth/2).
              attr("dy", "1.2em").
              attr("text-anchor", "middle").
              attr("font-size", "10px").
              text(function(d) { return d.percentage + "%";}).
              attr("fill", "grey");


            svg.selectAll("g").
              data(data).
              enter().append("text").
              attr("x", function(d, i) { return x(i) + barWidth + 15; }).
              attr("y", height + 62).
              attr("dx", -barWidth/2).
              attr("text-anchor", "middle").
              attr("style", "font-size: 12; font-family: Helvetica, sans-serif").
              text(function(d) { return d.TotalStars;}).
              attr("class", "xAxis")
              .attr("transform", "translate(0,10)");              

            svg.selectAll("g")
            .data(data)
            .enter().append("svg:image")
            .attr("x", function(d, i) { return x(i) + barWidth / 2 - 15; })
            .attr("y", height + 55)
            .attr("dx", -barWidth/2)
            .attr("xlink:href", window.location.protocol + "//" + window.location.host + window.location.pathname + "assets/content/starmeup/img/ico-star30x30.png").attr("width", 20)
            .attr("height", 20);                     
        },

        renderPieChart : function(){

            var maxLengthInTexts = 23;

            var data = [];
            _.each(this.mostGivenValues, function(d){
                data.push({name : d.name.length <= maxLengthInTexts ? d.name : d.name.substring(0,maxLengthInTexts) + '..', percentage : d.percentage, id : d.id });
            });

            var width = 580,
                height = 350,
                radius = Math.min(width, height) / 2,
                imgWidth = 50,
                imgHeight = 50;


            var svg = d3.select("#mostGivenValues")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")

            svg.append("g")
                .attr("class", "slices");
            svg.append("g")
                .attr("class", "labels");
            svg.append("g")
                .attr("class", "lines");
            svg.append("g")
                .attr("class", "labelsPercentage");

            var pie = d3.layout.pie()
                .sort(null)
                .value(function(d) {
                    return d.percentage;
                });

            var arc = d3.svg.arc()
                .outerRadius(radius * 0.85)
                .innerRadius(radius * 0.45);

            var outerArc = d3.svg.arc()
                .innerRadius(radius * 0.9)
                .outerRadius(radius * 0.9);

            svg.attr("transform", "translate(" + (width+10) / 2 + "," + height / 2 + ")");

            var color = d3.scale.ordinal()
                .domain(_.map(data, function(d){return d.id}))
                .range(["#c34645", "#bf46ad", "#01a976", "#0083ad", "#b97244", "#b09b40"]);

            var slice = svg.select(".slices").selectAll("path.slice")
                .data(pie(data));

            slice.enter()
                .insert("path")
                .attr("d", arc)
                .style("fill", function(d) { return color(d.data.id); })
                .style("stroke-width", "2px")
                .attr("data-id", function(d) { return d.data.id; })
                .style("cursor", "pointer")
                .style("cursor", "hand")
                .attr("class", "slice")
                .on('click',_.bind(this.showData,this));

            var percentageText = svg.select(".labelsPercentage").selectAll("text")
                .data(pie(data));

            percentageText.enter()
                .append("text")
                .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
                .attr("dy", ".40em")
                .style("text-anchor", "middle")
                .attr("data-id", function(d) { return d.data.id; })
                .style("font-size", "12px")
                .style("fill", "#fff")
                .style("cursor", "pointer")
                .style("cursor", "hand")
                .text(function(d) {return d.data.name;}).on('click',_.bind(this.showData,this))
                .text(function(d) { return d.data.percentage + "%"; });

            var text = svg.select(".labels").selectAll("text")
                .data(pie(data));

            text.enter()
                .append("text")
                .attr("dy", ".35em")
                .attr("transform", function(d){
                    var pos = outerArc.centroid(d);
                    pos[0] = (radius - 9) * (midAngle(d) < Math.PI ? 1 : -1);
                    return "translate("+ pos +")";
                })
                .attr("text-anchor", function(d){
                    return midAngle(d) < Math.PI ? "start":"end";
                })
                .attr("data-id", function(d) { return d.data.id; })
                .style("font-size", "11.4px")
                .style("cursor", "pointer")
                .style("cursor", "hand")
                .text(function(d) {return d.data.name;})
                .on('click',_.bind(this.showData,this));

            function midAngle(d){
                return d.startAngle + (d.endAngle - d.startAngle)/2;
            }

            var polyline = svg.select(".lines").selectAll("polyline")
                .data(pie(data));

            polyline.enter()
                .append("polyline")
                .style("stroke", function(d) { return color(d.data.id); })
                .style("fill", "none")
                .style("stroke-width", "2.5px")
                .attr("points", function(d){
                    var pos = outerArc.centroid(d);
                    pos[0] = (radius - 10) * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                    return [arc.centroid(d), outerArc.centroid(d), pos];
                });

            $('#mostGivenValues').removeClass("hide");
        },

        renderAccessPieChart : function(){

            var maxLengthInTexts = 23;

            var data = [];
            _.each(this.accessCategories, function(d){
                d.name = d.name;
                data.push({name : d.name.length <= maxLengthInTexts ? d.name : d.name.substring(0,maxLengthInTexts) + '..', percentage : d.percentage, id : d.id, logs : d.logs });
            });

            var width = 580,
                height = 350,
                radius = Math.min(width, height) / 2,
                imgWidth = 50,
                imgHeight = 50;


            var svg = d3.select("#accessPieChart")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")

            svg.append("g")
                .attr("class", "slices");
            svg.append("g")
                .attr("class", "labels");
            svg.append("g")
                .attr("class", "labelsQuantity");
            svg.append("g")
                .attr("class", "lines");
            svg.append("g")
                .attr("class", "labelsPercentage");

            var pie = d3.layout.pie()
                .sort(null)
                .value(function(d) {
                    return d.percentage;
                });

            var arc = d3.svg.arc()
                .outerRadius(radius * 0.85)
                .innerRadius(radius * 0.45);

            var outerArc = d3.svg.arc()
                .innerRadius(radius * 0.9)
                .outerRadius(radius * 0.9);

            svg.attr("transform", "translate(" + (width+10) / 2 + "," + height / 2 + ")");

            var color = d3.scale.ordinal()
                .range(["#6ab344", "#C7C7CC", "#00ABAD", "#c34559"]);

            /* ------- PIE SLICES -------*/
            var slice = svg.select(".slices").selectAll("path.slice")
                .data(pie(data));

            slice.enter()
                .insert("path")
                .attr("d", arc)
                .style("fill", function(d) { return color(d.data.name); })
                .style("stroke-width", "2px")
                .attr("data-id", function(d) { return d.data.id; })
                .attr("class", "slice");

            /* ------- TEXT LABELS Percentage -------*/

            var percentageText = svg.select(".labelsPercentage").selectAll("text")
                .data(pie(data));

            percentageText.enter()
                .append("text")
                .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
                .attr("dy", ".40em")
                .style("text-anchor", "middle")
                .attr("data-id", function(d) { return d.data.id; })
                .style("font-size", "12px")
                .style("fill", "#fff")
                .text(function(d) {return d.data.name;}).on('click',_.bind(this.showData,this))
                .text(function(d) { return d.data.percentage + "%"; });

            /* ------- TEXT LABELS -------*/

            var text = svg.select(".labels").selectAll("text")
                .data(pie(data));

            text.enter()
                .append("text")
                .attr("dy", ".35em")
                .attr("transform", function(d){
                    var pos = outerArc.centroid(d);
                    pos[0] = (radius - 9) * (midAngle(d) < Math.PI ? 1 : -1);
                    return "translate("+ pos +")";
                })
                .attr("text-anchor", function(d){
                    return midAngle(d) < Math.PI ? "start":"end";
                })
                .attr("data-id", function(d) { return d.data.id; })
                .style("font-size", "11.4px")
                .text(function(d) {return d.data.name;});

            /* ------- TEXT LABELS QUANTITY -------*/

            var quantityText = svg.select(".labelsQuantity").selectAll("text")
                .data(pie(data));

            quantityText.enter()
                .append("text")
                .attr("dy", ".35em")
                .attr("transform", function(d){
                    var pos = outerArc.centroid(d);
                    pos[0] = (radius - 9) * (midAngle(d) < Math.PI ? 1 : -1);
                    pos[1] = pos[1] + 15;
                    return "translate("+ pos +")";
                })
                .attr("text-anchor", function(d){
                    return midAngle(d) < Math.PI ? "start":"end";
                })
                .attr("data-id", function(d) { return d.data.id; })
                .style("font-size", "11.4px")
                .text(function(d) {return d.data.logs;});

            function midAngle(d){
                return d.startAngle + (d.endAngle - d.startAngle)/2;
            }

            /* ------- SLICE TO TEXT POLYLINES -------*/

            var polyline = svg.select(".lines").selectAll("polyline")
                .data(pie(data));

            polyline.enter()
                .append("polyline")
                .style("stroke", function(d) { return color(d.data.name); })
                .style("fill", "none")
                .style("stroke-width", "2.5px")
                .attr("points", function(d){
                    var pos = outerArc.centroid(d);
                    pos[0] = (radius - 10) * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
                    return [arc.centroid(d), outerArc.centroid(d), pos];
                });

            $('#accessPieChart').removeClass("hide");
        },

        renderHistogram : function(){

            var index = 0;

            var data = [];
            _.each(this.usersByStars, function(d){
                 if(d.stars > 0 && index < 10){
                     index = index + 1;
                     data.push({users:d.users, stars: d.stars});
                 }
            });

            var barWidth = 70,
                width = (barWidth + 10) * data.length,
                height = 350;

            var x = d3.scale.linear().domain([0, data.length]).range([0, width]);
            var y = d3.scale.linear().domain([0, d3.max(data, function(d) { return d.users; })]).
              rangeRound([0, height]);

            var svg = d3.select("#histogram").
              append("svg").
              attr("width", width).
              attr("height", height + 120).
              append("g").
              attr("transform", "translate(10,0)");

            svg.selectAll("g").
              data(data).
              enter().
              append("rect").
              attr("x", function(d, i) { return x(i); }).
              attr("y", function(d) { return height + 50 - y(d.users); }).
              attr("height", function(d) { return y(d.users); }).
              attr("width", barWidth).
              attr("fill", "#E28726");         

            svg.selectAll("g").
              data(data).
              enter().
              append("text").
              attr("x", function(d, i) { return x(i) + barWidth; }).
              attr("y", function(d) { return height - y(d.users) + 18; }).
              attr("dx", -barWidth/2).
              attr("dy", "1.2em").
              attr("text-anchor", "middle").
              attr("font-size", "10px").
              text(function(d) { return d.users;}).                       
              attr("fill", "grey");

            svg.selectAll("g").
              data(data).
              enter().append("text").
              attr("x", function(d, i) { return x(i) + barWidth + 15; }).
              attr("y", height + 62).
              attr("dx", -barWidth/2).
              attr("text-anchor", "middle").
              attr("style", "font-size: 12; font-family: Helvetica, sans-serif").
              text(function(d) { return d.stars;}).
              attr("class", "xAxis")
              .attr("transform", "translate(0,10)");

            svg.selectAll("g")
            .data(data)
            .enter().append("svg:image")
            .attr("x", function(d, i) { return x(i) + barWidth / 2 - 15; })
            .attr("y", height + 55)
            .attr("dx", -barWidth/2)
            .attr("xlink:href", window.location.protocol + "//" + window.location.host + window.location.pathname + "assets/content/starmeup/img/ico-star30x30.png").attr("width", 20)
            .attr("height", 20);
        },
        
        componentToHex : function(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        },

        rgbToHex: function(r, g, b) {
            return this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
        },

        showData : function(event){
            if(event.data == null){
                return;
            }
            var selectedPeriod = this.getSelectedPeriod();
            var from = selectedPeriod.fromStringDate;
            var to = selectedPeriod.toStringDate;
            var id = event.data.id;
            var color =  $('#mostGivenValues').find('path[data-id="' + event.data.id + '"]').css('fill');
            color = color.replace(/ /g,'');

            if(color.indexOf('#') == -1){
                color = color.replace('rgb(','');
                color = color.replace(')','');
                color = color.split(',');
                color = this.rgbToHex(parseInt(color[0]), parseInt(color[1]), parseInt(color[2]));
            }
            else{
                color = color.replace('#','');
            }

            this.nextColor = color;

            _.each(this.mostGivenValues, function(opt){
                if(opt.id == id){
                    this.currentStar = opt;
                    return;
                }
            }, this);
            smuServices.getStellarDashboard(_.bind(this.callBackDataStar, this), from, to, null, id);
        },

        callBackDataStar : function(result,status,message){
            if(status == 'OK'){
                if(result != null){
                    var rewardedUser = {},
                        rewarderUser = {},
                        totalStars = {},
                        rewardedOffice = {},
                        mostGivenValues = {};

                    _.each(result, function(element,index){

                        if(index == "mostRewardedUsers"){
                            $("#topReciver").text(rewardedUser = element[0].firstName + ' ' + element[0].lastName);
                        }
                        if(index == "totalStars"){
                            $("#totalSent").text(totalStars = element);
                        }
                        if(index == "mostRewarderUsers"){
                            $("#topSender").text(rewarderUser = element[0].firstName + ' ' + element[0].lastName);
                        }
                        if(index == "mostRewardedOffice"){
                            var topActiveLocation = null;
                            _.each(element, function(item, index){
                                if(topActiveLocation == null || item.stars > topActiveLocation.stars){
                                    topActiveLocation = item;
                                }
                            },this);
                            $("#location").text(rewardedOffice = topActiveLocation.name);
                        }
                    },this)
                }
                $("#table-image").attr('src', smuServices.getStarImage(this.currentStar.imageId));
                $("#starName").text(this.currentStar.name);
                $("#perc").text(this.currentStar.percentage+"%");

                var colorClass = '';
                _.each(this.colors, function(item, index){
                    if(index == 'color_' + this.nextColor){
                        colorClass = item;
                        return;
                    }
                }, this);

                $('#mostGivenValuesInfoHead').css('background-color',colorClass);
                $('#mostGivenValuesInfoHead').find('tr').css('background-color',colorClass);
                $('#mostGivenValuesInfo').removeClass("hide");
            } else if (message=="NO_RIGHTS") {
                Backbone.trigger('NO_RIGHTS');
            } else {
            console.log(message);
            }
        },

        selectedUser : function(event) {
            var selectedUser = {};
            var selectedId = $(event.target).data('id');

            if(selectedId == null){
                selectedId = $(event.target).parent().data('id');
            }

            smuServices.locateUserById(_.bind(function(selectedUser){this.trigger('userSelection', selectedUser);},this),selectedId,null);
        },

        serverStarCountNotification : function(result,status,message){
            if(status == 'OK'){
                if(result != null && result != ''){
                    this.starCountNotification(result);
                }
            }
        },
        getSelectedPeriod : function(){
            var from = null;
            var to = null;

            var period = this.$filter.find('#dashBoardPeriod').val();

            var nowTemp = new Date();
            if(period == 0){
                from = new Date(0, 0, 0, 0, 0, 0, 0);
                to = new Date(nowTemp.getFullYear(), nowTemp.getMonth()+1, 0, 0, 0, 0, 0);
            }else if(period == 1){
                from = new Date(nowTemp.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
                to = new Date(nowTemp.getFullYear(), 0, 0, 0, 0, 0, 0);
            }else if(period == 2){
                from = new Date(nowTemp.getFullYear(), 0, 1, 0, 0, 0, 0);
                to = new Date(nowTemp.getFullYear(), nowTemp.getMonth()+1, 0, 0, 0, 0, 0);
            }else if(period == 3){
                from = new Date(nowTemp.getFullYear(), nowTemp.getMonth() - 1, 1, 0, 0, 0, 0);
                to = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), 0, 0, 0, 0, 0);
            }else if(period == 4){
                from = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), 1, 0, 0, 0, 0);
                to = new Date(nowTemp.getFullYear(), nowTemp.getMonth()+1, 0, 0, 0, 0, 0);
            }

            var fromStringDate = from.getFullYear()+("0"+(from.getMonth()+1)).slice(-2)+("0"+from.getDate()).slice(-2);
            var toStringDate = to.getFullYear()+("0"+(to.getMonth()+1)).slice(-2)+("0"+to.getDate()).slice(-2);

            return {from: from, to: to, fromStringDate: fromStringDate, toStringDate: toStringDate};
        },

        randomStarCounter : function(){
            var text = "";
            var possible = "0123456789";

            for( var i=0; i < 5; i++ )
                text += possible.charAt(Math.floor(Math.random() * possible.length));

            $($('#totalStarCount li span')[0]).text(text[0]);
            $($('#totalStarCount li span')[1]).text(text[1]);
            $($('#totalStarCount li span')[2]).text(text[2]);
            $($('#totalStarCount li span')[3]).text(text[3]);
            $($('#totalStarCount li span')[4]).text(text[4]);
        }

    });

    return DashBoardPanelView;
});