'use client';
import { AlertDialog, Button, Flex } from '@radix-ui/themes'
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React from 'react'

const DeleteIssueButton = ({ issueId }: { issueId: number }) => {

    const router = useRouter();

    return (
        <AlertDialog.Root>
            <AlertDialog.Trigger>
                <Button color='red'>Delete Issue</Button>
            </AlertDialog.Trigger>
            <AlertDialog.Content>
                <AlertDialog.Title>
                    Confirm Deletation
                </AlertDialog.Title>
                <AlertDialog.Description>
                    Are you sure ? You want to delete this Issue. This action can not be undone.?
                </AlertDialog.Description>
                <Flex gap='4' mt='4'>
                    <AlertDialog.Cancel>
                        <Button variant='soft' color='gray'>cancel</Button>
                    </AlertDialog.Cancel>
                    <AlertDialog.Action>
                        <Button color='red' onClick={() => {
                            axios.delete('/api/issues/' + issueId)
                            router.push('/issues')
                            router.refresh();
                        }}>Delete Issue</Button>
                    </AlertDialog.Action>
                </Flex>
            </AlertDialog.Content> 
        </AlertDialog.Root>
    )
}

export default DeleteIssueButton