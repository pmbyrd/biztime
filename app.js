/** BizTime express application. */
const express = require("express");
const app = express();
const ExpressError = require("./expressError")

// Middleware to parse JSON body
app.use(express.json());

// Import routes
const companiesRoutes = require("./routes/companies");
// const invoicesRoutes = require("./routes/invoices");

// Add routes
app.use("/companies", companiesRoutes);
/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});


module.exports = app;
