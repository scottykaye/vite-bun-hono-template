import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "hono/bun";
import { Database } from "bun:sqlite";

const app = new Hono();

app.use("/api/*", cors());
app.use(
  "/api2/*",
  cors({
    origin: "http://example.com",
    allowHeaders: ["X-Custom-Header", "Upgrade-Insecure-Requests"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    maxAge: 600,
    credentials: true,
  }),
);

const db = new Database("local.db", { create: true });

// let create = db.query(
//   "CREATE TABLE contacts (contactId INTEGER PRIMARY KEY, firstName STRING, lastName STRING, phoneNumber STRING, email STRING ) ",
// );
// create.run();
//let insert = db.query('INSERT INTO contacts )

// contacts
// contactId - will have to get incremented based on amount in db
// firstName - required
// lastName - required
// phoneNumber - required because its a phonebook
// address -
// email -

app.use("/favicon.ico", serveStatic({ path: "./favicon.ico" }));

app.get("/api/contacts", (c) => {
  const query = db.query("SELECT * FROM contacts");
  let result = query.all();
  c.status(200);

  return c.json({ data: result });
});

let insert = db.prepare(
  "INSERT INTO contacts (contactId, firstName, lastName, phoneNumber) VALUES($contactId, $firstName, $lastName, $phoneNumber)",
);

let insertData = db.transaction((dataArray) => {
  for (const data of dataArray) {
    insert.run(data);
  }
});
app.post("/api/contacts", async (c) => {
  const data = await c.req.json();

  insertData([
    {
      $firstName: data.firstName,
      $lastName: data.lastName,
      $phoneNumber: data.phoneNumber,
    },
  ]);

  c.status(200);

  return c.text(`Updated ${data.firstName}'s contact!`);
});

let deleteContact = db.prepare(
  "DELETE FROM contacts WHERE contactId = $contactId",
);

let deleteData = db.transaction((data) => {
  deleteContact.run(data.contactId);
});

app.delete("/api/contacts", async (c) => {
  const data = await c.req.json();

  deleteData(data);

  c.status(200);

  return c.text(`Contact ${data.firstName} removed!`);
});

export default {
  port: 3000,
  fetch: app.fetch,
};
