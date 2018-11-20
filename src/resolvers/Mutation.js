const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils')
var moment = require('moment');

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

function updateInstitution(parent, { id, name, type, contacts, teachers, students, courses }, ctx, info) {
  const userId = getUserId(ctx)
  const updateDate = new Date()
  return ctx.db.mutation.updateInstitution(
    {
      data: {
        name,
        type,
        contacts: {
          connect: [{ id: contactId  }]
        },
        teachers: {
          connect: [{ id: teacherId  }]
        },
        students: {
          connect: [{ id: studentId  }]
        },
        courses: {
          connect: [{ id: studentId  }]
        },
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

module.exports = {
  addInstitution,
  updateInstitution,
  addCourse,
  addTest,
  addPanel,
  signup,
  login,
}
