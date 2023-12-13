const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const router = express.Router();

const db = new sqlite3.Database("task.db");

db.run(`
  CREATE TABLE IF NOT EXISTS tasks (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Title TEXT NOT NULL,
    Details TEXT,
    DueDate DATETIME,
    IsCompleted BOOLEAN DEFAULT 0,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Add task
 *     description: add a task
 *     responses:
 *       201:
 *         description: Successful response
 *       500:
 *         description: Internal Server Error
 */


/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks
 *     description: Get a list of tasks and get tasks within a specified date range
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           description: Start date of the range
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           description: End date of the range
 *     responses:
 *       201:
 *         description: Successful response
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /tasks/{taskId}:
 *   get:
 *     summary: Get task by ID
 *     description: Get a task by its ID
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Successful response
 *       404:
 *         description: Task not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /tasks/{taskId}:
 *   put:
 *     summary: Update a task
 *     description: Update the details of a specific task.
 *     parameters:
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: integer
 *           description: ID of the task to be updated
 *           example: 1
 *       - in: body
 *         name: task
 *         description: Task object with updated details
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             Title:
 *               type: string
 *             Details:
 *               type: string
 *             DueDate:
 *               type: string
 *               format: date
 *             IsCompleted:
 *               type: boolean
 *           example:
 *             Title: New Title
 *             Details: Updated details
 *             DueDate: 2023-12-31
 *             IsCompleted: true
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Bad Request - Invalid task details
 *       404:
 *         description: Not Found - Task with specified ID not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /tasks/{taskId}:
 *   delete:
 *     summary: Delete a task
 *     description: Delete a specific task with ID.
 *     parameters:
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: integer
 *           description: ID of the task to be deleted
 *           example: 1
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Not Found - Task with specified ID not found
 *       500:
 *         description: Internal Server Error
 */

//create a task
router.post("/", (req, res) => {
  try {
    const { Title, Details, DueDate, IsCompleted } = req.body;
    const createdAt = new Date().toISOString();
    db.run(
      "INSERT INTO tasks (Title, Details, DueDate, IsCompleted, CreatedAt) VALUES (?, ?, ?, ?, ?)",
      [Title, Details, DueDate, IsCompleted, createdAt],

      (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: "Task created successfully" });
      }
    );
  } catch (error) {
    console.error("You're unable to create task at the moment; ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/", (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    if (startDate && endDate) {
      // Fetch tasks with date range
      db.all(
        "SELECT * FROM tasks WHERE DueDate IS NOT NULL AND (DueDate >= ? AND DueDate <= ?)",
        [startDate, endDate],
        (err, tasks) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          console.log(tasks, "tasks");
          res.json(tasks);
        }
      );
    } else {
      // Fetch all tasks
      db.all("SELECT * FROM tasks", (err, tasks) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(tasks);
      });
    }
  } catch (error) {
    console.error("You're unable to fetch tasks at the moment; ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//fetch a task
router.get("/:taskId", (req, res) => {
  const taskId = req.params.taskId;
  try {
    db.get("SELECT * FROM tasks WHERE Id = ?", [taskId], (err, task) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      res.json(task);
    });
  } catch (error) {
    console.error("You're unable to fetch task at the moment; ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//update a task using put method and marking a task as completed
router.put("/:taskId", (req, res) => {
  const taskId = req.params.taskId;
  const { Title, Details, DueDate, IsCompleted } = req.body;
  try {
    db.run(
      "UPDATE tasks SET Title = ?, Details = ?, DueDate = ?, IsCompleted = ? WHERE Id = ?",
      [Title, Details, DueDate, IsCompleted, taskId],
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (result === 0) {
          return res.status(404).json({ message: "Task not found" });
        }
        if (IsCompleted === 1) {
          db.run(
            "UPDATE tasks SET IsCompleted = 1 WHERE Id = ?",
            [taskId],
            (err) => {
              if (err) {
                console.error(err.message);
              } else {
                console.log(`Task with ID ${taskId} marked as completed.`);
              }
            }
          );
        }

        res.json({ message: "Task updated successfully" });
      }
    );
  } catch (error) {
    console.error("You're unable to update tasks at the moment; ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//update a task using patch method
router.patch("/:taskId", (req, res) => {
  const taskId = req.params.taskId;
  const { Title, Details, DueDate, IsCompleted } = req.body;
  try {
    db.run(
      "UPDATE tasks SET Title = ?, Details = ?, DueDate = ?, IsCompleted = ? WHERE Id = ?",
      [Title, Details, DueDate, IsCompleted, taskId],
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (result === 0) {
          return res.status(404).json({ message: "Task not found" });
        }

        res.json({ message: "Task updated successfully" });
      }
    );
  } catch (error) {
    console.error("You're unable to update tasks at the moment; ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//delete a task
router.delete("/:taskId", (req, res) => {
  const taskId = req.params.taskId;
  try {
    db.run(
      "DELETE FROM tasks WHERE Id = ?",
      [taskId],
      (taskId,
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (result === 0) {
          return res.status(404).json({ message: "Task not found" });
        }

        res.json({ message: "Task deleted successfully" });
      })
    );
  } catch (error) {
    console.error("You're unable to delete task at the moment; ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = { router };
