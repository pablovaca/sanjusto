/*global define*/
'use strict';
define([], function () {

    /**
     * Singleton Pattern
     */
    var instance = null;
    function SocialNetworkServices(){
        if(instance !== null){
            throw new Error('Cannot instantiate more than one instance, use: SocialNetworkServices.getInstance()');
        }
    }

    SocialNetworkServices.getInstance = function(){
        if(instance === null){
            instance = new SocialNetworkServices();
        }
        return instance;
    }

    //
    // private methods
    //
    var settings = {};
    //Default application settings
    var defaultSettings = {
            facebookAppId : '626507627476468',
            facebookApiVer : 'v2.2'
    };
    var twitter;
    
    try
    {
        if(appSettings != null && appSettings.facebookAppId != null){
            settings = appSettings;
        }else{
            settings = defaultSettings;
        }
    }
    catch(ex){
        settings = defaultSettings;
        console.error('Using default settings');
    }

    var facebookIsReady = false;
    var twitterIsReady = false;

    var TWITTER_CLIENT_ID = 'XBFL33SHsiSVsl7jlzYRtHEdc';

    var GOOGLE_CLIENT_ID = '227731822866-2hjdjienfgvv1k256i7fka6c9qska9ec.apps.googleusercontent.com';

    var LINKEDIN_CLIENT_ID = '78jqtoz3w2xaoz';

    function facebookInitialization(){
        if(!facebookIsReady){
            window.fbAsyncInit = function() {
                FB.init({
                  appId      : settings.facebookAppId,
                  xfbml      : true,
                  version    : settings.facebookApiVer
                });
              };

              var d=document,s='script',id='facebook-jssdk';
              var js, fjs = d.getElementsByTagName(s)[0];
              if (d.getElementById(id)) {d.getElementById(id).parentNode.removeChild(d.getElementById(id))}
              js = d.createElement(s); js.id = id;
              js.src = "//connect.facebook.net/en_US/sdk.js";
              fjs.parentNode.insertBefore(js, fjs);

              facebookIsReady = true;
        }
    }

    function twitterInitialization(d,s,id){
        hello.init({
            'twitter' : TWITTER_CLIENT_ID
        },
        {
            //redirect_uri: '#/socialNetworkRedirect/',
            //oauth_proxy: OAUTH_PROXY_URL
        });

        if(!twitterIsReady){
            var d=document,s='script',id='twitter-wjs';
            var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';
            if (d.getElementById(id)) {d.getElementById(id).parentNode.removeChild(d.getElementById(id))}
            js=d.createElement(s);
            js.id=id;
            js.src=p+'://platform.twitter.com/widgets.js';
            fjs.parentNode.insertBefore(js,fjs);

            twitterIsReady = true;
        }
        else{
            try{
                twttr.widgets.load();
            }
            catch(e){
            }
        }
    }

    function googlePlusInitialization(){
        hello.init({
            google : GOOGLE_CLIENT_ID
        },
        {
            scope : 'email'
        });
    }

    function linkedInInitialization(){
        hello.init({
            linkedin : LINKEDIN_CLIENT_ID
        },
        {
            redirect_uri: 'redirect.html'
        });
    }

    //
    // public methods through prototyping
    //
    SocialNetworkServices.prototype = {

            initialize : function(){
                twitterInitialization();
                facebookInitialization();
                googlePlusInitialization();
                linkedInInitialization();
            },

            /* FACEBOOK SECTION */

            facebookRender : function(){
                FB.XFBML.parse();
            },

            facebookIsReady : function(){
                return facebookIsReady;
            },

            facebookLogIn : function(callback){
                FB.login(function(response) {
                    if(callback){
                        callback(response);
                    }
                }, {scope: 'public_profile,email'});
            },

            facebookLogOut : function(callback){
                FB.logout(function(response) {
                    if(callback){
                        callback(response);
                    }
                });
            },

            facebookEventSuscribe : function(eventName, callbak){
                FB.Event.subscribe(eventName, callbak);
            },

            twitterLogIn : function(callback){
                twitter = hello('twitter');
                twitter.login(function(response){

                    if(callback){
                        callback(response);
                    }

                });
            },

            twitterCheckLogInState : function(){

            },

            twitterLogOut : function(){

            },

            googlePlusLogIn : function(callback){
                hello('google').login( { response_type:'code' }, function(response){
                    if(callback){
                        callback(response);
                    }
                } );
            },

            googlePlusLogOut : function(){

            },

            linkedInLogIn : function(callback){
                hello('linkedin').login(function(response){
                    if(callback){
                        callback(response);
                    }
                } );
            },

            linkedInLogOut : function(){

            },

            linkedInGetSkills : function(callback){
                hello( "linkedin" ).api("me").then(function(json){
                    if(callback){
                        callback(json);
                    }
                }, function(e){
                    alert("Whoops! " + e.error.message );
                });
            }
    };

        return SocialNetworkServices.getInstance();
});