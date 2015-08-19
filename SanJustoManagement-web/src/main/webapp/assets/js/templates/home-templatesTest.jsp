<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<script id="TestApi" type="text/template">
    <div class="container">
		<h4>Test API from inside</h4>
		<button onclick="getOrganizationValue()" value="orgValue">Get Organization Value</button>
		<div id="resultView" class="row"></div>
		<button onclick="login()" value="orgValue">login</button>
		<div id="loginView" class="row"></div>
    </div>
</script>
<script id="OrgValue" type="text/template">
	<div class="container">
		id: <?=model.id?>, name: <?=model.name?>, description: <?=model.description?>, organization name: <?=model.organization.name?>
	</div>
</script>
<script id="LoginInfo" type="text/template">
	<? console.log(obj); ?>
	<div class="container">
		token: <?=model.token?>
	</div>
</script>