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

function add_institution(parent, { jobTitle, location, description, address, city, state, zip, clientId }, ctx, info) {
  const userId = getUserId(ctx)
  const addedDate = new Date()
  const brochure_sent = new Date()
  const app_deadline = new Date()
  const screening_deadline = new Date()
  const presentation = new Date()
  const background_deadline = new Date()
  const final_interview = new Date()

  brochure_sent.setDate(addedDate.getDate() + 14);
  app_deadline.setDate(addedDate.getDate() + 44);
  screening_deadline.setDate(addedDate.getDate() + 58);
  presentation.setDate(addedDate.getDate() + 65);
  background_deadline.setDate(addedDate.getDate() + 79);
  final_interview.setDate(addedDate.getDate() + 86);

  return ctx.db.mutation.createJob(
    {
      data: {
        jobTitle,
        addedDate,
        location,
        description,
        address,
        city,
        state,
        zip,
        brochure_sent,
        app_deadline,
        screening_deadline,
        presentation,
        background_deadline,
        final_interview,
        client: {
          connect: { id: clientId },
        },
        addedBy: {
          connect: { id: userId },
        },
        consultants:
          {
            connect: [{ id: userId }],
          }
      },
    },
    info
  )
}



function update_institution(parent, { id, clientName, address, city, state, zip, phone, email }, ctx, info) {
  const userId = getUserId(ctx)
  const updateDate = new Date()
  return ctx.db.mutation.updateClient(
    {
      data: {
        clientName,
        address,
        city,
        state,
        zip,
        phone,
        email,
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



module.exports = {
  add_institution,
  update_institution,
  signup,
  login,
}
