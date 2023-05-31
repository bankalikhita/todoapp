const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbpath = path.join(__dirname, "todoApplication.db");
let db = null;
const initializedb = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running");
    });
  } catch (e) {
    console.log(`DB ERROR:${e.message}`);
    process.exit(1);
  }
};
initializedb();

//api1
const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};
app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }

  data = await db.all(getTodosQuery);
  response.send(data);
});

//api2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getquery = `select * from todo where id=${todoId};`;
  const itemarray = await db.get(getquery);
  response.send(itemarray);
});

//api3
app.post("/todos/", async (request, response) => {
  const tododet = request.body;
  const { id, todo, priority, status } = tododet;
  const getquery = `Insert into todo (id,todo,priority,status) values(${id},"${todo}","${priority}","${status}");`;
  await db.run(getquery);
  response.send("Todo Successfully Added");
});

//api4
const hastodoProperty = (requestQuery) => {
  return requestQuery.todo !== undefined;
};
app.put("/todos/:todoId/", async (request, response) => {
  let data = null;
  let putTodosQuery = "";
  const { id } = request.params;
  switch (true) {
    case hasPriorityProperty(request.body):
      putTodosQuery = `
  update
   todo 
   set priority="${priority}"
   WHERE
   id=${id};`;
      break;
    case hasStatusProperty(request.body):
      putTodosQuery = `
   update
   todo 
   set status="${status}"
   WHERE
   id=${id};`;
      break;
    default:
      putTodosQuery = `
   update
   todo 
   set todo="${todo}"
   WHERE
   id=${id};`;
  }

  data = await db.run(putTodosQuery);
  response.send("Status Updated");
});

module.exports = app;
