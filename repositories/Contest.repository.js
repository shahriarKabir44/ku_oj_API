const { getFileDir } = require('../executors/getFiles')
const { RedisClient } = require('../utils/RedisClient')
const { beginTransaction } = require('../utils/dbConnection')
const { executeSqlAsync } = require('../utils/executeSqlAsync')
const path = require('path');
const QueryBuilder = require('../utils/queryBuilder')
const { ContestResult } = require('./ContestResult.class')
const fs = require('fs');

module.exports = class ContestRepository {
    static async beginContest(contest) {
        if (contest.status == 1 || contest.status == 2) return
        if (contest.startTime >= (new Date()) * 1) return
        let timeSpan = contest.endTime - (new Date()) * 1
        contest.status = 1
        executeSqlAsync({
            sql: `update contest set status=1 where id=?;`,
            values: [contest.id]
        })
        executeSqlAsync({
            sql: `select * from problem where problem.contestId=?;`,
            values: [contest.id]
        }).then(problems => {
            problems.forEach(problem => {
                problem.isAvailable = 1
                RedisClient.store(`problem_${problem.id}`, problem)
            })
        })
        executeSqlAsync({
            sql: `update problem set isAvailable=1 where problem.contestId=?;`,
            values: [contest.id]
        })

        RedisClient.store(`contest_${contest.id}`, contest)
        setTimeout(() => {

            contest.status = 2

            executeSqlAsync({
                sql: `update contest set status=2 where id=?;`,
                values: [contest.id]
            })

            RedisClient.store(`contest_${contest.id}`, contest)
            this.setStandings(contest.id)
        }, timeSpan)
    }
    static async getProblems({ pageNumber }) {
        return executeSqlAsync({
            sql: `select problem.id,problem.title,points,numSolutions,contestId,
                contest. title  as contestTitle
            from problem
            inner join contest on contest.id = problem.contestId
            where problem.isAvailable=1 order by id desc limit ?,20;`,
            values: [pageNumber * 1]

        })
    }

    static async isContributor(contestId, contributorId, isCheckActive = true) {
        let isActiveContributor = RedisClient.queryCache(`contest_${contestId}_contributor_${contributorId}`)
        if (isActiveContributor != null) {
            return isActiveContributor == 1
        }
        let result = await executeSqlAsync({
            sql: `select * from contestContributor where contestId=? and contributorId=? ${isCheckActive ? 'and isActive=1' : ''};`,
            values: [contestId, contributorId]
        })
        if (result.length > 0 && result[0].isActive == 1) {
            RedisClient.store(`contest_${contestId}_contributor_${contributorId}`, 1)
        }
        return result.length > 0
    }

    static async addContestContributor({ contestId, contributorId }, user) {
        let contest = await this.findContestById({ id: contestId })
        if (!contest || contest.hostId != user.id) {
            throw new Error("Invalid Request!")
        }

        if (await this.isContributor(contestId, contributorId, false)) {
            throw new Error("This user is already a contributor of this contest!");
        }

        try {
            await executeSqlAsync({
                sql: QueryBuilder.insertQuery('contestContributor', ['contestId', 'contributorId', 'isActive', 'createDate']),
                values: [contestId, contributorId, 0, new Date()]

            });
            return true
            //no need to store in redis as the contributor will be inactive by default and will not be able to do any contribution until the host activates him/her. So we can check the contributor's status directly from the database when needed.
        } catch (error) {
            throw new Error("Database Error!");
        }

    }

    static async setStandings(contestId) {
        let contestResults = await executeSqlAsync({
            sql: `select * from contestResult where hasAttemptedOfficially=1 and contestId=? order by official_points desc ;`,
            values: [contestId]
        })
        contestResults.forEach((contestResult, index) => {
            contestResult.position = index + 1
            const { contestantId } = contestResult
            executeSqlAsync({
                sql: `update contestResult set position=? where contestId=? and contestantId=?;`,
                values: [index + 1, contestId, contestantId]
            })
            let _contestResult = ContestResult.extractDataFromDB([contestResult])
            _contestResult.storeInRedis()
        });
    }
    static async findContestById({ id }) {

        let _contest = await RedisClient.queryCache(`contest_${id}`)
        if (_contest != null)
            return _contest

        let [contest] = await executeSqlAsync({
            sql: `select * from contest where id=?;`,
            values: [id]
        })
        RedisClient.store(`contest_${id}`, contest)
        return contest
    }
    static async findContestByProblemId(problemId) {
        let _contest = await RedisClient.queryCache(`problem_${problemId}_contest`)
        if (_contest != null) return _contest
        let problem = await this.findProblemById(problemId)
        let contest = await this.findContestById({ id: problem.contestId })
        RedisClient.store(`problem_${problemId}_contest`, contest)
        return contest

    }
    static async saveMessageToContestThread({ contestId, senderId, senderName, message, time }) {
        return executeSqlAsync({
            sql: QueryBuilder.insertQuery(
                'contestMessage',
                ['contestId', 'senderId', 'senderName', 'message', 'time']
            ),
            values: [contestId, senderId, senderName, message, time]
        })
    }
    static async getContestMessages({ contestId }) {
        return executeSqlAsync({
            sql: `select * from contestMessage where contestId=? order by time ;`,
            values: [contestId]
        })
    }
    static async getContests() {
        let now = new Date() * 1
        return executeSqlAsync({
            sql: `SELECT id,startTime,endTime,title,hostId, 
                (select userName from user WHERE user.id=hostId) 
                as hostName from contest where contest.endTime<? order by startTime desc;`,
            values: [now]
        })
    }

    static async getUpcomingContests() {
        let time = (new Date()) * 1
        return executeSqlAsync({
            sql: `SELECT id,startTime,endTime,title,hostId, 
                (select userName from user WHERE user.id=hostId) 
                as hostName from contest where contest.startTime>=? or (contest.startTime<=? and contest.endTime>=?) order by contest.startTime;`,
            values: [time, time, time]
        })
    }
    static async findProblemById(id) {
        let _problem = await RedisClient.queryCache(`problem_${id}`)
        if (_problem != null) return _problem
        let [problemInfo] = await executeSqlAsync({
            sql: `select * from problem where id=?`,
            values: [id]
        })

        RedisClient.store(`problem_${id}`, problemInfo)
        return problemInfo

    }
    static async getProblemInfo({ id }) {
        let problem = await this.findProblemById(id)
        let contest = await this.findContestById({ id: problem.contestId })
        problem.contestName = contest.title
        problem.contestCode = contest.code

        return problem
    }
    static async getContestProblems({ id }) {
        return executeSqlAsync({
            sql: `SELECT * from problem WHERE
                    problem.contestId=?;`,
            values: [id]
        })
    }
    static async createContest({ title, startTime, endTime, hostId, code }) {
        try {
            if (await executeSqlAsync({
                sql: "select * from contest where title=?;"
                , values: [title]
            })[0]) {
                throw new Error("Contest with the same name exists!");
            }

            await executeSqlAsync({
                sql: QueryBuilder.insertQuery('contest', ['title', 'startTime', 'endTime', 'hostId', 'code', 'status']),
                values: [title, new Date(startTime) * 1, new Date(endTime) * 1, hostId, code, 0]
            })
            let [{ contestId }] = await executeSqlAsync({
                sql: `select max(id) as contestId from contest where 
                hostId=?  ;`,
                values: [hostId]
            })
            return contestId
        } catch (error) {
            //console.log(error)
            throw error;
        }

    }



    static async createProblem({ contestId, title, points, code, createdOn }, user) {

        if (!await this.isAllowedToEditContest(contestId, user.id)) {
            throw new Error("Access Denied!")
        }

        await executeSqlAsync({
            sql: QueryBuilder.insertQuery('problem', ['contestId', 'title', 'points', 'code', "createdOn"]),
            values: [contestId, title, points * 100, code, createdOn]
        })
        let [{ newId }] = await executeSqlAsync({
            sql: `select max(id) as newId from problem where 
                  contestId=?;`,
            values: [contestId]
        })



        return newId
    }


    static async searchContestByProblem({ problemId }) {

        const problem = await this.findProblemById(problemId)
        return await this.findContestById({ id: problem.contestId })
    }



    static async getContestStandings({ contestId, isOfficial }) {
        return executeSqlAsync({
            sql: `select contestId,contestantId, unofficial_ac_time,official_ac_time, (select userName from user where user.id=contestantId) as contestantName,
                points, description,official_description,official_points,verdicts, officialVerdicts
                from contestResult where contestId=? and ${isOfficial ? 'hasAttemptedOfficially' : 'hasAttemptedUnofficially'}=1 order by ${!isOfficial ? 'points' : 'official_points'} desc  ; `,
            values: [contestId]
        })
    }

    static async isAllowedToEditContest(contestId, userId, contest = null) {
        contest = contest ?? await this.findContestById({ id: contestId })
        if (!contest) {
            throw new Error("Contest Not Found!")
        }
        if (contest.hostId == userId) return true
        if (await this.isContributor(contestId, userId)) return true
        return false
    }

    static async getFullContestDetailsForEdit({ contestId }, user) {
        let data = {};
        let contestInfo = await this.findContestById({ id: contestId })
        if (!contestInfo) {
            throw new Error("Contest Not Found!");
        }
        if (!await this.isAllowedToEditContest(contestId, user.id, contestInfo)) {
            throw new Error("Access Denied!")
        }
        data = { ...data, ...contestInfo }
        await executeSqlAsync({
            sql: `select * from problem where contestId=?`,
            values: [contestId]
        }).then(problems => {
            data = { ...data, problems }
        });
        return data
    }


    static async updateContestInfo({ id, title, startTime, endTime, code }, user, isForceUpdate = false) {
        let contest = await this.findContestById({ id });
        if (!contest || contest.hostId != user.id) {
            throw new Error("Invalid Request!");

        }
        if (startTime > endTime) {
            throw new Error("End time must be greater than start time!")
        }

        if (!await this.isAllowedToEditContest(id, user.id, contest)) {
            throw new Error("Access Denied!")
        }
        let transaction = await beginTransaction(process.env);
        try {
            let fieldToBeUpdated = ['title', 'code', 'endTime'];
            let values = [title, code, new Date(endTime) * 1];

            if (contest.startTime != startTime * 1 && !isForceUpdate) {
                if (contest.startTime < (new Date()) * 1 && startTime * 1 > (new Date()) * 1 && !isForceUpdate) {
                    throw new Error("Contest has already started. If you want to update the start time, please check the force update option.")
                }
            }

            if (isForceUpdate && contest.startTime != startTime * 1) {
                let submissionsMadeBeoreNewStartTime = await executeSqlAsync({
                    sql: `select id,submissionFileURL as submissionCount from submission where contestId=? and time<?;`,
                    values: [id, startTime]
                });
                if (submissionsMadeBeoreNewStartTime.length > 0) {
                    // delete those submissions and files
                    for (let submission of submissionsMadeBeoreNewStartTime) {
                        await executeSqlAsync({
                            sql: `delete from submission where id=?;`,
                            values: [submission.id]
                        }, transaction);
                        let fileDir = path.join(getFileDir(), submission.submissionFileURL);

                        fs.unlinkSync(fileDir);

                    }
                }
                fieldToBeUpdated.push('startTime')
                values.push(new Date(startTime) * 1)
            }
            await executeSqlAsync({
                sql: QueryBuilder.createUpdateQuery('contest',
                    fieldToBeUpdated) + `where id=?;`,
                values: [...values, id]
            }, transaction);
            if (isForceUpdate) {
                await RedisClient.flustAll();
            }
            this.findContestById({ id })
                .then(_contest => {
                    RedisClient.store(`contest_${id}`, {
                        ..._contest,
                        'title': title,
                        'startTime': startTime,
                        'endTime': endTime,
                        'code': code
                    })
                })
        } catch (error) {
            transaction.rollback();
            console.log(error)
            throw new Error(error.message || "Database Error!");
        }
        finally {
            transaction.destroy();
        }


    }
    static async updateProblemInfo({ id, title, code, points }, user) {
        if (!await this.isAllowedToEditContest((await this.findProblemById(id))?.contestId ?? 0, user.id)) {
            throw new Error("Access Denied!")
        }
        let problem = await this.findProblemById(id);
        if (!problem) {
            throw new Error("Invalid Request!");
        }
        let transaction = await beginTransaction(process.env);
        try {
            await executeSqlAsync({
                sql: QueryBuilder.createUpdateQuery('problem',
                    ['title', 'code', 'points']) + ` where id=?;`,
                values: [title, code, points, id]
            })

            RedisClient.queryCache(`problem_${id}`)
                .then(_problem => {
                    RedisClient.store(`problem_${id}`, {
                        ..._problem,
                        'title': title,
                        'points': points,
                        'code': code
                    })
                })

        } catch (error) {
            transaction.rollback();
            throw new Error("Database Error!");
        }
        finally {
            transaction.destroy();
        }

    }
    static async getParticipatedContestList({ userId, pageNumber }) {
        return executeSqlAsync({
            sql: `select
                    contestId,
                    official_points,
                    position, (
                        select startTime
                        from
                            contest
                        where contest.id= contestId
                    ) as participationTime,
                     (
                        select title
                        from
                            contest
                        where contest.id= contestId
                    ) as contestTitle
                from contestResult
                where
                      contestantId = ?
                    and (select status from contest where contest.id=contestResult.contestId)=2
                order by participationTime  desc
                limit ?, 10;`,
            values: [userId, pageNumber * 1]

        })
    }
    static async hasSolvedProblem_({ userId, problemId }) {

        let contest = await this.findContestByProblemId(problemId)
        let contestResult = await ContestResult.find({
            contestantId: userId,
            contestId: contest.id
        })
        if (contestResult == null) return {}
        return {
            official: contestResult.officialVerdicts[problemId],
            unofficial: contestResult.verdicts[problemId]
        }
    }
}