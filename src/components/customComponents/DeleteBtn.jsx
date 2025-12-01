import { Button } from "../ui/button";
import { Trash } from "lucide-react";
import axios from "@/config/api";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function DeleteBtn({ resource, id, onDeleteCallBack }) {
    const [deleteWarn, setDeleteWarn] = useState(false);
    const { token } = useAuth();

    const deleting = () => {
        setDeleteWarn(true);
    };

    const onDelete = async () => {
        console.warn("trying to delete resource (", resource, ") id", id);
        const options = {
            method: "DELETE",
            url: `/${resource}/${id}`,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        try {
            let response = await axios.request(options);
            // console.log("Single resource (", resource ,") delete api response:", response);
            console.log("successfully deleted", resource, "/", id);
            toast.success("successfully deleted");
            if (onDeleteCallBack) {
                onDeleteCallBack(id);
            }
        } catch (err) {
            console.error("Delete error", err);
            toast.error(err.response?.data?.message);
            setDeleteWarn(false);
        }
    };

    // TODO: Need to restyle
    return !deleteWarn ? (
        <Button
            className="cursor-pointer text-red-800 hover:text-red-600 hover:border-red-600"
            variant="outline"
            size="icon"
            onClick={deleting}
        >
            <Trash />
        </Button>
    ) : (
        <div className="flex items-center gap-2 ">
            <p className="text-sm font-medium">Are you sure?</p>
            <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="text-red-600 border-red-300 bg-red-500 hover:bg-red-600 hover:text-red-500"
            >
                Yes
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteWarn(false)}
            >
                No
            </Button>
        </div>
    );
}
