const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const initPassport = require('./auth/passport');
const indexRouter = require('./routes/index');
const dataProvider = require('./middlewares/dataProvider');

module.exports = (dataSource) => {
  initPassport();
  const app = express();

  app.use(cors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    exposedHeaders: ['x-auth-token'],
  }));
  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'pug');

  if (process.env.NODE_ENV !== 'test') {
    app.use(logger('dev'));
  }
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(dataProvider(dataSource));

  app.use('/', indexRouter);

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    next(createError(404));
  });

  // error handler
  app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500).json({});
  });

  return app;
};
// module.exports = app;
