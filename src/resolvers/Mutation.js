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

async function updateInstitution(parent, { id, name, type }, ctx, info) {
  const userId = await getUserId(ctx)
  const updateDate = new Date()

  return await ctx.db.mutation.updateInstitution(
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

  return await ctx.db.mutation.updateCourse(
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

async function deleteCourse(parent, { id }, ctx, info) {

  return await ctx.db.mutation.deleteCourse(
    {
      where: {
        id: id
      }
    },
    info
  )
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

async function deleteTest(parent, { id }, ctx, info) {

  return await ctx.db.mutation.deleteTest(
    {
      where: {
        id: id
      }
    },
    info
  )
}

async function addPanel(parent, { link, testId }, ctx, info) {
  const userId = await getUserId(ctx)
  const addedDate = new Date()

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

async function addQuestion(parent, { question, testId, panelId }, ctx, info) {
  const userId = await getUserId(ctx)
  const questionTime = new Date()
  const expirationTime = new Date()
  expirationTime.setHours(expirationTime.getHours() + 1);

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

async function updateQuestion(parent, { id, question }, ctx, info) {
  const userId = await getUserId(ctx)
  const updateDate = new Date()

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

async function addQuestionChoice(parent, { choice, correct, questionId }, ctx, info) {

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

async function updateQuestionChoice(parent, { id, choice, correct }, ctx, info) {

  const userId = await getUserId(ctx)
  const updateDate = new Date()

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

async function addChallenge(parent, { challenge, questionId }, ctx, info) {
  const userId = await getUserId(ctx)
  const challengeTime = new Date()

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

async function addAnswer(parent, { answerChoiceId, questionId }, ctx, info) {
  const userId = await getUserId(ctx)
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

async function updateUser(parent, { id, email, newPassword, firstName, lastName, phone, online }, ctx, info) {
  const userId = await getUserId(ctx)
  const updateDate = new Date()
  let password = ''
  if (newPassword) {
    let password = await bcrypt.hash(newPassword, 10)
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
  deleteInstitution,
  addCourse,
  updateCourse,
  deleteCourse,
  addTest,
  updateTest,
  deleteTest,
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
