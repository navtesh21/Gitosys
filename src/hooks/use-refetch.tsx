import { useQueryClient } from '@tanstack/react-query'
import React from 'react'


function useRefetch() {

    const queryClient = useQueryClient()
    
  return  async function refetch() {
    await queryClient.refetchQueries({
        type:'active'   
    })
  }
}

export default useRefetch