const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils')
var moment = require('moment');
const util = require('util');

function checkField(itemIds) {
    if (itemIds) {
      if (Array.isArray(itemIds)) {
        return items = { connect: itemIds.map(x => ({id: x})) }
    } else {
      return items = []
    }

    if (typeof itemIds === 'string') {
        return items = { connect: itemIds }
    } else {
        return items = ''
    }
  }
}

async function signup(parent, args, ctx, info) {
  const password = await bcrypt.hash(args.password, 10)
  const user = await ctx.db.mutation.createUser({
    data: { ...args, password },
  })

  const token = jwt.sign({ userId: user.id }, APP_SECRET)

  return {
    token,
    user,
  }
}

async function login(parent, args, ctx, info) {
  const user = await ctx.db.query.user({ where: { email: args.email } })
  if (!user) {
    throw new Error('No such user found')
  }

  const valid = await bcrypt.compare(args.password, user.password)
  if (!valid) {
    throw new Error('Invalid password')
  }

  return {
    token: jwt.sign({ userId: user.id }, APP_SECRET),
    user,
  }
}

async function addInstitution(parent, { name, type }, ctx, info) {
  const userId = await getUserId(ctx)
  const addedDate = new Date()

  return await ctx.db.mutation.createInstitution(
    {
      data: {
        name,
        type
      },
    },
    info
  )
}

async function updateInstitution(parent, { id, name, type, contactIds, teacherIds, studentIds, courseIds }, ctx, info) {
  const userId = await getUserId(ctx)
  const updateDate = new Date()

  const contacts = await checkField(contactIds)
  const teachers = await checkField(teacherIds)
  const courses = await checkField(courseIds)
  const students = await checkField(studentIds)

  return await ctx.db.mutation.updateInstitution(
    {
      data: {
        name,
        type,
        updateDate,
        updatedBy: {
          connect: { id: userId  }
        },
        contacts,
        teachers,
        students,
        courses,
      },
      where: {
        id: id
      },
    },
    info
  )
}

async function deleteInstitution(parent, { id }, ctx, info) {

  return await ctx.db.mutation.deleteInstitution(
    {
      where: {
        id: id
      }
    },
    info
  )
}

async function addCourse(parent, { name, courseNumber, time, institutionId }, ctx, info) {
  const userId = await getUserId(ctx)
  const addedDate = new Date()

  return await ctx.db.mutation.createCourse(
    {
      data: {
        name,
        courseNumber,
        time,
        addedDate,
        institution: {
          connect: { id: institutionId  }
        },
        addedBy: {
          connect: { id: userId },
        },
        teachers: {
          connect: [{ id: userId }],
        },
      },
    },
    info
  )
}

async function updateCourse(parent, { id, name, courseNumber, time, teacherIds, studentIds }, ctx, info) {
  const userId = await getUserId(ctx)
  const updateDate = new Date()

  const teachers = await checkField(teacherIds)
  const students = await checkField(studentIds)

  //const course = await ctx.db.query.course({where: { id: id } },`{ teachers { id } }`)
  const course = await ctx.db.query.course({where: { id: id } },info)
  const courseteachers = JSON.stringify(course.teachers)

  if (courseteachers.includes(userId)){

      return await ctx.db.mutation.updateCourse(
        {
          data: {
            name,
            courseNumber,
            time,
            teachers,
            students,
            updateDate,
            updatedBy: {
              connect: {
                id: userId
              },
            },
          },
          where: {
            id: id
          },
        },
        info
      )
  }
  throw new Error(`Unauthorized, must be a teacher for this course`)
}

async function deleteCourse(parent, { id }, ctx, info) {

  const userId = await getUserId(ctx)
  const course = await ctx.db.query.course({where: { id: id } },`{ teachers { id } }`)
  const courseteachers = JSON.stringify(course.teachers)

  if (courseteachers.includes(userId)) {

    return await ctx.db.mutation.deleteCourse(
      {
        where: {
          id: id
        }
      },
      info
    )
  }
  throw new Error(`Unauthorized, must be a teacher for this course`)
}

async function addTest(parent, { subject, testNumber, testDate, courseId }, ctx, info) {
  const userId = await getUserId(ctx)
  const addedDate = new Date()

  return await ctx.db.mutation.createTest(
    {
      data: {
        subject,
        testNumber,
        testDate,
        addedDate,
        published: false,
        release: false,
        course: {
          connect: { id: courseId  }
        },
        addedBy: {
          connect: { id: userId },
        },
      },
    },
    info
  )
}

async function updateTest(parent, { id, subject, testNumber, testDate, published, publishDate, release, releaseDate }, ctx, info) {
  const userId = await getUserId(ctx)
  const updateDate = new Date()

  const test = await ctx.db.query.test({where: { id: id } },`{ course { teachers { id } } }`)
  const testTeachers = JSON.stringify(test.course)

  if (testTeachers.includes(userId)){

    return await ctx.db.mutation.updateTest(
      {
        data: {
          subject,
          testNumber,
          testDate,
          published,
          publishDate,
          release,
          releaseDate,
          updateDate,
          updatedBy: {
            connect: {
              id: userId
            },
          },
        },
        where: {
          id: id
      },
    },
      info
    )
  }
  throw new Error(`Unauthorized, must be a teacher for this test`)
}

async function deleteTest(parent, { id }, ctx, info) {

  const userId = await getUserId(ctx)
  const test = await ctx.db.query.test({where: { id: id } },`{ course { teachers { id } } }`)
  const testTeachers = JSON.stringify(test.course)

  if (testTeachers.includes(userId)){

    return await ctx.db.mutation.deleteTest(
      {
        where: {
          id: id
        }
      },
      info
    )
  }
  throw new Error(`Unauthorized, must be a teacher for this test`)
}

async function addPanel(parent, { link, testId }, ctx, info) {
  const userId = await getUserId(ctx)
  const addedDate = new Date()

  const test = await ctx.db.query.test({where: { id: testId } },`{ course { teachers { id } } }`)
  const testTeachers = JSON.stringify(test.course)

  if (testTeachers.includes(userId)){

    return await ctx.db.mutation.createPanel(
      {
        data: {
          link,
          addedDate,
          test: {
            connect: { id: testId  }
          },
          addedBy: {
            connect: { id: userId },
          },
        },
      },
      info
    )
  }
  throw new Error(`Unauthorized, must be a teacher for this test`)
}

async function deletePanel(parent, { id }, ctx, info) {

  const userId = await getUserId(ctx)
  const test = await ctx.db.query.panel({where: { id: id } },`{ test { course { teachers { id } } } }`)
  const testTeachers = JSON.stringify(test.course)

  if (testTeachers.includes(userId)){

    return await ctx.db.mutation.deletePanel(
      {
        where: {
          id: id
        }
      },
      info
    )
  }
  throw new Error(`Unauthorized, must be a teacher for this panel`)
}

async function addQuestion(parent, { question, testId, panelId }, ctx, info) {

  const userId = await getUserId(ctx)
  const questionTime = new Date()
  const expirationTime = new Date()
  expirationTime.setHours(expirationTime.getHours() + 1);

  const test = await ctx.db.query.test({where: { id: testId } },`{ course { students { id } } }`)
  const testStudents = JSON.stringify(test.course.students)

  if (testStudents.includes(userId)){

    return await ctx.db.mutation.createQuestion(
      {
        data: {
          questionTime,
          question,
          expirationTime,
          test: {
            connect: { id: testId  }
          },
          panel: {
            connect: { id: panelId  }
          },
          questionBy: {
            connect: { id: userId },
          }
        },
      },
      info
    )
  }
  throw new Error(`Unauthorized, must be a student for this test`)
}

async function updateQuestion(parent, { id, question }, ctx, info) {
  const userId = await getUserId(ctx)
  const updateDate = new Date()

  const test = ctx.db.exists.Question({ id: id, questionBy: userId })

  if (test){

    return await ctx.db.mutation.updateQuestion(
      {
        data: {
          question,
          updateDate,
          updatedBy: {
            connect: {
              id: userId
            },
          },
        },
        where: {
          id: id
      },
      },
      info
    )
  }
  throw new Error(`Unauthorized, must be your question`)
}

async function deleteQuestion(parent, { id }, ctx, info) {

  const userId = await getUserId(ctx)

  const test = ctx.db.exists.Question({ id: id, questionBy: userId })

  if (test){

    return await ctx.db.mutation.deleteQuestion(
      {
        where: {
          id: id
        }
      },
      info
    )
  }
  throw new Error(`Unauthorized, must be your question`)
}

async function addQuestionChoice(parent, { choice, correct, questionId }, ctx, info) {
  const userId = await getUserId(ctx)
  // query question(questionId) if userId === addedBy
  const question = ctx.db.exists.Question({ id: questionId, questionBy: userId })

  if (question){

    return await ctx.db.mutation.createQuestionChoice(
      {
        data: {
          choice,
          correct,
          question: {
            connect: { id: questionId },
          }
        },
      },
      info
    )
  }
  throw new Error(`Unauthorized, must be your question`)
}

async function updateQuestionChoice(parent, { id, choice, correct }, ctx, info) {
  const userId = await getUserId(ctx)
  const updateDate = new Date()
  // query question(id) if userId === addedBy
  const question = ctx.db.exists.Question({ id: id, questionBy: userId })

  if (question){

    return await ctx.db.mutation.updateQuestionChoice(
      {
        data: {
          choice,
          correct,
          updateDate,
          updatedBy: {
            connect: {
              id: userId
            },
          },
        },
        where: {
          id: id
        },
      },
      info
    )
  }
  throw new Error(`Unauthorized, must be your question`)
}

async function deleteQuestionChoice(parent, { id }, ctx, info) {
  const userId = await getUserId(ctx)
  // query question(id) if userId === addedBy
  const test = ctx.db.exists.Question({ id: id, questionBy: userId })

  if (test){

    return await ctx.db.mutation.deleteQuestionChoice(
      {
        where: {
          id: id
        }
      },
      info
    )
  }
  throw new Error(`Unauthorized, must be your question`)
}

async function addChallenge(parent, { challenge, questionId }, ctx, info) {
  const userId = await getUserId(ctx)
  const challengeTime = new Date()

  // query challenge(id) question creator, answerer or test teacher
  const test = await ctx.db.query.question({where: { id: tquestionId } },`{ questionBy { id } sentTo { id } test { course { teacherss { id }  } } }`)
  const testStudents = JSON.stringify(test.course)

  return await ctx.db.mutation.createChallenge(
    {
      data: {
        challenge,
        challengeTime,
        question: {
          connect: { id: questionId  }
        },
        challenger: {
          connect: { id: userId },
        }
      },
    },
    info
  )
}

async function updateChallenge(parent, { id, challenge }, ctx, info) {
  const userId = await getUserId(ctx)
  const updateDate = new Date()

  // query challenge(id) question creator, answerer or test teacher

  return await  ctx.db.mutation.updateChallenge(
    {
      data: {
        challenge,
        updateDate,
        updatedBy: {
          connect: {
            id: userId
          },
        },
      },
      where: {
        id: id
      },
    },
    info
  )
}

async function deleteChallenge(parent, { id }, ctx, info) {

  // query question(id) if userId === addedBy

  return await ctx.db.mutation.deleteChallenge(
    {
      where: {
        id: id
      }
    },
    info
  )
}

async function addAnswer(parent, { answerChoiceId, questionId }, ctx, info) {
  const userId = await getUserId(ctx)
  const answerTime = new Date()

  // only person who was sent question can answer
  const test = ctx.db.exists.Question({ id: questionId, sentTo: userId })

  if (test){

    return ctx.db.mutation.createAnswer(
      {
        data: {
          answerTime,
          answer: {
          connect: { id: answerChoiceId  }
          },
          answeredBy: {
            connect: { id: userId },
          },
          question: {
            connect: { id: questionId  }
          },
        },
      },
      info
    )
  }
  throw new Error(`Unauthorized, must be your question`)
}

async function deleteAnswer(parent, { id }, ctx, info) {
  const userId = await getUserId(ctx)

  const test = ctx.db.exists.Answer({ id: id, sentTo: userId })

  if (test){

    return await ctx.db.mutation.deleteAnswer(
      {
        where: {
          id: id
        }
      },
      info
    )
  }
  throw new Error(`Unauthorized, must be your question`)
}

async function addSequence(parent, { testId, studentIds, panelIds }, ctx, info) {
  const userId = await getUserId(ctx)
  const sequenceAdded = new Date()

  const studentObjs = await studentIds.map(x => ({id: x}));
  const panelIds = await panelIds.map(x => ({id: x}));

  return ctx.db.mutation.createSequence(
    {
      data: {
        sequenceAdded,
        test: {
          connect: { id: testId  }
        },
        students: {
          connect: studentObjs,
        },
        panels: {
          connect: panelIds
        },
      },
    },
    info
  )
}

async function updateSequence(parent, { id, studentIds,  panelIds, usedStudentIds,  usedPanelIds }, ctx, info) {
  const userId = await getUserId(ctx)
  const sequenceAdded = new Date()

  const students = await checkField(studentIds)
  const panels = await checkField(panelIds)
  const usedStudents = await checkField(usedStudentIds)
  const usedPanels = await checkField(usedPanelIds)

  return await ctx.db.mutation.updateSequence(
    {
      data: {
        students,
        panels,
        usedStudents,
        usedPanels
      },
      where: {
        id: id
      },
    },
    info
  )
}

async function deleteSequence(parent, { id }, ctx, info) {

  return await ctx.db.mutation.deleteSequence(
    {
      where: {
        id: id
      }
    },
    info
  )
}

async function updateUser(parent, { id, email, newPassword, firstName, lastName, phone, online }, ctx, info) {
  const userId = await getUserId(ctx)
  const updateDate = new Date()

  const test = ctx.db.exists.User({ id: userId })
  const user = await getUser(ctx)
  const role = user.role

  if(test || role === 'ADMIN' || role === 'QUANDRIA') {

    let password = ''
    if (newPassword) {
      let password = await bcrypt.hash(newPassword, 10)
    }

    // query user(id) if userId === id

    return await ctx.db.mutation.updateUser(
      {
        data: {
          email,
          password,
          firstName,
          lastName,
          phone,
          online,
          updateDate,
          updatedBy: {
            connect: {
              id: userId
            },
          },
        },
        where: {
          id: id
      },
    },
      info
    )
  }
  throw new Error(`Unauthorized, must be your profile`)
}

async function deleteUser(parent, { id }, ctx, info) {
  const userId = await getUserId(ctx)
  // query user(id) if userId === id
  const test = ctx.db.exists.User({ id: userId })
  const admin = await getUser(ctx)
  const role = user.role

  if(test || role === 'ADMIN' || role === 'QUANDRIA') {

    return await ctx.db.mutation.deleteUser(
      {
        where: {
          id: id
        }
      },
      info
    )
  }
  throw new Error(`Unauthorized, must be your profile`)
}

module.exports = {
  signup,
  login,
  addInstitution,
  updateInstitution,
  deleteInstitution,
  addCourse,
  updateCourse,
  deleteCourse,
  addTest,
  updateTest,
  deleteTest,
  addPanel,
  deletePanel,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  addQuestionChoice,
  updateQuestionChoice,
  deleteQuestionChoice,
  addChallenge,
  updateChallenge,
  deleteChallenge,
  addAnswer,
  deleteAnswer,
  addSequence,
  updateSequence,
  deleteSequence,
  updateUser,
  deleteUser
}
