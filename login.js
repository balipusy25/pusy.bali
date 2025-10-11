let user = JSON.parse(localStorage.getItem('puysUser')) || null;
const googleLoginBtn = document.getElementById('google-login');
const facebookLoginBtn = document.getElementById('facebook-login');
const userNameDisplay = document.getElementById('user-name');

function updateUserUI() {
    if(user){
        userNameDisplay.textContent = `Hello, ${user.name}`;
        if(googleLoginBtn) googleLoginBtn.style.display='none';
        if(facebookLoginBtn) facebookLoginBtn.style.display='none';
    } else {
        if(userNameDisplay) userNameDisplay.textContent='';
        if(googleLoginBtn) googleLoginBtn.style.display='inline-block';
        if(facebookLoginBtn) facebookLoginBtn.style.display='inline-block';
    }
}

if(googleLoginBtn) googleLoginBtn.addEventListener('click', ()=>{
    user={name:'GoogleUser'};
    localStorage.setItem('puysUser',JSON.stringify(user));
    updateUserUI();
});

if(facebookLoginBtn) facebookLoginBtn.addEventListener('click', ()=>{
    user={name:'FacebookUser'};
    localStorage.setItem('puysUser',JSON.stringify(user));
    updateUserUI();
});

updateUserUI();
