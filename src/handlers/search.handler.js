import { getJobsWs } from '../models/jobs.model.js';

export const search = (io, socket) => {
	// Se agrega al usuario a una sala de busquedas
	socket.join(`search_${socket.handshake.query.search_id}`);
	console.log('User added to channel:', `search_${socket.handshake.query.search_id}`);

	/**
	 * Para cada búsqueda, se reciben los datos de la misma,
	 * se realiza el scrapping correspondiente y se envían
	 * los resultados a los clientes conectados al socket
	 */
	socket.on('search', data => {
		console.log('New search:', data);
		getJobsWs(io, data.search_id, data.search, data.topics, data.minPage, data.maxPage);
	});

	// acciones al desconectar
	socket.on('disconnect', () => {
		console.log('User disconnected:', socket.handshake.query);
	});
};
