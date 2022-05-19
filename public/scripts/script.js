// console.log("SCRIPT LOADED")

/*
Summary:
- Right now this code is responsible for making the hamburger menu functional/dynamic.
- When a user clicks the hamburger icon, the following code will activate certain CSS classes
  that will bring up the sidebar.
*/
// 'Hamburger' is the hamburger icon. Hamburger links are text within the sidebar.
const hamburger = document.querySelector(".flexbox-navbar-hamburger")
// const hamburgerLinks = document.querySelector(".flexbox-navbar-text")
const sidebar = document.querySelector(".sidebar")
// The close button refers to the 'Close' text within the sidebar. 
const closeBtn = document.querySelector(".close-btn")


// When a user clicks on the hamburger icon activate the following code...
hamburger.addEventListener("click", () => {
    // Activate/deactivate the following CSS classes
    hamburger.classList.toggle("active");
    // hamburgerLinks.classList.toggle("active");
    sidebar.classList.toggle("active");
})

// When a user clicks on the close button within the sidebar activate the following code...
closeBtn.addEventListener("click", () => {
    // Activate/deactivate the following CSS classes
    hamburger.classList.toggle("active");
    // hamburgerLinks.classList.toggle("active");
    sidebar.classList.toggle("active");
})


// --------------------- For popup window in patient specifics ----------------------
// These buttons are used to activate the popup menu and the dark backgroundMasker behind it.
const openPopupButtons = document.querySelectorAll('[data-modal-target]')
const closePopupButtons = document.querySelectorAll('[data-close-button]')
const backgroundMasker = document.getElementById('backgroundMasker')

openPopupButtons.forEach(button => {
  button.addEventListener('click', () => {
    const modal = document.querySelector(button.dataset.modalTarget)
    openModal(modal)
  })
})

backgroundMasker.addEventListener('click', () => {
  const modals = document.querySelectorAll('.modal.active')
  modals.forEach(modal => {
    closeModal(modal)
  })
})

closePopupButtons.forEach(button => {
  button.addEventListener('click', () => {
    const modal = button.closest('.modal')
    closeModal(modal)
  })
})

function openModal(modal) {
  if (modal == null) return
  modal.classList.add('active')
  backgroundMasker.classList.add('active')
}

function closeModal(modal) {
  if (modal == null) return
  modal.classList.remove('active')
  backgroundMasker.classList.remove('active')
}

//Clinician Responsive Tabs//
function opentab(evt, tabname) {
    // Declare all variables
    var i, tabcontent, tablinks;
  
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabname).style.display = "block";
    evt.currentTarget.className += " active";
}

  // Get the element with id="defaultOpen" and click on it
    document.getElementById("defaultOpen").click();
