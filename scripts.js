/* DOM declarations */
const list = document.querySelector(`form`)
const coinInput = document.querySelector(`#coin-choice`)
const coinResults = document.querySelector(`.test-result`)
const menuBtn = document.querySelector(`.hamburger`)
const nav = document.querySelector(`.navbar`)


/* Function to fetch a single coin based on the CoinID passed in, will append the result to the Coin Result DOM element  */
const idFetchMatch = (id)=>{
   const coin = fetchCoins(id)
    return coin;
        
}
const appendCoin = (item) => {
  /* Checks to see if this coin has users and is not just theoretical/scam */
  if (item.eur_market_cap > 0) {
  //Creates a div and declares its HTML
  const coinDomEL = document.createElement(`div`);
  
  coinDomEL.innerHTML = `<div class="card">
                           <h4 class="card-title">${item.coinId}</h4>
                           <p class="card-price">Price per coin (EUR): ${Math.round(item.eur * 100) / 100}</p>
                           <p class="card-marketCap">EU Marketcap: ${Math.round(item.eur_market_cap * 100) / 100}</p>
                           <p class="card-priceChange">Price change/24hrs(%): ${Math.round(item.eur_24h_change * 100) / 100}</p>
                        </div>`;
  
  return coinResults.appendChild(coinDomEL);

  }   
}

//Function that takes a coinId to create  a coin object 
const fetchCoins = async(coinId) =>{
  const priceURL = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=eur&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true` 
  const response = await fetch(priceURL);
  response.status === 200 ? console.log(`Success`) : console.log(`Nah mate`)
  const coins = await response.json();
  const info = coins[coinId];
  //Creates an object with coinId as a property
  const normalised = {coinId,...info};
  return normalised;
  
  };

//Function takes an array of coin matches, takes their ids and makes API calls, returning an array of objects
const callMatch = (matches) =>{
  //using map function to generate an Array of objects
   const matchArray = matches.map(async function(match){
    const id = match.id;
/*      debugger 
     try {

     } catch (e){

     } */
   return fetchCoins(id);
   })
   return Promise.all(matchArray);


  };

  
//Takes the user's input to create an array of matches. these will then 
const allMatches = (searchString) =>{
  //define an empty arr, matches which will hold all instances where the result's item.name/symbol property 
   let matches = [];
   //Loops through the array and checks if the searchstring is a match and pushes it into the array
   coinNameArr.forEach(item=>{
   if (item.name.toLowerCase().includes(searchString)){
      matches.push(item);
     } else if (item.symbol.toLowerCase().includes(searchString)) {
      matches.push(item);      
    } 
    
   });
   //Function that makes API calls for each array element and returns an array of objects
    const renderedMatches = ()=> callMatch(matches).then((results => [...results]))
   //Function that takes the array of objects, awaits the resolved promise, and appends a DOM element for each array el
    const appendMatchDOM = async () =>{

         let DOMelList = await renderedMatches();
         coinResults.innerHTML = ` `;
         DOMelList.forEach(item=>{
           
          appendCoin(item);
         });
        
        
      };
      return appendMatchDOM();
      
};

//Tests that the search string at least has some matches, if it does, it will use callback function to generate DOM elements
const renderSuggestion=  (searchString)=>{
  //Const declarations: Removes whitespace and makes text lowercase, 
  const normalisedTxt = searchString.toLowerCase().trim(),
  //Returns the index of a coin which has a exact id match to seach string, similar below
    idMatchIndex = coinNameArr.findIndex(item=> item.id.toLowerCase() === normalisedTxt),
    symbolMatchIndex = coinNameArr.findIndex(item => item.symbol.toLowerCase().includes(normalisedTxt)),
    nameMatchIndex = coinNameArr.findIndex(item => item.name.toLowerCase().includes(normalisedTxt));
    //If a coins id matches the search string just make a search for that coin
    if (idMatchIndex > -1) {
    coinResults.innerHTML = ` `;
   
    idFetchMatch(normalisedTxt).then(
        res => appendCoin(res)
      )
    }
    //If no exact match search the array for partial matches of symbol and names of coins
    else if (symbolMatchIndex > -1){
        return allMatches(normalisedTxt);
    } else if (nameMatchIndex > -1){
        return allMatches(normalisedTxt);
        } else {
          //If no match at all:
        return `Sorry no matches for this coin!`
    }
 };
       

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
/* const card = document.querySelectorAll(`.card`)    
  card.forEach(card=>card.addEventListener(`click`,()=>{
      console.log(true)
  }))
 */