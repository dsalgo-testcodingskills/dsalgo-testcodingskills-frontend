import React from "react";


function ImgUpload({ file, removeFile, externalClass }) {
    const [fileObject, setFileObject] = React.useState("");
    if (file) {
        var reader = new FileReader();

        reader.onload = function (e) {
            setFileObject(e.target.result);
        };

        reader.readAsDataURL(file);
    } else {
        return null;
    }

    return (
        <div className={externalClass || ""}>
            <img
                className="h-full w-full object-cover"
                src={fileObject} alt="upload-file" />
            <div
                className="removeIcon text-white font-bold py-2 px-4 rounded m-2"
                onClick={removeFile}
            >
                remove
            </div>
        </div>
    );
}

export default ImgUpload;