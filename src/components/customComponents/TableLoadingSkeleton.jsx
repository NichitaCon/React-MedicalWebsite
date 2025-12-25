import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function TableLoadingSkeleton({ columnSpan }) {
    return (
        <TableBody>
            <TableRow>
                <TableCell colSpan={columnSpan}>
                    <Skeleton className="h-[36px] w-full" />
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell colSpan={columnSpan}>
                    <Skeleton className="h-[36px] w-full" />
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell colSpan={columnSpan}>
                    <Skeleton className="h-[36px] w-full" />
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell colSpan={columnSpan}>
                    <Skeleton className="h-[36px] w-full" />
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell colSpan={columnSpan}>
                    <Skeleton className="h-[36px] w-full" />
                </TableCell>
            </TableRow>
        </TableBody>
    );
}
