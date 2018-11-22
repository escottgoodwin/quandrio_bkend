const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils')
var moment = require('moment');

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

function addInstitution(parent, { name, type }, ctx, info) {
  const userId = getUserId(ctx)
  const addedDate = new Date()

  return ctx.db.mutation.createInstitution(
    {
      data: {
        name,
        type
      },
    },
    info
  )
}

function updateInstitution(parent, { id, name, type }, ctx, info) {
  const userId = getUserId(ctx)
  const updateDate = new Date()

  return ctx.db.mutation.updateInstitution(
    {
      data: {
        name,
        type,
        updateDate,
        updatedBy: {
          connect: { id: userId  }
        }
      },
      where: {
        id: id
      },
    },
    info
  )
}

function updateInstitution(parent, { id, name, type, contactIds, teacherIds, studentIds, courseIds }, ctx, info) {
  const userId = getUserId(ctx)
  const updateDate = new Date()

  const contacts = checkField(contactIds)
  const teachers = checkField(teacherIds)
  const courses = checkField(courseIds)
  const students = checkField(studentIds)

  return ctx.db.mutation.updateInstitution(
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

function addCourse(parent, { name, courseNumber, time, institutionId }, ctx, info) {
  const userId = getUserId(ctx)
  const addedDate = new Date()

  return ctx.db.mutation.createCourse(
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

function updateCourse(parent, { id, name, courseNumber, time, teacherIds, studentIds }, ctx, info) {
  const userId = getUserId(ctx)
  const updateDate = new Date()

  const teachers = checkField(teacherIds)
  const students = checkField(studentIds)

  return ctx.db.mutation.updateCourse(
    {
      data: {
        name,
        courseNumber,
        time,
        updateDate,
        updatedBy: {
          connect: {
            id: userId
          },
        },
        teachers,
        students,
      },
      where: {
        id: id
      },
    },
    info
  )
}

function addTest(parent, { subject, testNumber, testDate, courseId }, ctx, info) {
  const userId = getUserId(ctx)
  const addedDate = new Date()

  return ctx.db.mutation.createTest(
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

function updateTest(parent, { id, subject, testNumber, testDate, published, publishDate, release, releaseDate }, ctx, info) {
  const userId = getUserId(ctx)
  const updateDate = new Date()

  return ctx.db.mutation.updateTest(
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

function addPanel(parent, { link, testId }, ctx, info) {
  const userId = getUserId(ctx)
  const addedDate = new Date()

  return ctx.db.mutation.createPanel(
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

function addQuestion(parent, { question, testId, panelId }, ctx, info) {
  const userId = getUserId(ctx)
  const questionTime = new Date()
  const expirationTime = new Date()
  expirationTime.setHours(expirationTime.getHours() + 1);

  return ctx.db.mutation.createQuestion(
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

function updateQuestion(parent, { id, question }, ctx, info) {
  const userId = getUserId(ctx)
  const updateDate = new Date()

  return ctx.db.mutation.updateQuestion(
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

function addQuestionChoice(parent, { choice, correct, questionId }, ctx, info) {

  return ctx.db.mutation.createQuestionChoice(
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

function updateQuestionChoice(parent, { id, choice, correct }, ctx, info) {

  const userId = getUserId(ctx)
  const updateDate = new Date()

  return ctx.db.mutation.updateQuestionChoice(
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

function addChallenge(parent, { challenge, questionId }, ctx, info) {
  const userId = getUserId(ctx)
  const challengeTime = new Date()

  return ctx.db.mutation.createChallenge(
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

function updateChallenge(parent, { id, challenge }, ctx, info) {
  const userId = getUserId(ctx)
  const updateDate = new Date()

  return ctx.db.mutation.updateChallenge(
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

function addAnswer(parent, { answerChoiceId, questionId }, ctx, info) {
  const userId = getUserId(ctx)
  const answerTime = new Date()

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

function addSequence(parent, { testId, studentIds, panelIds }, ctx, info) {
  const userId = getUserId(ctx)
  const sequenceAdded = new Date()

  const studentObjs = studentIds.map(x => ({id: x}));
  const panelIds = panelIds.map(x => ({id: x}));

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

function updateSequence(parent, { id, studentIds,  panelIds, usedStudentIds,  usedPanelIds }, ctx, info) {
  const userId = getUserId(ctx)
  const sequenceAdded = new Date()

  const students = checkField(studentIds)
  const panels = checkField(panelIds)
  const usedStudents = checkField(usedStudentIds)
  const usedPanels = checkField(usedPanelIds)

  return ctx.db.mutation.updateSequence(
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

async function updateUser(parent, { id, email, newPassword, firstName, lastName, phone, online }, ctx, info) {
  const userId = getUserId(ctx)
  const updateDate = new Date()
  let password = ''
  if (newPassword) {
    let password = bcrypt.hash(newPassword, 10)
  }


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

module.exports = {
  signup,
  login,
  addInstitution,
  updateInstitution,
  addCourse,
  updateCourse,
  addTest,
  updateTest,
  addPanel,
  addQuestion,
  updateQuestion,
  addQuestionChoice,
  updateQuestionChoice,
  addChallenge,
  updateChallenge,
  addAnswer,
  addSequence,
  updateSequence,
  updateUser
}
