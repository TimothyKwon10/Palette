
function CategoryCards({categoryName, onClick, isSelected, imgSource}) {

    return (
        <div className = {`font-[Lato-Regular] ${isSelected ? "bg-gradient-to-br from-[#019cb9] via-[#b8e6e0] to-[#fa5902]" : "font-[Lato-Regular]"} 
        p-1 rounded-md transition transform hover:scale-[1.03] duration-200 ease-in-out cursor-pointer`} 
        onClick = {onClick}>
            <div className = "p-5 bg-gray-100 rounded-md shadow-inner">
                
                {/* Image Section */}
                <div className="w-full h-80 rounded-md flex items-center justify-center">
                    <img 
                        src={imgSource} 
                        alt={categoryName} 
                        className = "object-cover w-full h-full rounded-md"
                    />
                </div>

                <p className = "mt-3 text-center text-lg">{categoryName}</p>
            </div>
        </div>
    )
}

export default CategoryCards