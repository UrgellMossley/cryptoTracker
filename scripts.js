/* DOM declarations */
const list = document.querySelector(`form`)
const coinInput = document.querySelector(`#coin-choice`)
const coinResults = document.querySelector(`.test-result`)
const menuBtn = document.querySelector(`.hamburger`)
const nav = document.querySelector(`.navbar`)   

let elArray = []
let pinArray = storedCoins()


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

//Using moment JS we can generate an array of the last 30 days 
    //Still in Beta, does not take into account months with 30 days
    const DAYS = () => {
      //declare the array
      const days = []
      //start point
      const dateStart = moment()
      //end point
      const dateEnd = moment().add(30, `days`)
      //while loop pushing dates into the array
      while (dateEnd.diff(dateStart, `days`) >= 0) {
       days.push(dateStart.format(`D`))
       dateStart.add(1, `days`)
      }
      //returns days array
      return days
    }
renderSuggestion(`xrp`)

