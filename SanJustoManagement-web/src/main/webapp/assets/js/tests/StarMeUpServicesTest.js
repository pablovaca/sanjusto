/***********************************
 * Este código se mantiene duplicado por el momento hasta
 * implementar jazmin para los unit tests del javascript
 */
function callBackTest(result,status,message)
{
    console.log("BEGIN callBackTest");
    console.log(result);
    console.log("END callBackTest");
}


function StarMeUpServicesTest()
{
    var starMeUpServices = new StarMeUpServicesClass();

    console.log("BEGIN LOGIN");
    starMeUpServices.login(callBackTest,"peter@qastarmeup.com","rootuserstarmeup");
    console.log("END LOGIN");

//    console.log("BEGIN getTalentTree");
//    starMeUpServices.getTalentTree(callBackTest);
//    console.log("END getTalentTree");

//    console.log("BEGIN getLanguages");
//    starMeUpServices.getLanguages(callBackTest);
//    console.log("END getLanguages");
//
//    console.log("BEGIN getLanguagesById");
//    starMeUpServices.getLanguagesById(callBackTest);
//    console.log("END getLanguagesById");

    console.log("BEGIN getOrganizationValues");
    starMeUpServices.getOrganizationValues(callBackTest,true);
    console.log("END getOrganizationValues");

}



function StarMeUpServicesClass(makeAsyncCall)
{
    var appVersion = '1';
    var origin = 'w';
    var settings = {};
	//Default application settings
    var defaultSettings = {
    		apiUrl : '/starmeup-api'
    };

    try
    {
	    if(appSettings != null){
	    	//If appSettings exists use the settings specified in the file
	    	settings = appSettings;
	    	console.log('Using settings of the environment: ' + settings.environment);
	    }else{
	    	//Setup default settings
	    	settings = defaultSettings;
	    	console.log('Using default settings');
	    }
    }
    catch(ex){
    	//Setup default settings
    	settings = defaultSettings;
    	console.log('Using default settings');

    	//Console log enabled in dev environment
    	window.starMeUpDebug(true);
    }
    //**********************************************************************************/
    //public
    //**********************************************************************************/
    this.setToken=function(tokenParam)
    {
        token=tokenParam;
    }

    this.isLoggedIn=function(){
      return (token && token.length>10);
    }

    this.login=function (functionToCall, email,password) {
        var request={};
        request.email=email;
        request.password=password;
        request.v=appVersion;
	    request.o=origin;

        $.ajax({
            url:settings.apiUrl + "/v2/sec/authenticateuser",
            type: "POST",
            async:false,
            data:request,
            success:function(data,status,jqxhr){
                if (data.status == "OK") {
                	if(data.token != null && data.token != ''){
                		token=data.token;
                	}
                    if (functionToCall) {
                        functionToCall(data.result,data.status,data.message);
                    }
                } else {
                    console.log(data.message);
                    token = "";
                    functionToCall(data.result,data.status,data.message);
                }
            },
            error:function(jqxhr,status,message){
                console.log(message);
            },

            dataType:"json"
         });
    };

    this.getTalentTree=function(functionToCall) {
        var request=getBasicRequest();
        request.search="test";
        callTalentService("GET","/tree",request,functionToCall,null);
    }

    this.getLanguages=function(functionToCall) {
        var request=getBasicRequest();
        callStellarService("GET","/languages",request,functionToCall,null);
    }

    this.getLanguagesById=function(functionToCall) {
        var request=getBasicRequest();
        callStellarService("GET","/languages/2",request,functionToCall,null);
    }

    this.getOrganizationValues=function (functionToCall,onlyEnabled,handleErrors)
    {
        var request=getBasicRequest();
        callStellarService("GET","/organizationvalues/"+onlyEnabled,request,functionToCall,handleErrors);
    }

    //**********************************************************************************/
    //private
    //**********************************************************************************/
    var token = "";
    var asyncCall=false;
    if (makeAsyncCall)
      asyncCall=makeAsyncCall;

    function getBasicRequest() {
        var request={};
//        request.token=token;
        request.v=appVersion;
        request.o=origin;
        return request;
    }

    function callStellarService (typeCall, urlAction, request, functionToCall, handleErrors) {
        callBackEnd("v2/stellar",typeCall,urlAction,request,functionToCall,handleErrors)
    }

    function callTalentService (typeCall, urlAction, request, functionToCall, handleErrors) {
        callBackEnd("v2/talent",typeCall,urlAction,request,functionToCall,handleErrors)
    }

    function callAdministrationService (typeCall, urlAction, request, functionToCall, handleErrors) {
        callBackEnd("v2/admin",typeCall,urlAction,request,functionToCall,handleErrors)
    }

    function callBackEnd (service,typeCall, urlAction, request, functionToCall, handleErrors) {
        var urlService=settings.apiUrl + "/"+ service + urlAction;

        $.ajax({
            url:urlService,
            headers:{
                'token':token
            },
            type: typeCall,
            async:true,
            data:request,
            success:function(data,status,jqxhr){
                if (data.status == "OK") {
                	if(data.token != null && data.token != ''){
                		token=data.token;
                		setCookie(COOKIE_TOKEN_KEY,token,EXPIRE_HOURS);
                	}
                    if (functionToCall) {
                        functionToCall(data.result, data.status, data.message);
                    }
                } else if(data.status == "MAINTENANCE"){
                	relocateToMaintenancePage();
                }
                else
                {
	               	logServerError(data.status,data.message);
	               	functionToCall(data.result, data.status, data.message);
                }
            },
            error:function(jqxhr,status,message){
            	logServerError(status,message);

            	if(handleErrors == null || handleErrors == 'undefined' || handleErrors){
            		notifyErrorsToHandler(jqxhr);
            	}
            },
            dataType:"json"
         });
    }

}