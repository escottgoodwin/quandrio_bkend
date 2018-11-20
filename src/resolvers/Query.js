
async function users(parent, args, ctx, info) {

  const where = args.filter
      ? {
          OR: [
            { id: args.filter },
            { firstName: args.filter },
            { lastName: args.filter },
            { address: args.filter },
            { city: args.filter },
            { state: args.filter },
            { zip: args.filter },
            { phone: args.filter },
            { online: args.filter },
            { type: args.filter },
            { email: args.filter }
          ],
        }
      : {}

    return await ctx.db.query.users({ where }, info)
}

module.exports = {
  users,
}
