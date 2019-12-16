const path = require("path");
const express = require('express')
const bodyParser = require("body-parser");
var cors = require('cors');

require('./database/mongoose');

const birthDayWishes = require("./functions/birthDayWishes")

const aboutRouter = require('./routers/about.route');
const attendanceRouter = require('./routers/attendance.route');
const branchRouter = require('./routers/branch.route');
const budgetRouter = require('./routers/budget.route');
const contactRouter = require('./routers/contact.route');
const courseRouter = require('./routers/course.route');
const dashbosrdRouter = require('./routers/dashboard.route');
const enquiryRouter = require('./routers/enquiry.route');
const examRouter = require('./routers/exam.route');
const imageRouter = require('./routers/image.route');
const imageCategoryRouter = require('./routers/image-category.route');
const mediaRouter = require('./routers/media.route');
const receiptRouter = require('./routers/receipt.route');
const studentRouter = require('./routers/student.route');
const topperRouter = require('./routers/topper.route');
const userRouter = require('./routers/user.route');

const app = express();

app.use(express.json());

app.use(cors());

app.use("/media", express.static(path.join("media")));
app.use("/toppers", express.static(path.join("toppers")));
app.use("/images", express.static(path.join("images")));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', '*');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use(aboutRouter);
app.use(attendanceRouter);
app.use(branchRouter);
app.use(budgetRouter);
app.use(contactRouter);
app.use(courseRouter);
app.use(dashbosrdRouter);
app.use(enquiryRouter);
app.use(examRouter);
app.use(imageRouter);
app.use(imageCategoryRouter);
app.use(mediaRouter);
app.use(receiptRouter);
app.use(studentRouter);
app.use(topperRouter);
app.use(userRouter);

app.use((req, res, next) => {
  const error = new Error('NOT FOUND');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
      error: {
          message: error.message
      }
  });
});

birthDayWishes();

module.exports = app;