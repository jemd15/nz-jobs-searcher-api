import fetch from 'sync-fetch'; // librería para leer la web
import cheerio from 'cheerio'; // librería para hacer scrapping
import dayjs from 'dayjs'; // libreria para manipular fechas

const getTrademeJobsWs = (io, search_id, search, topics, minPage, maxPage) => {
	const url = 'https://www.trademe.co.nz';
	let isFinished = false;
	let page = minPage;
	let isPageAprobed = false;

	while (!isFinished) {
		const $ = cheerio.load(fetch(url + `/a/jobs/auckland/search?search_string=${search}&sort_order=expirydesc&page=${page}`).text());

		// por cada búsqueda obtenemos su título y demás datos escenciales
		$('body')
			.find('div.tm-search-results__listing')
			.map((i, el) => {
				const title = $(el).find('[tmid="title"]').text().trim();

				if (title && aprobeJobOffer(title, topics)) {
					isPageAprobed = true;

					// se envía cada oferta que pase el filtro al socket correspondiente
					io.to(`search_${search_id}`).emit('search', {
						search_id,
						title,
						company: $(el).find('[tmid="company"]').text().trim(),
						location: $(el).find('[tmid="location"]').text().trim().replace('Auckland City', 'Auckland CBD'),
						listingDate: dateParser($(el).find('[tmid="startDate"]').text().trim().replace('yesterday', '1 day ago')) || 'featured',
						salary: $(el).find('[tmid="approximatePayRange"]').has('span').text().trim() || 'not mentioned',
						classification: $(el).find('a.tm-jobs-search-card__link').attr('href').split('?')[0].split('/')[1],
						url: url + '/a/' + $(el).find('a.tm-jobs-search-card__link').attr('href').split('?')[0],
						site: 'www.trademe.co.nz',
						id: `trademe_${$(el).find('a.tm-jobs-search-card__link').attr('href').split('?')[0].split('/').pop()}`,
						img: $(el).find('img').attr('src') || 'https://shop.raceya.fit/wp-content/uploads/2020/11/logo-placeholder.jpg',
					});
					console.log('Emmiting to channel:', `search_${search_id}`);
				}
			});

		/**
		 * si las publicaciones un una misma página no contienen algún tópico
		 * o si llegamos a la página máxima seleccionada, se detiene la búsqueda
		 */
		if (!isPageAprobed || page.toString() === maxPage.toString()) isFinished = true;

		if (!isFinished) {
			page++;
			isPageAprobed = false;
		}
	}
};

const getSeekJobsWs = async (io, search_id, search, topics, minPage, maxPage) => {
	const url = 'https://www.seek.co.nz';
	let isFinished = false;
	let page = minPage;
	let isPageAprobed = false;

	while (!isFinished) {
		const $ = cheerio.load(fetch(url + `/${search}-jobs/in-All-Auckland?daterange=31&sortmode=ListedDate&page=${page}`).text());

		// por cada búsqueda obtenemos su título y demás datos escenciales
		$('body')
			.find('[data-card-type="JobCard"]')
			.map((i, el) => {
				const title = $(el).find('[data-automation="jobTitle"]').text();

				if (aprobeJobOffer(title, topics)) {
					isPageAprobed = true;

					// se envía cada oferta que pase el filtro al socket correspondiente
					io.to(`search_${search_id}`).emit('search', {
						search_id,
						title,
						company: $(el).find('[data-automation="jobCompany"]').text(),
						location: $(el).find('[data-automation="jobLocation"]:first').text() + ', ' + $(el).find('[data-automation="jobLocation"]:last').text(),
						listingDate:
							dateParser(
								$(el)
									.find('[data-automation="jobListingDate"]')
									.text()
									.replace('1d', '1 day')
									.replace('d', ' days')
									.replace('1h', '1 hour')
									.replace('h', ' hours')
									.replace('m', ' minutes')
									.replace('1m', '1 minute'),
							) || 'featured',
						salary: $(el).find('[data-automation="jobSalary"]').has('span').text() || 'not mentioned',
						classification: $(el).find('[data-automation="jobClassification"]').text() || 'not mentioned',
						url: url + $(el).find('[data-automation="jobTitle"]').attr('href').split('?')[0],
						site: 'www.seek.co.nz',
						id: `seek_${$(el).find('[data-automation="jobTitle"]').attr('href').split('?')[0].split('/').pop()}`,
						img: $(el).find('img').attr('src') || 'https://shop.raceya.fit/wp-content/uploads/2020/11/logo-placeholder.jpg',
					});
					console.log('Emmiting to channel:', `search_${search_id}`);
				}
			});

		/**
		 * si las publicaciones un una misma página no contienen algún tópico
		 * o si llegamos a la página máxima seleccionada, se detiene la búsqueda
		 */
		if (!isPageAprobed || page.toString() === maxPage.toString()) isFinished = true;

		if (!isFinished) {
			page++;
			isPageAprobed = false;
		}
	}
};

const getTrademeJobs = async (search, topics, minPage, maxPage) => {
	const url = 'https://www.trademe.co.nz';
	let jobs = [];
	let isFinished = false;
	let page = minPage;
	let isPageAprobed = false;

	while (!isFinished) {
		const $ = cheerio.load(fetch(url + `/a/jobs/auckland/search?search_string=${search}&sort_order=expirydesc&page=${page}`).text());

		// por cada búsqueda obtenemos su título y demás datos escenciales
		$('body')
			.find('div.tm-search-results__listing')
			.map((i, el) => {
				const title = $(el).find('[tmid="title"]').text().trim();

				if (aprobeJobOffer(title, topics)) {
					isPageAprobed = true;

					jobs.push({
						title,
						company: $(el).find('[tmid="company"]').text().trim(),
						location: $(el).find('[tmid="location"]').text().trim().replace('Auckland City', 'Auckland CBD'),
						listingDate: dateParser($(el).find('[tmid="startDate"]').text().trim().replace('yesterday', '1 day ago')) || 'featured',
						salary: $(el).find('[tmid="approximatePayRange"]').has('span').text().trim() || 'not mentioned',
						classification: $(el).find('a.tm-jobs-search-card__link').attr('href').split('?')[0].split('/')[1],
						url: url + '/a/' + $(el).find('a.tm-jobs-search-card__link').attr('href').split('?')[0],
						site: 'www.trademe.co.nz',
						id: `trademe_${$(el).find('a.tm-jobs-search-card__link').attr('href').split('?')[0].split('/').pop()}`,
						img: $(el).find('img').attr('src') || 'https://shop.raceya.fit/wp-content/uploads/2020/11/logo-placeholder.jpg',
					});
				}
			});

		/**
		 * si las publicaciones un una misma página no contienen algún tópico
		 * o si llegamos a la página máxima seleccionada, se detiene la búsqueda
		 */
		if (!isPageAprobed || page.toString() === maxPage.toString()) isFinished = true;

		if (!isFinished) {
			page++;
			isPageAprobed = false;
		}
	}

	console.log(`getTrademeJobs staerted at page ${minPage} and finished at page ${page} founding ${jobs.length} jobs`);

	return jobs;
};

const getSeekJobs = async (search, topics, minPage, maxPage) => {
	const url = 'https://www.seek.co.nz';
	let jobs = [];
	let isFinished = false;
	let page = minPage;
	let isPageAprobed = false;

	while (!isFinished) {
		const $ = cheerio.load(fetch(url + `/${search}-jobs/in-All-Auckland?daterange=31&sortmode=ListedDate&page=${page}`).text());

		// por cada búsqueda obtenemos su título y demás datos escenciales
		$('body')
			.find('[data-card-type="JobCard"]')
			.map((i, el) => {
				const title = $(el).find('[data-automation="jobTitle"]').text();

				if (aprobeJobOffer(title, topics)) {
					isPageAprobed = true;

					jobs.push({
						title,
						company: $(el).find('[data-automation="jobCompany"]').text(),
						location: $(el).find('[data-automation="jobLocation"]:first').text() + ', ' + $(el).find('[data-automation="jobLocation"]:last').text(),
						listingDate:
							dateParser(
								$(el)
									.find('[data-automation="jobListingDate"]')
									.text()
									.replace('1d', '1 day')
									.replace('d', ' days')
									.replace('1h', '1 hour')
									.replace('h', ' hours')
									.replace('m', ' minutes')
									.replace('1m', '1 minute'),
							) || 'featured',
						salary: $(el).find('[data-automation="jobSalary"]').has('span').text() || 'not mentioned',
						classification: $(el).find('[data-automation="jobClassification"]').text() || 'not mentioned',
						url: url + $(el).find('[data-automation="jobTitle"]').attr('href').split('?')[0],
						site: 'www.seek.co.nz',
						id: `seek_${$(el).find('[data-automation="jobTitle"]').attr('href').split('?')[0].split('/').pop()}`,
						img: $(el).find('img').attr('src') || 'https://shop.raceya.fit/wp-content/uploads/2020/11/logo-placeholder.jpg',
					});
				}
			});

		/**
		 * si las publicaciones un una misma página no contienen algún tópico
		 * o si llegamos a la página máxima seleccionada, se detiene la búsqueda
		 */
		if (!isPageAprobed || page.toString() === maxPage.toString()) isFinished = true;

		if (!isFinished) {
			page++;
			isPageAprobed = false;
		}
	}

	console.info(`getSeekJobs staerted at page ${minPage} and finished at page ${page} founding ${jobs.length} jobs`);

	return jobs;
};

const aprobeJobOffer = (title, topics) => {
	// Convert the title to lowercase to avoid case sensitivity
	const titleLower = title.toLowerCase();

	if (topics.length) {
		// Iterate over each keyword
		for (let keyword of topics) {
			// Convert the keyword to lowercase to avoid case sensitivity
			const keywordLower = keyword.normalize('NFD').toLowerCase();

			// Check if the keyword is present in the title
			if (titleLower.includes(keywordLower.normalize('NFD'))) {
				// console.log(`The keyword "${keyword}" is present in the title.`);
				return true; // Stop the check as soon as a keyword is found
			}
		}
	} else {
		return true;
	}
};

const dateParser = dateText => {
	let date = '';

	if (dateText.toLowerCase().includes('listed today')) {
		date = dayjs();
	} else if (dateText.includes(' day')) {
		date = dayjs().subtract(parseInt(dateText.split(' ')[0]), 'days');
	} else if (dateText.includes('hour')) {
		date = dayjs().subtract(parseInt(dateText.split(' ')[0]), 'hours');
	} else if (dateText.includes('minute')) {
		date = dayjs().subtract(parseInt(dateText.split(' ')[0]), 'minutes');
	} else {
		date = dateText;
	}

	return date;
};

export const getJobs = async (search, topics, minPage, maxPage) => {
	let jobs = [...(await getTrademeJobs(search, topics, minPage, maxPage)), ...(await getSeekJobs(search, topics, minPage, maxPage))];

	return jobs;
};

export const getJobsWs = (io, search_id, search, topics, minPage, maxPage) => {
	getTrademeJobsWs(io, search_id, search, topics, minPage, maxPage);
	getSeekJobsWs(io, search_id, search, topics, minPage, maxPage);
};
