'use client';
import { Card } from "@radix-ui/themes"
import { ResponsiveContainer, XAxis, YAxis, Bar, BarChart } from 'recharts'

interface Props {
    open: number,
    closed: number,
    inProgress: number,
}

const IssueChart = ({ open, closed, inProgress }: Props) => {
    const data = [
        { label: 'Open', value: open },
        { label: 'Closed', value: closed },
        { label: 'inProgress', value: inProgress }
    ]
    return (
        <Card>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <XAxis dataKey='label' />
                    <YAxis />
                    <Bar dataKey='value' barSize={40} style={{ fill: 'var(--accent-9)' }} />
                </BarChart>
            </ResponsiveContainer>
        </Card >
    )
}

export default IssueChart