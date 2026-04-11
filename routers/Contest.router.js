const { getFiles, getTestcaseFileNames } = require("../executors/getFiles");
const fs = require("fs");
const path = require("path");
const ContestRepository = require("../repositories/Contest.repository");
const { ContestResult } = require("../repositories/ContestResult.class");
const { executeSqlAsync } = require("../utils/executeSqlAsync");
const { jwtValidator } = require("../utils/validateJWT");
const { sendSuccess, sendError } = require("../utils/responseHelper");
const { validate } = require("../utils/validateReqest");
const Joi = require("joi");

const ContestRouter = require("express").Router();

ContestRouter.post(
  "/createContest",
  validate(Joi.object().unknown(true)),
  jwtValidator,
  (req, res) => {
    ContestRepository.createContest(req.body)
      .then((contestId) => {
        return sendSuccess(res, contestId);
      })
      .catch((err) => sendError(req, res, err.message));
  },
);

ContestRouter.get("/getUpcomingContests", (req, res) => {
  ContestRepository.getUpcomingContests(req.body)
    .then((contests) => {
      return sendSuccess(res, contests);
    })
    .catch((err) => sendError(req, res, err.message));
});

ContestRouter.get(
  "/getFullContestDetailsForEdit/:contestId",
  jwtValidator,
  (req, res) => {
    ContestRepository.getFullContestDetailsForEdit(req.params, req.user)
      .then((fullContestDetails) => {
        return sendSuccess(res, fullContestDetails);
      })
      .catch((err) => sendError(req, res, err.message));
  },
);

ContestRouter.get("/getContests", (req, res) => {
  ContestRepository.getContests()
    .then((contests) => {
      return sendSuccess(res, contests);
    })
    .catch((err) => sendError(req, res, err.message));
});
ContestRouter.post(
  "/createProblem",
  validate(Joi.object().unknown(true)),
  jwtValidator,
  (req, res) => {
    ContestRepository.createProblem(req.body, req.user)
      .then((problemId) => {
        return sendSuccess(res, problemId);
      })
      .catch((err) => sendError(req, res, err.message));
  },
);

ContestRouter.get(
  "/getContestProblems/:id",
  validate(Joi.object({ id: Joi.number().required() }), "params"),
  (req, res) => {
    ContestRepository.getContestProblems(req.params)
      .then((contestProblems) => {
        return sendSuccess(res, contestProblems);
      })
      .catch((err) => sendError(req, res, err.message));
  },
);
ContestRouter.get(
  "/findContestById/:id",
  validate(Joi.object({ id: Joi.number().required() }), "params"),
  (req, res) => {
    ContestRepository.findContestById(req.params)
      .then((contestInfo) => {
        ContestRepository.beginContest(contestInfo);
        return sendSuccess(res, contestInfo);
      })
      .catch((err) => sendError(req, res, err.message));
  },
);

ContestRouter.get(
  "/getProblemInfo/:id",
  validate(Joi.object({ id: Joi.number().required() }), "params"),
  (req, res) => {
    ContestRepository.getProblemInfo(req.params)
      .then((problemInfo) => {
        return sendSuccess(res, problemInfo);
      })
      .catch((err) => sendError(req, res, err.message));
  },
);

ContestRouter.get(
  "/searchContestByProblem/:problemId",
  validate(Joi.object({ problemId: Joi.number().required() }), "params"),
  (req, res) => {
    ContestRepository.searchContestByProblem(req.params)
      .then((contest) => {
        return sendSuccess(res, contest);
      })
      .catch((err) => sendError(req, res, err.message));
  },
);

ContestRouter.get(
  "/getContestResult/:contestantId/:contestId",
  validate(
    Joi.object({
      contestantId: Joi.number().required(),
      contestId: Joi.number().required(),
    }),
    "params",
  ),
  (req, res) => {
    ContestResult.find(req.params)
      .then((contestResult) => {
        return sendSuccess(res, contestResult);
      })
      .catch((err) => sendError(req, res, err.message));
  },
);

ContestRouter.get(
  "/hasSolvedProblem_/:userId/:problemId",
  validate(
    Joi.object({
      userId: Joi.number().required(),
      problemId: Joi.number().required(),
    }),
    "params",
  ),
  (req, res) => {
    ContestRepository.hasSolvedProblem_(req.params)
      .then((verdicts) => {
        return sendSuccess(res, verdicts);
      })
      .catch((err) => sendError(req, res, err.message));
  },
);

ContestRouter.post("/getContestStandings", (req, res) => {
  ContestRepository.getContestStandings(req.body)
    .then((standings) => {
      return sendSuccess(res, standings);
    })
    .catch((err) => sendError(req, res, err.message));
});

ContestRouter.get(
  "/getProblemFiles/:problemId",
  jwtValidator,
  async (req, res) => {
    try {
      let problem = await executeSqlAsync({
        sql: `select * from problem where id=?  `,
        values: [req.params.problemId * 1],
      });
      problem = problem[0];
      if (problem == null) {
        return sendError(req, res, "Invalid Request!");
      }
      if (
        !(await ContestRepository.isAllowedToEditContest(
          problem.contestId,
          req.user.id,
        ))
      ) {
        return sendError(req, res, "Access Denied!");
      }
      let testcaseDir = `/testcases/${req.params.problemId}/`;
      let fileNames = getTestcaseFileNames(testcaseDir);
      if (!fileNames || fileNames.length === 0) {
        return sendSuccess(res, { testcases: [] });
      }
      let inputFiles = fileNames.filter((f) => f.startsWith("in")).sort();
      let testcases = [];
      for (let inputFile of inputFiles) {
        let fileNo = inputFile.split(".")[0].split("_")[1];
        let outputSuffix = fileNo ? `_${fileNo}` : "";
        let outputFile = `out${outputSuffix}.txt`;
        let input = "";
        let output = "";
        try {
          input = (await getFiles(testcaseDir + inputFile)).toString();
        } catch (e) { }
        try {
          output = (await getFiles(testcaseDir + outputFile)).toString();
        } catch (e) { }
        testcases.push({ input, output });
      }

      let statementFileDir = path.join(__dirname, '..', 'problemStatements', problem.id + '.txt')
      let statementFileContent = fs.readFileSync(statementFileDir).toString();
      return sendSuccess(res, { testcases, statementFileContent });
    } catch (err) {
      return sendError(req, res, err.message);
    }
  },
);

ContestRouter.post(
  "/clearTestcaseFiles/:problemId",
  jwtValidator,
  async (req, res) => {
    try {
      let problem = await executeSqlAsync({
        sql: `select * from problem where id=?`,
        values: [req.params.problemId * 1],
      });
      problem = problem[0];
      if (!problem) return sendError(req, res, "Invalid Request!");
      if (
        !(await ContestRepository.isAllowedToEditContest(
          problem.contestId,
          req.user.id,
        ))
      ) {
        return sendError(req, res, "Access Denied!");
      }
      let dir = path.join(
        __dirname,
        "..",
        "executors",
        "testcases",
        String(req.params.problemId),
      );
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true });
        fs.mkdirSync(dir, { recursive: true });
      }
      return sendSuccess(res, "Cleared");
    } catch (err) {
      return sendError(req, res, err.message);
    }
  },
);

ContestRouter.post("/updateContestInfo", jwtValidator, (req, res) => {
  //console.log("startTime:", req.body.startTime, "p", new Date(req.body.startTime));
  ContestRepository.updateContestInfo(
    req.body,
    req.user,
    req.query.isForceUpdate,
  )
    .then((data) => {
      return sendSuccess(res, "");
    })
    .catch((err) => {
      return sendError(req, res, err.message);
    });
});

ContestRouter.get("/trashUntrashProblemId", jwtValidator, (req, res) => {
  ContestRepository.trashUntrashProblemId(req.query, req.user)
    .then((data) => {
      return sendSuccess(res, "");
    })
    .catch((err) => {
      return sendError(req, res, err.message);
    });
});

ContestRouter.post("/updateProblemInfo", jwtValidator, (req, res) => {
  ContestRepository.updateProblemInfo(req.body, req.user)
    .then((data) => {
      return sendSuccess(res, "");
    })
    .catch((err) => {
      return sendError(req, res, err.message);
    });
});

ContestRouter.get(
  "/getParticipatedContestList/:userId/:pageNumber",
  validate(
    Joi.object({
      userId: Joi.number().required(),
      pageNumber: Joi.number().required(),
    }),
    "params",
  ),
  (req, res) => {
    ContestRepository.getParticipatedContestList(req.params)
      .then((participatedContestList) => {
        return sendSuccess(res, participatedContestList);
      })
      .catch((err) => sendError(req, res, err.message));
  },
);
ContestRouter.get(
  "/getProblems/:pageNumber",
  validate(Joi.object({ pageNumber: Joi.number().required() }), "params"),
  (req, res) => {
    ContestRepository.getProblems(req.params)
      .then((problems) => {
        return sendSuccess(res, problems);
      })
      .catch((err) => sendError(req, res, err.message));
  },
);

ContestRouter.post("/saveMessageToContestThread", jwtValidator, (req, res) => {
  ContestRepository.saveMessageToContestThread(req.body)
    .then(() => {
      return sendSuccess(res, { data: 1 });
    })
    .catch((err) => sendError(req, res, err.message));
});

ContestRouter.get(
  "/getContestMessages/:contestId",
  validate(Joi.object({ contestId: Joi.number().required() }), "params"),
  (req, res) => {
    ContestRepository.getContestMessages(req.params)
      .then((messages) => {
        return sendSuccess(res, messages);
      })
      .catch((err) => sendError(req, res, err.message));
  },
);
ContestRouter.get(
  "/setStandings/:contestId",
  validate(Joi.object({ contestId: Joi.number().required() }), "params"),
  (req, res) => {
    ContestRepository.setStandings(req.params.contestId)
      .then(() => {
        return sendSuccess(res, { data: 1 });
      })
      .catch((err) => sendError(req, res, err.message));
  },
);

module.exports = ContestRouter;
