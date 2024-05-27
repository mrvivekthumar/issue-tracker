'use client';
import { AlertDialog, Button, Flex } from '@radix-ui/themes'
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'

const DeleteIssueButton = ({ issueId }: { issueId: number }) => {

    const deleteIssue = async () => {
        try {
            await axios.delete('/api/issues/' + issueId)
            router.push('/issues')
            router.refresh();
        } catch (error) {
            setError(true)
        }
    }

    const router = useRouter();
    const [error, setError] = useState(false);

    return (
        <>
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
                            <Button color='red' onClick={deleteIssue}>Delete Issue</Button>
                        </AlertDialog.Action>
                    </Flex>
                </AlertDialog.Content>
            </AlertDialog.Root>

            <AlertDialog.Root open={error}>
                <AlertDialog.Content>
                    <AlertDialog.Title>Error</AlertDialog.Title>
                    <AlertDialog.Description>This Issue can not be deleted.</AlertDialog.Description>
                    <Button color='gray' variant='soft' mt='3' onClick={() => setError(false)}>OK</Button>
                </AlertDialog.Content>
            </AlertDialog.Root>
        </>



    )
}

export default DeleteIssueButton