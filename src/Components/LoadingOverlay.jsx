export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white px-8 py-5 rounded-lg shadow-md">
        <p className="text-gray-600 font-medium flex items-center">
          Setting up your feed
          <span className="flex ml-2 space-x-1 pb-2">
            <span className="animate-bounce text-3xl text-[#019cb9]">.</span>
            <span className="animate-bounce text-3xl text-[#b8e6e0] [animation-delay:200ms]">.</span>
            <span className="animate-bounce text-3xl text-[#fa5902] [animation-delay:400ms]">.</span>
          </span>
        </p>
      </div>
    </div>
  );
}
