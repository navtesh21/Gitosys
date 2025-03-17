import { SidebarProvider } from '@/components/ui/sidebar'
import { UserButton } from '@clerk/nextjs'
import React from 'react'
import { AppSidebar } from './app-sidebar'

type Props = {
    children: React.ReactNode
}

function layout({children}: Props) {
  return (
    <SidebarProvider>
        <AppSidebar />

        <main className='w-full m-2'>
            <div className='flex items-center gap-2 bg-sidebar border-sidebar-border border shadow rounded-mg p-2 px-4'>

                <div className='ml-auto'></div>
                <UserButton />
            </div>
            <div className='h-4'></div>
            <div className='bg-sidebar border-sidebar-border border shadow rounded-md  px-4 overflow-y-scroll h-[calc(100vh-6rem)] p-4'>
                {children}
            </div>
        </main>
       
    </SidebarProvider>
  )
}

export default layout