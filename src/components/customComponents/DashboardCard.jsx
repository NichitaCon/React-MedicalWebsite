export default function DashboardCard({cardTitle, cardNumber, cardWeeklyTrendNumber, Icon}) {
    return (
         <div className="bg-muted  2xl:min-w-sm max-w-sm p-3 rounded-md">
                <div className="flex flex-row items-start justify-between mb-4">
                    <div>
                        <p>{cardTitle}</p>
                        <p className="text-7xl font-regular">{cardNumber}</p>
                    </div>
                    <div className="bg-background p-3 rounded-full ml-2">
                        <Icon/>
                    </div>
                </div>
                <span className="font-medium">{cardWeeklyTrendNumber <= 0 ? "" : "+"}{cardWeeklyTrendNumber}</span>
                <span> this week</span>
            </div>
    )
}