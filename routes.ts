import express from "express";

const router = express.Router();

/**
 * @openapi
 * /api/v1/users:
 *   get:
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
 *         description: An object containing a paginated array of all the users.
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
 *                              username:
 *                                 type: string
 *                              joined_at:
 *                                 type: timestamp
 *               example:
 *                  result:
 *                     - username: 'John Doe'
 *                       joined_at: '1721762939542'
 *                     - username: 'Jane Doe'
 *                       joined_at: '1621762381895'
 *       5XX:
 *         description: Server-side error.
 */
router.get("/users", (req, res) => {
  res.send("users");
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
 *                     id: '9625d82e-3ad7-4633-95f5-49e4886ca3ef'
 *                     username: 'John Doe'
 *                     joined_at: '1721762939542'
 *       400:
 *         description: Malformed request.
 *       401:
 *         description: Unauthorized.
 *       409:
 *         description: Username already exists.
 *       5XX:
 *         description: Server-side error.
 */
router.post("/users", (req, res) => {
  res.send("users");
});

export default router;
