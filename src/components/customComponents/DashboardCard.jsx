import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router";

export default function DashboardCard({
    cardTitle,
    cardNumber,
    cardWeeklyTrendNumber,
    customDescription,
    Icon,
    loading,
    href,
}) {
    return (
        <Link to={href} >
            <div className="bg-muted 2xl:min-w-sm max-w-sm p-3 rounded-md transition-all duration-200 hover:shadow-sm hover:scale-102 shadow-accent">
                <div className="flex flex-row items-start justify-between mb-4">
                    <div>
                        <p>{cardTitle}</p>
                        {loading ? (
                            <Skeleton className="h-[72px] w-[72px]" />
                        ) : (
                            <p className="text-7xl font-regular">
                                {cardNumber}
                            </p>
                        )}
                    </div>
                    <div className="bg-background p-3 rounded-full ml-2">
                        <Icon />
                    </div>
                </div>
                {loading ? (
                    <Skeleton className="h-5 w-[180px]" />
                ) : customDescription ? (
                    <>
                        <span className="font-medium">
                            {cardWeeklyTrendNumber}
                        </span>
                        <span> {customDescription}</span>
                    </>
                ) : (
                    <>
                        <span className="font-medium">
                            {cardWeeklyTrendNumber <= 0 ? "" : "+"}
                            {cardWeeklyTrendNumber}
                        </span>
                        <span> this week</span>
                    </>
                )}
            </div>
        </Link>
    );
}
