import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./middlewares";
import { User } from "./mongodb";
import { body, matchedData, validationResult } from "express-validator";
import mongoose from "mongoose";

const router = express.Router();

/**
 * @openapi
 * /api/v1/users:
 *   get:
 *     summary: Get a list of all users
 *     description: Returns a paginated array of all the users. The response can be transformed by the supported query parameters.
 *     tags:
 *        - Users
 *     parameters:
 *        - in: query
 *          name: limit
 *          description: Specifies how many users should be returned in the array.
 *          schema:
 *             type: integer
 *             minimum: 5
 *             maximum: 100
 *             default: 10
 *        - in: query
 *          name: offset
 *          description: Specifies the offset used for paginating the results.
 *          schema:
 *             type: integer
 *             default: 0
 *        - in: query
 *          name: order
 *          description: Specifies the order by which the users should be returned. Users are sorted by their joined_at timestamp.
 *          schema:
 *             type: string
 *             enum: ["ASC", "DESC"]
 *             default: "DESC"
 *     responses:
 *       200:
 *         description: An object containing a paginated array of all the users ordered by joined_at.
 *         content:
 *            application/json:
 *               schema:
 *                  type: object
 *                  properties:
 *                     result:
 *                        type: array
 *                        items:
 *                           type: object
 *                           properties:
 *                              _id:
 *                                 type: string
 *                              username:
 *                                 type: string
 *                              joined_at:
 *                                 type: datetime
 *               example:
 *                  result:
 *                     - _id: 66a0a7e7362f3b1136cbb8f1
 *                       username: 'John Doe'
 *                       joined_at: '2024-07-24T07:06:15.012Z'
 *                     - _id: 66a0a7e7362f4w5greh65jg5
 *                       username: 'Jane Doe'
 *                       joined_at: '2024-06-24T07:00:10.000Z'
 *       5XX:
 *         description: Server-side error.
 */
router.get("/users", async (req, res) => {
  // convert order parameter to lower case
  req.query.order = req.query.order?.toString().toLowerCase();

  // if query params are not valid use the default values
  const result = await User.find()
    .sort({ joined_at: req.query.order === "asc" ? "asc" : "desc" })
    .skip(isNaN(Number(req.query.offset)) ? 0 : Number(req.query.offset))
    .limit(isNaN(Number(req.query.limit)) ? 10 : Number(req.query.limit));

  res.json({ result });
});

/**
 * @openapi
 * /api/v1/users:
 *   post:
 *     summary: Add a new user
 *     description: Creates a new user with the username passed in the request body. The given username must be unique.
 *     security:
 *        - BearerAuth: []
 *     tags:
 *        - Users
 *     requestBody:
 *       description: Must be a json object containing the username.
 *       required: true
 *       content:
 *          application/json:
 *             schema:
 *                type: object
 *                properties:
 *                   username:
 *                      type: string
 *     responses:
 *       201:
 *         description: An object containing information about the newly created user.
 *         content:
 *            application/json:
 *               schema:
 *                  type: object
 *                  properties:
 *                     result:
 *                        type: object
 *                        properties:
 *                           id:
 *                              type: uuid
 *                           username:
 *                              type: string
 *                           joined_at:
 *                              type: timestamp
 *               example:
 *                  result:
 *                     id: '66a0a7e7362f3b1136cbb8f1'
 *                     username: 'John Doe'
 *                     joined_at: '1721762939542'
 *       400:
 *         description: Malformed request.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Token is fine but expired or role is not admin.
 *       409:
 *         description: Username already exists.
 *       5XX:
 *         description: Server-side error.
 */

// checks request body to make sure username is not empty and sanitizes the input
router.post(
  "/users",
  authMiddleware,
  [
    body("username")
      .notEmpty()
      .withMessage("Username is empty.")
      .trim()
      .escape(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: "Username is invalid." });
      }
      const sanitizedUsername = matchedData(req);
      const user = new User({ username: sanitizedUsername.username });
      const result = await user.save();
      res.status(201).json({ result });
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @openapi
 * /api/v1/login:
 *   post:
 *     summary: Generate a JWT token
 *     description: Generates a basic JWT token with role set to admin and expiry set to 5 minutes.
 *     tags:
 *        - Authentication
 *     requestBody:
 *       description: Content of the request body are ignored.
 *       content:
 *          application/json:
 *             schema:
 *                type: object
 *     responses:
 *       200:
 *         description: An object containing the generated JWT token.
 *         content:
 *            application/json:
 *               schema:
 *                  type: object
 *                  properties:
 *                     token:
 *                        type: string
 *               example:
 *                  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJleHBpcmVzX2F0IjoxNzIxNzY3NjQ3MDA3LCJpYXQiOjE3MjE3NjczNDd9.PoxLRlIGFO1m5j5F4JDkfFITxg21y7BXEnEHAr1LI3s'
 *       5XX:
 *         description: Server-side error.
 */
router.post("/login", (req, res) => {
  const payload = {
    role: "admin",
    expires_at: Date.now() + 300 * 1000,
  };

  jwt.sign(payload, process.env.JWT_SECRET!, (error, data) => {
    res.json({ token: data });
  });
});

/**
 * @openapi
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get an existing user
 *     description: Returns an object containing information for the user with the given ID.
 *     tags:
 *        - Users
 *     parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          description: User ID.
 *          schema:
 *             type: string
 *     responses:
 *       200:
 *         description: An object containing user information.
 *         content:
 *            application/json:
 *               schema:
 *                  type: object
 *                  properties:
 *                     result:
 *                        type: object
 *                        properties:
 *                           _id:
 *                              type: string
 *                           username:
 *                              type: string
 *                           joined_at:
 *                              type: datetime
 *               example:
 *                  result:
 *                     _id: 66a0a7e7362f3b1136cbb8f1
 *                     username: 'John Doe'
 *                     joined_at: '2024-07-24T07:06:15.012Z'
 *       400:
 *         description: Invalid ID.
 *       404:
 *         description: User with given ID not found.
 *       5XX:
 *         description: Server-side error.
 */
router.get("/users/:id", async (req, res, next) => {
  try {
    // check if the given id is a valid object id
    if (!mongoose.Types.ObjectId.isValid(req.params.id ?? "")) {
      return res.status(400).json({ message: "Invalid ID." });
    }

    const result = await User.findById(req.params.id);

    // if result is null that means there is no user with this id
    if (!result) {
      return res.status(404).json({ message: "No user with this ID found." });
    }

    res.json({ result });
  } catch (e) {
    next(e);
  }
});

/**
 * @openapi
 * /api/v1/users/{id}:
 *   put:
 *     summary: Update an existing user
 *     description: Updates an existing user with the given ID. The value that can be updated is the username which must be passed in the request body.
 *     security:
 *        - BearerAuth: []
 *     tags:
 *        - Users
 *     parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          description: User ID.
 *          schema:
 *             type: string
 *     requestBody:
 *       description: Must be a json object containing the new username.
 *       required: true
 *       content:
 *          application/json:
 *             schema:
 *                type: object
 *                properties:
 *                   username:
 *                      type: string
 *     responses:
 *       204:
 *         description: Successfully updated the user with the given ID.
 *       400:
 *         description: Malformed request.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Token is fine but expired or role is not admin.
 *       404:
 *         description: User with this ID not found.
 *       5XX:
 *         description: Server-side error.
 */

// checks request body to make sure username is not empty and sanitizes the input
router.put(
  "/users/:id",
  authMiddleware,
  [
    body("username")
      .notEmpty()
      .withMessage("Username is empty.")
      .trim()
      .escape(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // check if the given id is a valid object id
      if (!mongoose.Types.ObjectId.isValid(req.params.id ?? "")) {
        return res.status(400).json({ message: "Invalid ID." });
      }

      // make sure validation passed successfully
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: "Username is invalid." });
      }
      const sanitizedUsername = matchedData(req);

      // update the document and check if it was successful
      const result = await User.findByIdAndUpdate(req.params.id, {
        username: sanitizedUsername.username,
      });

      // if the update result is null then the document does not exist
      if (!result) {
        return res
          .status(404)
          .json({ errors: "User with given ID not found." });
      }

      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

/**
 * @openapi
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Delete an existing user
 *     description: Deletes the existing user with the given ID and returns the delete user's information.
 *     security:
 *        - BearerAuth: []
 *     tags:
 *        - Users
 *     parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          description: User ID.
 *          schema:
 *             type: string
 *     responses:
 *       200:
 *         description: Successfully deleted the user.
 *         content:
 *            application/json:
 *               schema:
 *                  type: object
 *                  properties:
 *                     result:
 *                        type: object
 *                        properties:
 *                           id:
 *                              type: uuid
 *                           username:
 *                              type: string
 *                           joined_at:
 *                              type: timestamp
 *               example:
 *                  result:
 *                     id: '66a0a7e7362f3b1136cbb8f1'
 *                     username: 'John Doe'
 *                     joined_at: '1721762939542'
 *       400:
 *         description: Malformed request.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Token is fine but expired or role is not admin.
 *       404:
 *         description: User with this ID not found.
 *       5XX:
 *         description: Server-side error.
 */
router.delete(
  "/users/:id",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // check if the given id is a valid object id
      if (!mongoose.Types.ObjectId.isValid(req.params.id ?? "")) {
        return res.status(400).json({ message: "Invalid ID." });
      }

      // delete the user and get the returned value
      const deletedUser = await User.findByIdAndDelete(req.params.id);

      // if the delete result is null then the document does not exist
      if (!deletedUser) {
        return res
          .status(404)
          .json({ errors: "User with given ID not found." });
      }

      res.send({ result: deletedUser });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
