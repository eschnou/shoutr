<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"> 
<html xmlns="http://www.w3.org/1999/xhtml"> 
	<head>	
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" >		
		<title>{{fn}} | Social web feed</title>
	</head>		
	<body>		
		<div id="container">
			<div id="profile" class="entity_profile vcard author"> 
		       <h2>User profile</h2> 
		       <dl class="entity_depiction"> 
		        <dt>Photo</dt> 
		        <dd> 
		        	<img src="{{avatar}}" class="photo avatar" width="96" height="96" alt="{{nickname}}"/> 
				</dd> 
			   </dl>
		       <dl class="entity_nickname"> 
		        <dt>Nickname</dt> 
		        <dd> 
		         <a href="{{profile}}" rel="me" class="nickname url uid">{{nickname}}</a> 
				</dd> 
			   </dl> 
		       <dl class="entity_fn"> 
		        <dt>Full name</dt> 
		        <dd> 
		         <span class="fn">{{fullname}}</span> 
		        </dd> 
			   </dl> 
		       <dl class="entity_location"> 
		        <dt>Location</dt> 
		        <dd class="label">{{location}}</dd> 
		       </dl> 
		       <dl class="entity_note"> 
		        <dt>Note</dt> 
		        <dd class="note">{{note}}</dd> 
			   </dl> 
			</div> 
	   		<div id="stream"> 
				{{#updates}}
	 			<div class="entry">
					<div class="updated">{{postedTime}}</div>
					<div class="content">{{title}}</div>		
	  			</div>
				{{/updates}}
			</div>
		</div>
	</body>
</html>   

