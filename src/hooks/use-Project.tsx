import { api } from '@/trpc/react'
import React from 'react'
import {useLocalStorage} from 'usehooks-ts'


function useProject() {

    const {data} = api.project.getProjects.useQuery()
    const [projectId,setProjectId] = useLocalStorage('projectId',"")
    const project = data?.find(project=>project.id === projectId)
  return {
        project,
        setProjectId,
        projectId,
        projects:data
  }
}

export default useProject