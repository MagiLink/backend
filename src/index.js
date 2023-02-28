import createError from 'http-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

import generateRouter from './routes/generate.js';
import searchRouter from './routes/search.js';
import componentRouter from './routes/components.js'

const swaggerOptions = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'MagiLink API Documentation',
            version: '1.0.0',
            description: 'API Documentation for the MagiLink project',
        },
        servers: [{ url: 'http://localhost:3333' }],
    },
    apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

const app = express();

const port = process.env.PORT || 3333;

app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(cors());

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/generate', generateRouter);
app.use('/search', searchRouter);
app.use('/components', componentRouter);

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
