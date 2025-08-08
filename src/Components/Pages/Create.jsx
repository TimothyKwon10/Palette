import Header from "../Header.jsx";
import Upload from "../../assets/images/upload.png";
import uploadAndStore from "../../../functions/Services/UploadImages/processUserUpload.mjs"
import { useDropzone } from "react-dropzone";

function DropUpload({ onFileUpload}) {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'image/*': [] },
        multiple: false,
        onDropAccepted: (acceptedFiles) => {
            const file = acceptedFiles[0];
            uploadAndStore(file);
        },
        onDropRejected: (fileRejections) => {
            console.log("The file upload was unsuccessful", fileRejections);
        }
    })

    return (
        <div
            {...getRootProps()}
            className="cursor-pointer w-[80vw] w-full max-w-[500px] h-[80vh] rounded-2xl border-[4px] border-dashed flex flex-col justify-center items-center transition transform hover:scale-[1.02] duration-[250ms] ease-in-out"
            style={{
              borderColor: "#f3f4f6",
              backgroundImage: `
                linear-gradient(#f3f4f6, #f3f4f6), 
                linear-gradient(135deg, #019cb9, #b8e6e0, #fa5902)
              `,
              backgroundOrigin: "border-box",
              backgroundClip: "padding-box, border-box",
            }}
        >
            <input {...getInputProps()} className="hidden" />
            <img
                src = {Upload}
                alt = "Upload"
                className = "w-8 h-8 object-cover m-2 animate-bounce"
            />
            <h1 className = "text-xl font-bold">Show us what you've been working on!</h1>
            <h1 className="text-center">Drag or click to upload a file</h1>
        </div>
    )
}

function Create() {
  return (
    <div className = "px-6 pb-6 min-h-screen flex flex-col font-[Lato-Regular]">
        <Header />
        <div className = "mb-6" />
        <div className = "flex flex-grow justify-center items-center">
            <DropUpload/>
        </div>
    </div>
  );
}

export default Create;
