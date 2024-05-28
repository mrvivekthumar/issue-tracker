'use client';
import { User } from '@prisma/client';
import { Select } from '@radix-ui/themes'
import axios from 'axios';
import React, { useEffect, useState } from 'react'

const AssigneeSelect = () => {

    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await axios.get<User[]>('/api/users');
                setUsers(data);
            } catch (err) {
                setError('Failed to fetch users');
                console.error(err);
            }
        };

        fetchUsers();
    }, []);

    return (
        <Select.Root>
            <Select.Trigger placeholder='Assignee...' />
            <Select.Content>
                <Select.Group>
                    <Select.Label>Suggestions</Select.Label>
                    {users.map(user => (
                        <Select.Item key={user.id} value={user.id}>
                            {user.name}
                        </Select.Item>)
                    )}
                </Select.Group>
            </Select.Content>
        </Select.Root >
    )
}

export default AssigneeSelect