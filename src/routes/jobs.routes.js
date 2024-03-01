import express from "express";
import { getJobs } from "../models/jobs.model.js";

const router = express.Router();

router.get('/', /* verifyRole.admin, */(req, res) => {
  const { search, topics, minPage, maxPage } = req.query;

  getJobs(search, topics.split(','), minPage, maxPage)
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

export default router;