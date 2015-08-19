/*global define*/
define([
    'jquery',
    'underscore',
    'backbone',
    'config',
    'collections/activity-feed-collection',
    'services/StarMeUpServices',
    'utils/StellarFunctions',
    'd3'
], function ($, _, Backbone, Config, ActivityFeedCollection, Smu, Global, d3) {
    'use strict';

    Config.setUp();
    var theNode = null; // TODO: There are unsolved problems with the "this" context and I could't replace theNode by this.node
    var theLink = null; // TODO: There are unsolved problems with the "this" context and I could't replace theLink by this.link

    var AnimationView = Backbone.View.extend({
        el : '#app',
        className : 'row',
        activityFeedCollection : {},
        currentUser : {},
        connectedUser : {},
        container : '',
        orientation : 'DESC',
        home : 'HOME-ACTIVITY',
        homeFilter : false,
        profileFilter : 'ALL',
        connectedUserIsAdmin : false,
        activityFeedPage : 0,
        activitiesDisplayed : [],
        lastStarId : 0,
        selectedActivityId: null,
        additionalInfo : {},

        initialize : function(container) {
        	Smu.loadCss('assets/content/starmeup/css/starsAnimation.css');
        	
        	this.$main = this.$('#' + container);
            this.$main.html('');
            this.container = container;
            this.activityFeedCollection = new ActivityFeedCollection();
            this.firstStarId = 0;
            this.instanceId =  Math.random(); // To identify each instance and check for memory leaks. 
            
            this.interval1 = 150
            this.interval2 = 30000
            this.linkDistance = 70;
            this.charge = -2000;
            this.friction = 0.1;
            this.maxAddedLinks = 500;
                        
            Smu.getUserByToken(_.bind(function (result, status, message, additionalInfo) {
                if(status == 'OK'){
                	this.currentUser = result;
                	this.setUpAnimationTimer();
                }
            }, this));
        },
        
        /**
         * private function
         */
        addUserToNodes : function(userId) {
            var node = this.usersById[userId];
            if (!node) {
                console.log("Cannot find user:"+userId);
                return;
            }
            if (node.id != userId) {
                console.log("node.id!=userId:"+userId);
                return;
            }
            node.x = this.width/2;
            node.y = this.height/2;
            node.position = this.nodes.length;
            node.imageURL = "../photoInCircle/"+node.email+".png"
            node.sizeR = 32;

            this.nodes.push(node);
            this.addedNodesById[userId]=node;
        },

        /**
         * private function
         */
        tick : function() {
            theLink.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            theNode.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
            
            theNode.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
        },

        /**
         * private function
         */
        makeNewFill : function(d) {
            var picturePattern = theNode.append("pattern")
                .attr("id", "picturePattern"+d.profileImageId)
                .attr("height", 1)
                .attr("width", 1)
                .attr("x", "0")
                .attr("y", "0")
            //var imgurl = "https://www.starmeup.com/starmeup-api/v2/image/profile/"+d.profileImageId
            var imgurl = this.apiUrl +"/v2/image/profile/"+d.profileImageId
            picturePattern.append("image")
                .attr("x", 0)
                .attr("y", 0)
                .attr("height", d.sizeR)
                .attr("width", d.sizeR)
                .attr("xlink:href", imgurl)
            return "url(#picturePattern"+d.profileImageId+")"
        },

        /**
         * private function
         */
        restart: function() {
            console.log('restart, this.instanceId =', this.instanceId, ' this.intervalId1=', this.intervalId1,' this.intervalId2=', this.intervalId2);
            var that = this;
            theLink = theLink.data(this.links);
            theLink.enter().insert("line")
                .attr("class", "link");
            theNode = this.svg.selectAll(".node").data(this.nodes);
            theNode.enter().insert("g")
                .attr("class", "node")
                .call(this.force.drag)
                .append("circle")
                .attr("r", function(d) { return d.sizeR/2; })
                .attr("cy", 0)
                .attr("cx", 0)
                .attr("fill", function(d) {return that.makeNewFill(d)})
                .append("title").text(function(d) { return d.firstlastname; });
            this.force.start();
        },

        /**
         * private function
         */
        addALink : function() {
            if (this.addedLinks >= this.maxAddedLinks) { return;}
            if (this.addedLinks >= this.graphLinks.length) return;
            var linkToAdd = this.graphLinks[this.addedLinks++];

            var sourceId = linkToAdd.source;
            if (this.addedNodesById[sourceId] == null) {
                this.addUserToNodes(sourceId);
            }
            linkToAdd.source = this.addedNodesById[sourceId].position;

            var targetId=linkToAdd.target;
            if (this.addedNodesById[targetId] == null) {
                this.addUserToNodes(targetId);
            }
            linkToAdd.target = this.addedNodesById[targetId].position;

            linkToAdd.value = 1;
            this.links.push(linkToAdd);
            this.restart();
        },

        /**
         * private function
         */
        init3d : function() {
            var that = this;
            var theGraph = this.graph;
            this.graphLinks = theGraph.links;
            theGraph.nodes.forEach( function(user) { that.usersById[user.id] = user;});
            var fill = d3.scale.category20();
            this.force = d3.layout.force()
                .size([this.width, this.height])
                .nodes([])
                .linkDistance(that.linkDistance)
                .charge(that.charge)
                .friction(that.friction)
                .on("tick", this.tick);
            this.svg = d3.select(this.element).append("svg")
                .attr("width", this.width)
                .attr("height", this.height)
                .style("border", "solid 2px black")
            this.svg.append("rect")
                .attr("y", 0)
                .attr("x", 0)
                .attr("width", this.width)
                .attr("height", this.height)
                .style("fill", "#c5b0d5")
            this.nodes = this.force.nodes();
            this.links = this.force.links();
            theNode = this.svg.selectAll(".node");
            theLink = this.svg.selectAll(".link");
            that.intervalId1 = setInterval(function() {
                  that.addALink();
                }, that.interval1);
        },

        renderStars : function(container, graph, apiUrl) {
            $('#'+this.container).html('');
            this.width = $(window).width();
            this.height = $(window).height();
            this.graph = graph;
            this.element = '#'+container;
            this.apiUrl = apiUrl;

            this.graphLinks = null;
            this.addedLinks = 0;
            this.addedNodesById = {};
            this.usersById = {};
            //window.color = d3.scale.category10();

            this.init3d();
            $('body').css('display','');
        },

        render : function() {
            if (this.intervalId1) {
                console.log('clearing interval')
                clearInterval(this.intervalId1);
                this.intervalId1 = null;
            }
            var that=this;
            var graph = that.getGraphFromCollection();
            setTimeout(function(){ that.renderStars(that.container, graph, appSettings.apiUrl); }, 100);
        },

        refreshFeed: function() {
        	console.log('refreshFeed');
          	//var userId  = 0;
        	console.log('this');
        	console.log(this.currentUser);
        	console.log(this.currentUser.id);
          	var userId  = this.currentUser.id;
            console.log('before calling allFillCollectionDescForAnimation');
            this.activityFeedPage = 0;
            this.activitiesDisplayed = [];
            this.activityFeedCollection = new ActivityFeedCollection(); // Warning! Potential memory leak
            this.activityFeedCollection.allFillCollectionDescForAnimation(userId, this.firstStarId, this.profileFilter, this.activityFeedPage);
            this.listenTo(this.activityFeedCollection, 'ready', _.bind(this.render, this));

        },

        setUpAnimationTimer: function() {
          console.log('setUpAnimationTimer');
          var that = this;
          this.refreshFeed();
          this.intervalId2 = setInterval(_.bind(function() {
              that.refreshFeed();
              }, this), that.interval2);
        },

        close : function() {
            $('#'+this.container).html('');
            if (this.intervalId2) {
                clearInterval(this.intervalId2);
                this.intervalId2 = null;
            }
            if (this.intervalId1) {
                console.log('clearing interval');
                clearInterval(this.intervalId1);
                this.intervalId1 = null;
            }
        },

        getGraphFromCollection : function() {
            var nodesHash = [];
            function addNode(feedNode) {
                if (!nodesHash[feedNode.id]) {
                    var node = feedNode; // warning: aliased
                    node.firstlastname = feedNode.lastName;
                    nodesHash[feedNode.id] = {
                        id : feedNode.id,
                        firstName : feedNode.firstName,
                        lastName : feedNode.lastName,
                        firstlastname : feedNode.lastName,
                        profileImageId : feedNode.profileImageId
                    };
                }
            }
            var links = [];
            this.activityFeedCollection.each(function(item, index){
                var from = item.get('from');
                var to = item.get('to');
                addNode(from);
                addNode(to);
                var link = {
                  source : from.id,
                  target : to.id,
                  date : "2015-05-30"
                };
                links.push(link)
            });
            var nodes = []
            for(var i in nodesHash) {
                nodes.push(nodesHash[i]);
            }
            var graph = {nodes:nodes, links:links}
            return graph;
        },

        loadNextPage :  function(){
        }
    });
    return AnimationView;
});
