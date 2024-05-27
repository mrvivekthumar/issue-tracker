'use client';
import { AlertDialog, Button, Flex, Spinner } from '@radix-ui/themes'
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { FaGlassWater } from 'react-icons/fa6';

const DeleteIssueButton = ({ issueId }: { issueId: number }) => {
    const router = useRouter();
    const [error, setError] = useState(false);
    const [isDeleting, setDeleting] = useState(false);

    const deleteIssue = async () => {
        try {
            setDeleting(true);
            await axios.delete('/api/issues/' + issueId)
            router.push('/issues')
            router.refresh();
        } catch (error) {
            setDeleting(false);
            setError(true)
        }
    }



    return (
        <>
            <AlertDialog.Root>
                <AlertDialog.Trigger>
                    <Button color='red' disabled={isDeleting}>
                        Delete Issue
                        {isDeleting && <Spinner />}
                    </Button>

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