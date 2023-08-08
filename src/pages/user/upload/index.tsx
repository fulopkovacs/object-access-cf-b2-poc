import {
  type ChangeEvent,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import UserPageLayout from "~/components/UserPageLayout";
import { Button } from "@nextui-org/react";
import { ImageIcon, RefreshCwIcon, UploadIcon } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "~/utils/api";
import prettyBytes from "pretty-bytes";

async function uploadFileToBucket({
  // fileName,
  fileContent,
  url,
}: {
  url: string;
  fileContent: Blob;
}) {
  try {
    // TODO: send `PUT` request
    const res = await fetch(decodeURIComponent(url), {
      method: "PUT",
      // body: "it works from the browser",
      /* headers: {
        "Content-Type": "text/plain",
      }, */
      body: fileContent,
      /* headers: {
        "Content-Type": contentType,
      }, */
    });
    console.log(res);
    // return res;
    return res;
  } catch (e) {
    // throw e;
  }
}

function ImagePlaceHolder() {
  return (
    <div className="flex h-72 w-48 items-center justify-center rounded-lg bg-zinc-900">
      <ImageIcon className="h-6 w-6 text-zinc-700" />
    </div>
  );
}

function FileDataLabel({ children }: { children: ReactNode }) {
  return <p className="text-sm text-zinc-500">{children}</p>;
}

export default function UploadImagePage() {
  const [uploadRes, setUploadRes] = useState<string | undefined>();
  const [uploadError, setUploadError] = useState<Error | undefined>();

  const [image, setImage] = useState<Blob | undefined | string>();

  const { fileUrl, fileName, fileSize, fileType } = useMemo(() => {
    if (image instanceof Blob) {
      return {
        fileUrl: URL.createObjectURL(image),
        fileName: image.name,
        fileSize: prettyBytes(image.size),
        fileType: image.type,
        image,
      };
    } else {
      return { fileUrl: image };
    }
  }, [image]);

  const filePickerInput = useRef<HTMLInputElement>(null);

  const generatePreSignedUrl = api.example.generatePreSignedUrl.useMutation({
    onError: (e) => {
      console.error(e);
    },
    onSuccess: (data) => {
      if (image instanceof Blob && fileType) {
        void uploadFileToBucket({
          url: data.preSignedUrl,
          fileContent: image,
        })
          .then(() => setUploadRes("ok"))
          .catch((e: Error) => setUploadError(e));
      } else {
        const e = new Error("Image is not a Blob!");
        setUploadError(e);
        throw e;
      }
    },
  });

  function handleImageFile(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      const [imageFile] = event.target.files;
      setImage(imageFile);
    }
  }

  return (
    <UserPageLayout>
      <h1 className="text-center text-3xl font-semibold tracking-tight">
        Upload an image
      </h1>
      <div className="flex  w-full flex-col items-center justify-center gap-3 py-10">
        <motion.div
          key={fileUrl}
          className="flex h-96 flex-col items-center justify-center gap-2"
          layout
          layoutId={fileUrl}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {fileUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              className="block aspect-auto max-h-72 max-w-full rounded-lg"
              src={fileUrl}
              alt=""
            />
          ) : (
            <ImagePlaceHolder />
          )}
          <FileDataLabel>{fileName}</FileDataLabel>
          <FileDataLabel>{fileSize}</FileDataLabel>
          <FileDataLabel>{fileType}</FileDataLabel>
        </motion.div>
        <Button
          color={image ? "default" : "primary"}
          onClick={(e) => {
            e.preventDefault();
            filePickerInput.current?.click();
          }}
          startContent={
            image ? (
              <RefreshCwIcon className="h-4 w-4" />
            ) : (
              <UploadIcon className="h-4 w-4" />
            )
          }
        >
          {image ? "Change Image" : "Add image"}
        </Button>
      </div>
      <input
        onChange={handleImageFile}
        className="hidden"
        ref={filePickerInput}
        type="file"
        accept="image/*"
      />
      <div className="flex w-full flex-col items-center">
        <Button
          color="primary"
          onClick={() => {
            if (fileName && fileType)
              void generatePreSignedUrl.mutate({
                fileName,
                contentType: fileType,
              });
          }}
        >
          Get presigned url
        </Button>
        <p>{generatePreSignedUrl.data?.preSignedUrl}</p>
        <p className="text-red-400">{generatePreSignedUrl.error?.message}</p>
        <p>{uploadRes}</p>
        <p className="text-red-400">{uploadError?.message}</p>
        <img
          src="https://dev-virtual-sketchbook.s3.us-east-005.backblazeb2.com/Archery_FirstAge_Level1.png"
          alt=""
          className="block h-auto max-h-[300px] w-auto max-w-[300px]"
        />
      </div>
    </UserPageLayout>
  );
}
