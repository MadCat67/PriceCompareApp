import React,{useState, useRef} from 'react';
import './App.css';

function App() {
  const Item = useRef()
  const [Value, setValue] = useState('null')
  const [Image, setImage] = useState()
  const [cPrice, setCprice] = useState('null')
  const [test, setTest] = useState('none')

  async function FetchTest(){
    setTest('starting')
    const Res = await fetch('/test')
    const Data = await Res.json()
    setTest('DONEEEE')
    setTest(Data)
  }

  return (
    <div>
      <h1>Search for an Item on Amazon and find its average price</h1>
      <div class='inputs'>
        <div>
          <input class="txtBar" type='text' placeholder="search for a item" ref={Item}/>
          <button class="btn" onClick={sendData}>Search</button>
        </div>
      </div>
      <div class='inputs'>
        <div>
        <img class='image' src={`${Image}`} alt='ScrapedImage'/>
        <p class='result'>Average price of Amazon item: {Value}</p>
        <p class='result'> Cheapest price for item: {cPrice}</p>
        </div>
      </div>
      <p>{test}</p>
      <button onClick={FetchTest}> Test </button>
    </div>
  )
}

export default App;
