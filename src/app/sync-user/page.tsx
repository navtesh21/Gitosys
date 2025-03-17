import { db } from '@/server/db'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import React from 'react'

async function  page() {
    const {userId} = await auth()

    if(!userId){
        throw new Error('Not authenticated')
    }

    const client = await clerkClient()
    const user = await client.users.getUser(userId)

    if(!user.emailAddresses[0]?.emailAddress){
        return notFound()
    }

 await db.user.upsert({
     where: {
         email: user.emailAddresses[0].emailAddress
     },
     create: {
         email: user.emailAddresses[0].emailAddress,
         firstName: user.firstName,
         lastName: user.lastName,
         id: user.id,
         imageUrl: user.imageUrl

     },
     update: {
         firstName: user.firstName,
         lastName: user.lastName,
         imageUrl: user.imageUrl
     }
 })

  return redirect('/dashboard')
}

export default page