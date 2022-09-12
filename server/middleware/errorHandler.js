const { logEvents } = require("./logger");

const errorHandler = async (err, req, res, next) => {
  logEvents(
    `${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
    "errorLog.log"
  );

  console.log(err.stack);
  const status = res.statusCode ? res.statusCode : 500;

  res.status(status);
  res.json({ msg: err.message });
};

module.exports = errorHandler;
