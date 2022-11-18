function validate()
		{
			userid=document.getElementById("uid").value;
			name=document.getElementById("name").value;
			pwd=document.getElementById("pwd").value;
			cpwd=document.getElementById("cpwd").value;
			if (userid == '')
			{
				alert('Please enter a userid');
				return false;
			}
			if (name == '')
			{
				alert('Please enter your name');
				return false;
			}
			if (pwd == '')
			{
				alert('Please create a password');
				return false;
			}
			if (cpwd == '')
			{
				alert('Please confirm your password');
				return false;
			}
			if (pwd === cpwd)
			{	
				document.getElementById("user_form").submit();
			}
			else
			{
				alert("Password and confirm password not matching");
				pwdp = document.getElementById("pwdp");
				cpwdp = document.getElementById("cpwdp");
				pwdp.innerHTML='<input type="password" id="pwd" name="pwd" placeholder="Create your password" required>';
				cpwdp.innerHTML='<input type="password" id="cpwd" placeholder="Re-enter your password" required>';
				return false;
			}
		}