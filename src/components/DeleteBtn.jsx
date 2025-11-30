import { Button } from "./ui/button";
import { Trash } from "lucide-react";
import axios from "@/config/api";
import { useState } from "react";

export default function DeleteBtn({ resource, id, onDeleteCallBack }) {
    const [deleteWarn, setDeleteWarn] = useState(false);

    let token = localStorage.getItem("token");

    const deleting = () => {
        setDeleteWarn(true);
    };

    const onDelete = async () => {
        console.warn(
            "trying to delete resource id",
            id,
            "with BEARER TOKEN:",
            token
        );
        const options = {
            method: "DELETE",
            url: `/${resource}/${id}`,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        try {
            let response = await axios.request(options);
            console.log("Single resource delete api response:", response.data);
            if (onDeleteCallBack) {
                onDeleteCallBack(id);
            }
        } catch (err) {
            console.error("Delete error", err);
        }
    };

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
