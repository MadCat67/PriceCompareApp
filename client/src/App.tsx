import React, { useState, useRef } from "react";
import "./App.css";

interface valTypes {
  smallest: string;
  largest: string;
  average: string;
  Pic?: any;
  LowLink?: string;
  HighLink?: string;
}

function App() {
  const Item = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<valTypes | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function sendData() {
    if (Item.current?.value === "") return;
    setError(null);
    setValues({
      smallest: "loading results...",
      largest: "loading results...",
      average: "loading results...",
    });

    try {
      console.log("Sending POST request to backend...");
      // First, send the item to the backend
      const postResponse = await fetch(`http://localhost:8000/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Item: Item.current?.value,
        }),
      });

      console.log("POST response:", postResponse.status);
      if (!postResponse.ok) {
        throw new Error("Failed to send search request");
      }

      console.log("Sending GET request to scrape endpoint...");
      // Then get the scraping results
      const response = await fetch(`http://localhost:8000/scrape`);
      console.log("Scrape response:", response.status);
      const data = await response.json();
      console.log("Received data:", data);

      if (data.passed) {
        setValues({
          Pic: data.image,
          smallest: "$" + data.cheapestPrice,
          largest: "$" + data.largestPrice,
          average: "$" + data.average,
          LowLink: `${data.LowLink}`,
          HighLink: `${data.HighLink}`,
        });
      } else {
        setValues(null);
        setError(
          data.error ||
            `The product you are looking for does not exist or is currently 
        unavailable, please look for a new item or try again later`
        );
      }
    } catch (err) {
      setValues(null);
      setError(
        "Failed to connect to the server. Please make sure the backend is running on port 8000."
      );
      console.error("Error:", err);
    }
  }

  return (
    <div>
      <h1>
        Search for an Item on Amazon and find it's average, highest, and lowest
        price
      </h1>
      <h2 className="error">{error}</h2>
      <div className="inputs">
        <div>
          <input
            className="txtBar"
            type="text"
            placeholder="search for a item"
            ref={Item}
          />
          <button className="btn" onClick={sendData}>
            Search
          </button>
        </div>
      </div>
      <div className="inputs">
        <div>
          <img className="image" src={`${values?.Pic}`} alt="product" />
          <p className="result">Average price for item: {values?.average}</p>
          <p className="result"> Lowest price for item: {values?.smallest}</p>
          <a className="result" href={values?.LowLink}>
            {" "}
            Link to lowest product{" "}
          </a>
          <p className="result"> Highest price for item: {values?.largest}</p>
          <a className="result" href={values?.HighLink}>
            {" "}
            Link to highest product{" "}
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
