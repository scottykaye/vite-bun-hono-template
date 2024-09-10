import {
  useState,
  useEffect,
  useReducer,
  type FormEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
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

async function postContact(newContact = {}) {
  const response = await fetch("http://localhost:3000/api/contacts", {
    method: "POST",
    headers,
    body: JSON.stringify(newContact),
  });

  if (!response.ok) {
    throw new Error("Error fetching API");
  }

  let data;

  try {
    data = await response.json();
    return data;
  } catch (e) {
    console.log("Error posting data:", (e as Error).message);
  }
}

async function deleteContact(contactId: number) {
  const response = await fetch("http://localhost:3000/api/contacts", {
    method: "POST",
    headers,
    body: JSON.stringify({ data: { contactId } }),
  });

  if (!response.ok) {
    throw new Error("Error fetching API");
  }

  let data;

  try {
    data = await response.json();
    return data;
  } catch (e) {
    console.log("Error posting data:", (e as Error).message);
  }
}

type Action = { type: "firstName" | "lastName" | "phoneNumber"; value: string };

function reducer(state: Record<string, string>, action: Action) {
  switch (action.type) {
    case "firstName":
      return { ...state, firstName: action.value };
    case "lastName":
      return { ...state, lastName: action.value };
    case "phoneNumber":
      return { ...state, phoneNumber: action.value };
  }
}

function AddContact({
  setData,
}: {
  setData: Dispatch<SetStateAction<string[]>>;
}) {
  const [state, dispatch] = useReducer(reducer, {
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });

  async function handleSubmit(e: FormEvent<HTMLButtonElement>) {
    e.preventDefault();
    await postContact(state);

    const { data } = await getData();

    setData(data);
  }

  return (
    <form>
      <input
        placeholder="first name"
        type="text"
        required
        onChange={(e) => {
          dispatch({ type: "firstName", value: e.target.value });
        }}
      />
      <input
        placeholder="last name"
        type="text"
        required
        onChange={(e) => {
          dispatch({ type: "lastName", value: e.target.value });
        }}
      />
      <input
        placeholder="phone number"
        type="tel"
        // pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
        required
        onChange={(e) => {
          dispatch({ type: "phoneNumber", value: e.target.value });
        }}
      />
      <button onClick={handleSubmit}>add</button>
    </form>
  );
}

function App() {
  const [data, setData] = useState<
    Awaited<ReturnType<typeof getData>> | Array<Record<string, unknown>>
  >([]);

  async function handleDelete(contactId: number) {
    const response = await fetch("http://localhost:3000/api/contacts", {
      method: "DELETE",
      headers,
      body: JSON.stringify({ contactId }),
    });

    if (!response.ok) {
      throw new Error("Error deleting contact");
    }

    try {
      await response.text();

      const { data } = await getData();

      setData(data);
    } catch (e) {
      console.log("Error deleting contact:", (e as Error).message);
    }
  }

  useEffect(() => {
    (async () => {
      const { data } = await getData();
      setData(data);
    })();
  }, []);

  return (
    <>
      <table>
        <thead>
          <tr>
            <th className="p-4">First Name</th>
            <th className="p-4">Last Name</th>
            <th className="p-4">Phone Number</th>
            <th className="p-4">Email</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 &&
            data.map((item: Awaited<ReturnType<typeof getData>>) => {
              return (
                <tr key={item.contactId}>
                  <td className="p-4">{item.firstName}</td>
                  <td className="p-4">{item.lastName}</td>
                  <td className="p-4">{item.phoneNumber}</td>
                  <td className="p-4">{item.email}</td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={async () => await handleDelete(item.contactId)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
      <AddContact setData={setData} />
    </>
  );
}

export default App;
