import "./App.css";

const headers = new Headers();
headers.append("Content-Type", "application/json");

async function getData() {
  const response = await fetch("http://localhost:3000/api/contacts", {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error("Error fetching API");
  }

  let data;

  try {
    data = await response.json();
    return data;
  } catch (e) {
    console.log("Error fetching data:", (e as Error).message);
  }
}

function App() {
  return <>Start!</>;
}

export default App;
