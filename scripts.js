/* DOM declarations */
const list = document.querySelector(`form`)
const coinInput = document.querySelector(`#coin-choice`)
const coinResults = document.querySelector(`.test-result`)
const menuBtn = document.querySelector(`.hamburger`)
const nav = document.querySelector(`.navbar`)    
let elArray = []

//Prevents form from refreshing page
list.addEventListener(`submit`,(e)=>{
  e.preventDefault()
})
//EVT listner on input, searches for input
coinInput.addEventListener(`change`, (e)=>{
  let value = e.target.value
  return renderSuggestion(value) 
 })
//Toggles class for Hamburger element
menuBtn.addEventListener(`click`,()=>{
  nav.classList.toggle(`active`)
})



 
renderSuggestion(`xrp`)
  