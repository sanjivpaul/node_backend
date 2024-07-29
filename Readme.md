# Node Js Backend

### Content

- [Folder Structure]()
- [Initializing node server]()
- [Connection Of Database]()
- [profesional file structure]()
- [jwt and user video models]()
- [file upload multer]()
- [http methods]()
- [controllers & routes]()

### Folder Structure

[gitignore generators](https://mrkandreev.name/snippets/gitignore-generator/)

Install nodemon as dev dependencies using command
`npm i -D nodemon`

Install prettier as dev dependencies using command
`npm i -D prettier`

1. add `.prettierrc` file for configuration
2. add `.prettierignore` use for dont implement prettier in which file

### Connection Of Database

Note: Dont use single line connection for connecting data base use promises or async await because connecting database taking time.

1. first approach connect db in index.js file

```js
// index.js
import mongoose from "mongoose";
import DB_NAME from "./constants";

import express from "express";

const app = express();

// this function is working fine
function connectDB() {}

connectionDB();

// but we need another approach we use IFFE fucntion with async await
(async () => {})();

//use IFFE function with ;
(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    //    due to some reason our app is not able to talk to db
    app.on("error", (error) => {
      console.log("Error:", error);
      throw error;
    });

    app.listen(process.env.PORT, () => {
      console.log(`App is listent on http://localhost:${process.env.PORT}`);
    });
  } catch (error) {
    console.error("ERROR:", error);
    throw err;
  }
})();
```

2. second approach connect db in file and export the file to index.js file

```js
// db/index.js
import mongoose from "mongoose";
import DB_NAME from "./constants";

//use IFFE function with ;
import mongoose from "mongoose";
import {DB_NAME} from "../constants";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\n MONGODB connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("MONGODB CONNECTION ERROR:", error);
    process.exit(1);
  }
};

export default connectDB;
```

### file upload multer

create account on cloudanary

install cloudanary

- [`npm i cloudinary`]()
- [`npm i multer`](https://github.com/expressjs/multer#readme)

for uploading file we take two aprroaches

1. upload files directly to cloudinary.
2. first upload file in local server then upload in cloudinary and remove from local file sys. [Good practice]


### HTTP Methods

HTTP headers
- metadata => key value sent along with request and response
- caching, authentication, state management
- request headers => from client
- response header => from server
- representaion headers => ecoding/compression
- payload headers => data

Most common Headers
- Accept: application/json
- User-Agent => information about user like user login with mobile or web browser
- Authorization: Bearer tokens
- Content-Type
- Cookies
- Cache-Control

CORS
- Acess-Controll-Allow-Origin
- Access-Controll-Allow-Credentials
- Acess-Control-allow-Method

HTTP Methods

Basic set of operation that can be used to interact with server
- GET: retrive a resource
- HEAD: No message body (response headers only)
- OPTIONS: What operations are available
- TRACE: loopback test (get some data)
- DELETE: remove a resource
- PUT: replace a resource
- POST: interact with resource (mostly add)
- PATCH:change part of a resource

HTTP Status Code
- 1 xx => Information
- 2 xx => Success
- 3 xx => redirection
- 4 xx => client error
- 5 xx => server error

1. 100 continue
2. 102 Processing
3. 200 Ok
4. 201 created
5. 307 temporary redirect
6. 308 permanent redirect
7. 400 bad request
8. 401 unauthorized
9. 402 payment required
10. 404 not found
11. 500 internal server error
12. Gateway time out

