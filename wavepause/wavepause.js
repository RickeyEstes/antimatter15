//worlds first bookmarklet to pause Google Wave searches.

(function(){
if(!window.elitist){
for(var i in window){
if(window[i]=="display")break;
}
for(var k in window){
if(typeof window[k] == "function"){
var iidx = window[k].toString().indexOf(".style["+i+"]");
if(iidx != -1){
if(window[k].toString().indexOf(".style["+i+"]",iidx) != -1){
if(window[k].length ==4){
if(window[k].toString().indexOf(".innerHTML") != -1){
break;
}
}
}
}
}
}
window.elitist = k;
window.magical = window[k];
}
if(window.searchplay){
window.searchplay = null;
window[elitist] = magical; //elitists are magical
alert("Wave Search has been Resumed.")
}else{
window.searchplay = true;
window[elitist] = function(){} //no op function
alert("Wave Search has been Paused. Run bookmarklet again to Resume.")
}
})()


