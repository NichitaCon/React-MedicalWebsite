export default function CreateButton({resourceName, onShowForm}) {
    return (
        <button
            onClick={onShowForm}
            className="p-2 px-3 border rounded-md cursor-pointer hover:bg-accent active:scale-95 active:text-gray-600 transition-all "
        >
            <p className="font-medium">New {resourceName}</p>
        </button>
    );
}
