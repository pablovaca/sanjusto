/*global define*/
define([
	'jquery',
	'underscore',
	'backbone',
	'text!templates/analytics-template.html',
	'text!templates/analyticsFilter-template.html',
	'config',
    'services/StarMeUpServices',
    'c3'
], function ($, _, Backbone, AnalyticsTemplate, AnalyticsFilterTemplate, Config, smuServices, c3) {
	'use strict';

	Config.setUp();
        
	var AnalyticsView = Backbone.View.extend({
		el : '#app',
		className : 'row',
		$filterContainer: '',
		template : _.template(AnalyticsTemplate),
		filterTemplate : _.template(AnalyticsFilterTemplate),
		container : {},
		peopleGaveStar : [],
		totalStarSent : [],
		percentageByPlatform : {},
		accessPlatform : {},
		xAxis : {},
		xAxisPercentageByPlatform : [],
		xAxisPeopleGaveStar : [],
		xAxisTotalStarSent : [],
		totalActiveUsers : [],
		totalUsersWTos : {},
		totalUsersWPictures : {},
		starsWithLikesAndComment : {},
		chart1 : false,
		chart2 : false,
		chart3 : false,
		chart4 : false,
		chart5 : false,
		
		timeScale : 'MONTH',
		timeScaleToChart : '',
		
		initialize : function(container, filterContainer) {
			this.$main = this.$('#' + container);
			this.$filterContainer = this.$('#' + filterContainer);	    
		    this.container = container;
		    smuServices.getActiveUsers(_.bind(this.counter1, this));
		    smuServices.getUsersWithProfilePicture(_.bind(this.counter2, this));
		    smuServices.getAmountUsersWithoutTos(_.bind(this.counter3, this));		    
			this.initCallbacks();	
			this.listenTo(this,'change', this.render);
		},

		renderFilter : function(){
			if(!this.totalActiveUsers && this.totalActiveUsers.length < 0 && 
				!this.totalUsersWPictures && this.totalUsersWPictures.length < 0 && !this.totalUsersWTos && this.totalUsersWTos.length < 0){
				return;
			}
			var filterModel = {	
				totalActiveUsers : this.totalActiveUsers,
				totalUsersWPictures : this.totalUsersWPictures,
				totalUsersWTos : this.totalUsersWTos
			};
			this.$filterContainer.html(this.filterTemplate({
                model : filterModel
            }));

			this.$filterContainer.find('#timeScaleFilter').change(_.bind(function(){
				this.timeScale = $('#timeScaleFilter').val();				
				this.initCallbacks(true);
			}, this));
			this.$filterContainer.i18n($.i18n.options);	
		},

		counter1 : function (result,status,message){
			if(status == 'OK'){
				var sNumber = result.toString(),
                    output = [],
                    digits = 5;
                for(var i = 0; i<digits-sNumber.length; i++){
                    output.push(0);
                }

                for (var i = 0; i < sNumber.length; i++) {
                    output.push(+sNumber.charAt(i));
                }
                this.totalActiveUsers = output;
				this.renderFilter();										
			} else if (message=="NO_RIGHTS") {
				Backbone.trigger('NO_RIGHTS');				
			} else {
			console.log(message);
			}
		},

		counter2 : function (result,status,message){
			if(status == 'OK'){
				var sNumber = result.quantity.toString(),
                    output = [],
                    digits = 4;
                for(var i = 0; i<digits-sNumber.length; i++){
                    output.push(0);
                }

                for (var i = 0; i < sNumber.length; i++) {
                    output.push(+sNumber.charAt(i));
                }
                
                this.totalUsersWPictures.percentage = Number(result.percentage).toFixed(2);
                this.totalUsersWPictures.values = output;
				this.renderFilter();												
			} else if (message=="NO_RIGHTS") {
				Backbone.trigger('NO_RIGHTS');				
			} else {
			console.log(message);
			}
		},

		counter3 : function (result,status,message){
			if(status == 'OK'){
				var sNumber = result.quantity.toString(),
                    output = [],
                    digits = 4;
                for(var i = 0; i<digits-sNumber.length; i++){
                    output.push(0);
                }

                for (var i = 0; i < sNumber.length; i++) {
                    output.push(+sNumber.charAt(i));
                }
                this.totalUsersWTos.percentage = Number(result.percentage).toFixed(2);
                this.totalUsersWTos.values = output;
				this.renderFilter();									
			} else if (message=="NO_RIGHTS") {
				Backbone.trigger('NO_RIGHTS');				
			} else {
			console.log(message);
			}
		},

		initCallbacks : function(applyFilter){
			var nowTemp = new Date(),		
				toDate = new Date(),
				fromDate = new Date(nowTemp.getFullYear()-1, nowTemp.getMonth(), 1, 0, 0, 0, 0);						

			var fromStringDate = fromDate.getFullYear()+("0"+(fromDate.getMonth()+1)).slice(-2)+("0"+fromDate.getDate()).slice(-2);
            var toStringDate = toDate.getFullYear()+("0"+(toDate.getMonth()+1)).slice(-2)+("0"+toDate.getDate()).slice(-2);
        	
			smuServices.getNumberPeopleGiveStar(_.bind(this.callBackPeopleGiveStar, this), this.timeScale, fromStringDate, toStringDate);
			smuServices.getTotalStarSent(_.bind(this.callBackTotalStarsPerMonth, this), this.timeScale, fromStringDate, toStringDate);
			smuServices.getPercentageStarsByTime(_.bind(this.callBackPercentageByPlatform, this), this.timeScale, fromStringDate, toStringDate);
			smuServices.getAccessByTime(_.bind(this.callBackAccessByPlatform, this), this.timeScale, fromStringDate, toStringDate);
			smuServices.getStarsWithLikesAndComment(_.bind(this.callBackStarsWithLikesAndComment, this), this.timeScale, fromStringDate, toStringDate);
		},
		
		render : function() {	

			var model = {				
			};								
			
			this.$main.html(this.template({
				model : model
			}));

			if(this.timeScale === 'WEEK'){
				this.timeScaleToChart = $.t("analytics.filter.timeScale.week");
			}
			if (this.timeScale === 'MONTH') {
				this.timeScaleToChart = $.t("analytics.filter.timeScale.month");
			}
			if (this.timeScale === 'QUARTER') {
				this.timeScaleToChart = $.t("analytics.filter.timeScale.quarter");
			}
			
			//call all charts
			this.renderPeopleGiveStarChart();
			this.renderTotalStarsPerMonthChart();
			this.renderPercentageByPlatformChart();
			this.renderAccessByPlatformChart();
			this.renderStarsWithLikesAndCommentChart();

			this.chart1 = this.chart2 = this.chart3 = this.chart4 = this.chart5 = false;
			
			this.$main.i18n($.i18n.options);			
		},

		triggerRender : function(){
			if(this.chart1 && this.chart2 && this.chart3 && this.chart4 && this.chart5){
				this.trigger('change');	
			}			
		},
				
		callBackPeopleGiveStar : function (result,status,message){	
			if(status == 'OK'){
				this.peopleGaveStar = [$.t("analytics.peopleGiveStar")];
				this.xAxisPeopleGaveStar = [];
				if(result.length > 0){
					_.each(result, function(val, i){
						this.peopleGaveStar.push(val[2]);
						if(this.timeScale === 'DAY'){
							this.xAxisPeopleGaveStar.push(val[1]);
						} else {
							this.xAxisPeopleGaveStar.push(val[1] + "/" + val[0]);	
						} 						
					},this);
				}
				this.chart2 = true;
				this.triggerRender();								
			} else if (message=="NO_RIGHTS") {
				Backbone.trigger('NO_RIGHTS');				
			} else {
			console.log(message);
			}
		},

		callBackTotalStarsPerMonth : function (result,status,message){			
			if(status == 'OK'){
				this.totalStarSent = [$.t('analytics.totalStarSent')];
				this.xAxisTotalStarSent = [];
				if(result.length > 0){
					_.each(result, function(val, i){
						this.totalStarSent.push(val[2]);						
						if(this.timeScale === 'DAY'){
							this.xAxisTotalStarSent.push(val[1]);
						} else {
							this.xAxisTotalStarSent.push(val[1] + "/" + val[0]);	
						} 													
					},this);
				}
				this.chart1 = true;
				this.triggerRender();					
			} else if (message=="NO_RIGHTS") {
				Backbone.trigger('NO_RIGHTS');				
			} else {
			console.log(message);
			}
		},

		callBackPercentageByPlatform : function (result,status,message) {			
			if(status == 'OK'){
				this.percentageByPlatform.web = ["WEB"];
				this.percentageByPlatform.android = ["Android"];
				this.percentageByPlatform.ios = ["iOS"];
				this.xAxisPercentageByPlatform = [];
				_.each(result, function(val, i){
					var json = JSON.parse(val);				
					if(i === 'web'){					
						_.each(json, function(r){
							//fix % values for charts						
							this.percentageByPlatform.web.push(r[2]/100);
							if(this.timeScale === 'DAY'){
							this.xAxisPercentageByPlatform.push(r[1]);
							} else {
								this.xAxisPercentageByPlatform.push(r[1] + "/" + r[0]);	
							} 
						},this);
					}
					if(i === 'android'){
						_.each(json, function(r){						
							//fix % values for charts
							this.percentageByPlatform.android.push(r[2]/100);
						},this);
					}
					if(i === 'ios'){
						_.each(json, function(r){
							//fix % values for charts						
							this.percentageByPlatform.ios.push(r[2]/100);
						},this);
					}																		
				},this);				
				this.chart3 = true;
				this.triggerRender();								
			} else if (message=="NO_RIGHTS") {
				Backbone.trigger('NO_RIGHTS');				
			} else {
			console.log(message);
			}
		},

		callBackAccessByPlatform : function (result,status,message){
			if(status == 'OK'){
				this.accessPlatform.web = ["WEB"];
				this.accessPlatform.android = ["Android"];
				this.accessPlatform.ios = ["iOS"];
				this.xAxis.accessByPlatform = [];
				_.each(result, function(val, i){
					var json = JSON.parse(val);		
					if(i === 'web'){					
						_.each(json, function(r){						
							this.accessPlatform.web.push(r[2]);
							if(this.timeScale === 'DAY'){
							this.xAxis.accessByPlatform.push(r[1]);
							} else {
								this.xAxis.accessByPlatform.push(r[1] + "/" + r[0]);	
							} 
						},this);
					}
					if(i === 'android'){
						_.each(json, function(r){
							this.accessPlatform.android.push(r[2]);
						},this);
					}
					if(i === 'ios'){
						_.each(json, function(r){						
							this.accessPlatform.ios.push(r[2]);
						},this);
					}		
																		
				},this);				
				this.chart4 = true;
				this.triggerRender();								
			} else if (message=="NO_RIGHTS") {
				Backbone.trigger('NO_RIGHTS');				
			} else {
			console.log(message);
			}
		},

		callBackStarsWithLikesAndComment :  function (result,status,message){
			if(status == 'OK'){		
				this.starsWithLikesAndComment.comments = [$.t("analytics.comments")];
				this.starsWithLikesAndComment.likes = ["Likes"];
				this.starsWithLikesAndComment.total = ["total"];
				this.xAxis.accessByPlatform = [];
				var jsonTotal = JSON.parse(result["total"]);				
				_.each(result, function(val, i){
					var json = JSON.parse(val);					
					if(i === 'comments'){			
						_.each(json, function(r, i){						
							if(r[2] > 0){								
								this.starsWithLikesAndComment.comments.push(r[2]/jsonTotal[i][2])
							} else {
								this.starsWithLikesAndComment.comments.push(r[2]);
							}
							if(this.timeScale === 'DAY'){
							this.xAxis.accessByPlatform.push(r[1]);
							} else {
								this.xAxis.accessByPlatform.push(r[1] + "/" + r[0]);	
							} 
						},this);
					}
					if(i === 'likes'){
						_.each(json, function(r, i){
							if(r[2] > 0){								
								this.starsWithLikesAndComment.likes.push(r[2]/jsonTotal[i][2]);
							} else {
								this.starsWithLikesAndComment.likes.push(r[2]);
							}
						},this);
					}																		
				},this);	
				
				this.chart5 = true;
				this.triggerRender();

			} else if (message=="NO_RIGHTS") {
				Backbone.trigger('NO_RIGHTS');				
			} else {
			console.log(message);
			}
		},

		renderPeopleGiveStarChart : function (){			
			var chart = c3.generate({
				padding: {
				  	top: 10,
				  	bottom: 10,
				  	right: 10
				},
				legend: {
					show: false
				},				
			    bindto: '#chart-peopleGaveStar',
			    data: {
			    	columns: [
				    	this.peopleGaveStar
				    ]
			    },
			    axis: {
			    	y: {
            			label: $.t("analytics.peopleGiveStar")
        			},
			        x: {
			        	label: $.t("analytics.scale") + this.timeScaleToChart,
			        	tick: {			        		
			                rotate: 75,
                			multiline: false,
                			fit: true,
					    	centered: true
					    },
			        	type: 'category',
			            categories: this.xAxisPeopleGaveStar
			        },
			        height: 130
			    }			   
			}, this);
		},

		renderTotalStarsPerMonthChart : function (){			
			var chart = c3.generate({
				padding: {
				  	top: 10,
				  	bottom: 10,
				  	right: 10
				},
				legend: {
					show: false
				},				
			    bindto: '#chart-starsPerMonth',
			    data: {
			    	columns: [
				    	this.totalStarSent
				    ]
			    },
			    axis: {
			    	y: {
            			label: $.t('analytics.totalStarSent')      			
        			},
			        x: {
			        	label: $.t("analytics.scale") + this.timeScaleToChart,
			        	tick: {			        		
			                rotate: 75,
                			multiline: false,
                			fit: true,
					    	centered: true
					    },
			        	type: 'category',
			            categories: this.xAxisTotalStarSent
			        }
			    }			   
			}, this);
		},

		renderPercentageByPlatformChart : function (){
			var chart = c3.generate({
				padding: {
				  	top: 10,
				  	bottom: 10,
				  	right: 10
				},
				legend: {
					show: true
				},				
			    bindto: '#chart-starsPerPlataform',
			    data: {
			    	columns: [				    	
				    	this.percentageByPlatform.web,
				    	this.percentageByPlatform.android,
				    	this.percentageByPlatform.ios
				    ]
			    },
			    axis: {
			    	y: {
			    		padding: {top:2},
			    		max: 1,
            			min: 0,
            			label: $.t('analytics.starsPerPlataform'),
            			tick: {
            				format: d3.format(".2%")
            			}     			
        			},
			        x: {
			        	label: $.t("analytics.scale") + this.timeScaleToChart,
			        	tick: {			        		
			                rotate: 75,
                			multiline: false,
                			fit: true,
					    	centered: true
					    },
			        	type: 'category',
			            categories: this.xAxisPercentageByPlatform			            
			        }
			    }			   
			}, this);
		},
		
		renderAccessByPlatformChart : function (){
			var chart = c3.generate({
				padding: {
				  	top: 10,
				  	bottom: 10,
				  	right: 10
				},
				legend: {
					show: true
				},				
			    bindto: '#chart-activeUsers',
			    data: {
			    	columns: [				    	
				    	this.accessPlatform.web,
				    	this.accessPlatform.android,
				    	this.accessPlatform.ios
				    ]
			    },
			    axis: {
			    	y: {			    		
            			label: $.t('analytics.activeUsers')            			
        			},
			        x: {
			        	label: $.t("analytics.scale") + this.timeScaleToChart,
			        	tick: {			        		
			                rotate: 75,
                			multiline: false,
                			fit: true,
					    	centered: true
					    },
			        	type: 'category',
			            categories: this.xAxis.accessByPlatform           
			        }
			    }			   
			}, this);
		},
		
		renderStarsWithLikesAndCommentChart : function (){
			var chart = c3.generate({
				padding: {
				  	top: 10,
				  	bottom: 10,
				  	right: 10
				},
				legend: {
					show: true
				},				
			    bindto: '#chart-likesAndComments',
			    data: {
			    	columns: [				    	
				    	this.starsWithLikesAndComment.comments,
				    	this.starsWithLikesAndComment.likes
				    ]
			    },
			    axis: {
			    	y: {
			    		padding: {top:2},
			    		max: 1,
            			min: 0,		    		
            			label: $.t('analytics.likesAndComments'),
            			tick: {
            				format: d3.format(".2%")
            			}         			
        			},
			        x: {
			        	label: $.t("analytics.scale") + this.timeScaleToChart,
			        	tick: {			        		
			                rotate: 75,
                			multiline: false,
                			fit: true,
					    	centered: true
					    },
			        	type: 'category',
			            categories: this.xAxis.accessByPlatform           
			        }
			    }			   
			}, this);
		}
	});
	
	return AnalyticsView;
});
