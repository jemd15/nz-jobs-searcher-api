'use strict';

import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'node:http';
import router from './routes/jobs.routes.js';
import { search } from './handlers/search.handler.js';

// Initializations
const app = express();
const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: '*',
		methods: '*',
	},
});

// Settings
dotenv.config();
app.set('port', process.env.PORT ?? 3000);

// Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Headers
app.use(cors());

// Routes
// app.use('/api/jobs', require('./routes/jobs.routes'));
app.use('/api/jobs', router);

// Websockets
io.on('connection', socket => {
	console.log('User connected!!!');

	search(io, socket);

	socket.on('disconnect', () => {
		console.log('User disconnected!!!');
	});
});

// Starting the server
server.listen(app.get('port'), () => {
	console.clear();
	console.log('Server on port', app.get('port'));
});
