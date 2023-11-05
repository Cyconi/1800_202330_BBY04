let openSideBarE1 = document.getElementById("open-sideBar")
const sideBarE1 = document.getElementById("sideBar")
const closeSideBarE1 = document.getElementById("close-sidebar")

openSideBarE1.addEventListener("click", ()=>{
    sideBarE1.style.display = "block"
})

closeSideBarE1.addEventListener("click", ()=>{
    sideBarE1.style.display = "none"
})
