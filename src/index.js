import createError from 'http-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import indexRouter from './routes/index.js';
import generateRouter from './routes/generate.js';
import queryRouter from './routes/query.js'
import searchRouter from './routes/search.js';

const app = express();

const port = process.env.PORT || 3333;

app.use(cors());

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/generate', generateRouter);
app.use('/query', queryRouter);
app.use('/search', searchRouter);

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
    res.status(err.status || 500);
    res.render('error');
});

export default app;
