const fetch = require('sync-fetch'); // librería para leer la web
const cheerio = require('cheerio'); // librería para hacer scrapping
let jobsModel = {};


jobsModel.getJobs = async (search, topics, minPage, maxPage) => {
  let jobs = [
    ...(await getTrademeJobs(search, topics, minPage, maxPage)),
    ...(await getSeekJobs(search, topics, minPage, maxPage)),
  ]

  return jobs
}

getTrademeJobs = async (search, topics, minPage, maxPage) => {
  const url = "https://www.trademe.co.nz";
  let jobs = [];
  let isFinished = false;
  let page = minPage;
  let isPageAprobed = false;

  while (!isFinished) {
    const $ = cheerio.load(fetch(url + `/a/jobs/auckland/search?search_string=${search}&sort_order=expirydesc&page=${page}`).text());

    // por cada búsqueda obtenemos su título y demás datos escenciales
    $('body').find('div.tm-search-results__listing').map((i, el) => {
      const title = $(el).find('[tmid="title"]').text().trim();

      if (aprobeJobOffer(title, topics)) {
        isPageAprobed = true;

        jobs.push({
          title,
          "company": $(el).find('[tmid="company"]').text().trim(),
          "location": $(el).find('[tmid="location"]').text().trim(),
          "listingDate": $(el).find('[tmid="startDate"]').text().trim().replace('yesterday', '1 day ago') || 'featured',
          "salary": $(el).find('[tmid="approximatePayRange"]').has('span').text().trim() || 'not mentioned',
          "classification": $(el).find('a.tm-jobs-search-card__link').attr('href').split('?')[0].split('/')[1],
          "url": url + '/' + $(el).find('a.tm-jobs-search-card__link').attr('href').split('?')[0],
          "site": "www.trademe.co.nz",
          "id": `${$(el).find('a.tm-jobs-search-card__link').attr('href').split('?')[0].split('/').pop()}`
        })
      }
    })

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

  console.info(`getTrademeJobs staerted at page ${minPage} and finished at page ${page} founding ${jobs.length} jobs`);

  return jobs
}

getSeekJobs = async (search, topics, minPage, maxPage) => {
  const url = "https://www.seek.co.nz";
  let jobs = [];
  let isFinished = false;
  let page = minPage;
  let isPageAprobed = false;

  while (!isFinished) {
    const $ = cheerio.load(fetch(url + `/${search}-jobs/in-All-Auckland?daterange=31&sortmode=ListedDate&page=${page}`).text());

    // por cada búsqueda obtenemos su título y demás datos escenciales
    $('body').find('[data-card-type="JobCard"]').map((i, el) => {
      const title = $(el).find('[data-automation="jobTitle"]').text();

      if (aprobeJobOffer(title, topics)) {
        isPageAprobed = true;

        jobs.push({
          title,
          "company": $(el).find('[data-automation="jobCompany"]').text(),
          "location": $(el).find('[data-automation="jobLocation"]:first').text() + ', ' + $(el).find('[data-automation="jobLocation"]:last').text(),
          "listingDate": $(el).find('[data-automation="jobListingDate"]').text() || 'featured',
          "salary": $(el).find('[data-automation="jobSalary"]').has('span').text() || 'not mentioned',
          "classification": $(el).find('[data-automation="jobClassification"]').text() || 'not mentioned',
          "url": url + $(el).find('[data-automation="jobTitle"]').attr('href').split('?')[0],
          "site": "www.seek.co.nz",
          "id": `${$(el).find('[data-automation="jobTitle"]').attr('href').split('?')[0].split('/').pop()}`
        })
      }
    })

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

  return jobs
}

aprobeJobOffer = (title, topics) => {
  // Convert the title to lowercase to avoid case sensitivity
  const titleLower = title.toLowerCase();

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

  // console.log("No topics are present in the title.");
  return false; // If no keyword is found in the title
};

module.exports = jobsModel;