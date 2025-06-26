function CategorySelect() {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Popup Title</h2>
            <p className="mb-6">This is the popup content.</p>
            <button 
                onClick={() => setShowPopup(false)} 
                className="bg-black text-white px-4 py-2 rounded hover:bg-zinc-800"
            >
                Close
            </button>
        </div>
        </div>
    )
}

export default CategorySelect;