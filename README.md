To run this project, first pull the repository and run:
```npm install```

Make sure your Node.js version is 20.6.0 or higher, otherwise the .env variables will not be passed to the program (if you'd to like to run the project with older Node.js versions, use dotenv and modify the code accordingly or pass the env variables through the command line).

In order for the app to work properly, you need to create a ```.env``` file in the root of the project and set the following env variables:
```
JWT_SECRET="..."
MONGODB_URL="..."
```
As an example the following values can be set:
```
JWT_SECRET=123
MONGODB_URL=mongodb://127.0.0.1:27017/test
```
Then run ```npm start``` to start the server which listens on ```http://localhost:3000``` by default.

You can access the Swagger OpenAPI specification at ```http://localhost:3000/docs```.
