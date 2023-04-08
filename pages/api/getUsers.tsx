// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {NextApiRequest, NextApiResponse} from "next";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// @ts-ignore
BigInt.prototype.toJSON = function() {
  return this.toString()
}

async function main() {
  let timestamp = new Date().getTime();
  let users = await prisma.user.findMany();

  return users
}

export default function handler(req: NextApiRequest,
                                res: NextApiResponse) {

  main()
  .then(async (users) => {
    res.status(200).json(users)
  })
  .catch(async (e) => {
    console.error(e)
    res.status(500)
    process.exit(1)
  })
}
