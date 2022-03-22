/*
Summary:
- Right now this code is responsible for making the hamburger menu functional/dynamic.
- When a user clicks the hamburger icon, the following code will activate certain CSS classes
  that will bring up the sidebar.
*/

// 'Hamburger' is the hamburger icon. Hamburger links are text within the sidebar.
const hamburger = document.querySelector(".flexbox-navbar-hamburger")
const hamburgerLinks = document.querySelector(".flexbox-navbar-text")
const sidebar = document.querySelector(".sidebar")
// The close button refers to the 'Close' text within the sidebar. 
const closeBtn = document.querySelector(".close-btn")


// When a user clicks on the hamburger icon activate the following code...
hamburger.addEventListener("click", () => {
    // Activate/deactivate the following CSS classes
    hamburger.classList.toggle("active");
    hamburgerLinks.classList.toggle("active");
    sidebar.classList.toggle("active");
})

// When a user clicks on the close button within the sidebar activate the following code...
closeBtn.addEventListener("click", () => {
    // Activate/deactivate the following CSS classes
    hamburger.classList.toggle("active");
    hamburgerLinks.classList.toggle("active");
    sidebar.classList.toggle("active");
})