//---------------------------------------------------
// This function loads the parts of your skeleton 
// (navbar, footer, and other things) into html doc. 
//---------------------------------------------------
function loadSkeleton() {
    console.log($('#header-Comp').load('./Components/header-bar.html'));
    console.log($('#nav-Comp').load('./Components/nav-bar.html'));
}
loadSkeleton();  //invoke the function