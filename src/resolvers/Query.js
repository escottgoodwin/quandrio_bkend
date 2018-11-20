
async function users(parent, args, ctx, info) {

  const where = args.filter
      ? {
          OR: [
            { id: args.filter },
            { firstName: args.filter },
            { lastName: args.filter },
            { phone: args.filter },
            { online: args.filter },
            { type: args.filter },
            { email: args.filter }
          ],
        }
      : {}

    return await ctx.db.query.users({ where }, info)
}

async function institutions(parent, args, ctx, info) {

  const where = args.filter
      ? {
          OR: [
            { id: args.filter },
            { name: args.filter },
            { type: args.filter },
          ],
        }
      : {}

    return await ctx.db.query.institutions({ where }, info)
}

async function courses(parent, args, ctx, info) {

  const where = args.filter
      ? {
          OR: [
            { id: args.filter },
            { name: args.filter },
            { courseNumber: args.filter },
            { time: args.filter },
          ],
        }
      : {}

    return await ctx.db.query.courses({ where }, info)
}

async function tests(parent, args, ctx, info) {

  const where = args.filter
      ? {
          OR: [
            { id: args.filter },
            { subject: args.filter },
            { testNumber: args.filter },
            { time: args.filter },
          ],
        }
      : {}

    return await ctx.db.query.tests({ where }, info)
}

async function panels(parent, args, ctx, info) {

  const where = args.filter
      ? {
          OR: [
            { id: args.filter },
            { link: args.filter },
          ],
        }
      : {}

    return await ctx.db.query.panels({ where }, info)
}

async function questions(parent, args, ctx, info) {

  const where = args.filter
      ? {
          OR: [
            { id: args.filter },
            { question: args.filter },
          ],
        }
      : {}

    return await ctx.db.query.questions({ where }, info)
}

async function questionchoices(parent, args, ctx, info) {

  const where = args.filter
      ? {
          OR: [
            { id: args.filter },
            { choice: args.filter },
          ],
        }
      : {}

    return await ctx.db.query.questionchoices({ where }, info)
}

async function challenges(parent, args, ctx, info) {

  const where = args.filter
      ? {
          OR: [
            { id: args.filter },
            { challenge: args.filter },
          ],
        }
      : {}

    return await ctx.db.query.challenges({ where }, info)
}


module.exports = {
  users,
  institutions,
  courses,
  tests,
  panels,
  questions,
  questionchoices,
  challenges
}
