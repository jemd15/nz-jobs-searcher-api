const express = require('express');
const router = express.Router();
const jobsModel = require('../models/jobs.model');

router.get('/', /* verifyRole.admin, */ (req, res) => {
  const { search, topics, minPage, maxPage } = req.query;

  jobsModel.getJobs(search, topics.split(','), minPage, maxPage)
    .then(jobs => {
      res.status(200).json(jobs);
    })
    .catch(err => {
      res.status(500).json({
        success: false,
        message: err.message
      });
    });
});

module.exports = router;