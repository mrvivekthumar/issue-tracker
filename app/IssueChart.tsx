'use client';
import { ResponsiveContainer, XAxis, YAxis, Bar, BarChart, Tooltip, Legend } from 'recharts'

interface Props {
    open: number,
    closed: number,
    inProgress: number,
}

const IssueChart = ({ open, closed, inProgress }: Props) => {
    const data = [
        {
            label: 'Open',
            value: open,
            fill: '#EF4444' // red-500
        },
        {
            label: 'In Progress',
            value: inProgress,
            fill: '#F59E0B' // yellow-500
        },
        {
            label: 'Closed',
            value: closed,
            fill: '#10B981' // green-500
        }
    ]

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-900">{`${label} Issues`}</p>
                    <p className="text-sm text-gray-600">
                        Count: <span className="font-medium">{payload[0].value}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Issue Status Distribution</h3>
                <p className="text-sm text-gray-600">Current breakdown of issues by status</p>
            </div>

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#6B7280' }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#6B7280' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                        />
                        <Bar
                            dataKey="value"
                            radius={[4, 4, 0, 0]}
                            name="Issues"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Summary Stats */}
            <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-red-600">{open}</div>
                        <div className="text-xs text-gray-500">Open</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-yellow-600">{inProgress}</div>
                        <div className="text-xs text-gray-500">In Progress</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-green-600">{closed}</div>
                        <div className="text-xs text-gray-500">Closed</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default IssueChart