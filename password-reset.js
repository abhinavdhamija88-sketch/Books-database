export function validateNewPassword(password,confirmation){
 if(password.length<8)return 'Use at least 8 characters for your new password.';
 if(password!==confirmation)return 'The passwords do not match.';
 return '';
}

export function setupPasswordReset(cloud,notice){
 const $=id=>document.getElementById(id);
 const incoming=new URL(location.href);
 const hash=new URLSearchParams(incoming.hash.slice(1));
 let recoveryRequested=incoming.searchParams.get('reset')==='1'||hash.get('type')==='recovery';
 const linkError=hash.has('error')||incoming.searchParams.has('error');
 const clearResetUrl=()=>{const url=new URL(location.href);url.searchParams.delete('reset');url.searchParams.delete('error');url.searchParams.delete('error_code');url.searchParams.delete('error_description');url.hash='';history.replaceState(null,'',url.pathname+url.search);};
 $('forgot-password').onclick=async()=>{
  if(!cloud)return;
  if(!$('email').reportValidity())return;
  $('forgot-password').disabled=true;$('login-error').textContent='';$('reset-request-status').textContent='';
  try{
   const redirectTo=new URL('/',location.origin);redirectTo.searchParams.set('reset','1');
   const {error}=await cloud.auth.resetPasswordForEmail($('email').value.trim(),{redirectTo:redirectTo.href});
   if(error)throw error;
   $('reset-request-status').textContent='If this email has an account, a reset link will be sent. Check your inbox and spam folder.';
  }catch(error){$('login-error').textContent=error.message||'Could not send the reset email. Please try again.';}
  finally{$('forgot-password').disabled=false;}
 };
 const close=()=>{$('password-reset').close();$('new-password').value='';$('confirm-password').value='';clearResetUrl();};
 $('close-password-reset').onclick=close;
 $('password-reset').addEventListener('cancel',()=>{clearResetUrl();$('new-password').value='';$('confirm-password').value='';});
 $('password-reset-form').onsubmit=async event=>{
  event.preventDefault();
  const password=$('new-password').value;
  const validation=validateNewPassword(password,$('confirm-password').value);
  $('password-reset-error').textContent=validation;if(validation||!cloud)return;
  $('password-reset-submit').disabled=true;$('close-password-reset').disabled=true;
  try{
   const {data:{session}}=await cloud.auth.getSession();
   if(!session)throw new Error('This reset link has expired. Request a new link from Owner sign in.');
   const {error}=await cloud.auth.updateUser({password});if(error)throw error;
   close();notice('Your password has been updated. Use the new password next time you sign in.');
  }catch(error){$('password-reset-error').textContent=error.message||'Could not update your password. Please try again.';}
  finally{$('password-reset-submit').disabled=false;$('close-password-reset').disabled=false;}
 };
 async function resume(force=false){
  if(!cloud||(!recoveryRequested&&!force))return;
  recoveryRequested=false;
  if(linkError&&!force){notice('This reset link is invalid or has expired. Open Owner sign in and request a new password reset email.');clearResetUrl();return;}
  const {data:{session},error}=await cloud.auth.getSession();
  if(error||!session){notice('This reset link is invalid or has expired. Open Owner sign in and request a new password reset email.');clearResetUrl();return;}
  $('login').close();$('editor').close();$('password-reset-error').textContent='';
  if(!$('password-reset').open)$('password-reset').showModal();
 }
 return {resume,onAuthEvent(event){if(event==='PASSWORD_RECOVERY')setTimeout(()=>resume(true).catch(()=>notice('Unable to open password reset. Please request a new link.')),0);}};
}
