import {
  type ChangeEvent,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  useEffect,
} from "react";
import UserPageLayout from "~/components/UserPageLayout";
import { Accordion, AccordionItem, Button, Code } from "@nextui-org/react";
import {
  ClipboardCopyIcon,
  CopyIcon,
  ImageIcon,
  RefreshCwIcon,
  UploadIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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
  const [uploadInProgress, setUploadInProgress] = useState<boolean>(false);

  const [image, setImage] = useState<Blob | undefined | string>();

  useEffect(() => {
    setUploadRes(undefined);
  }, [image]);

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

  const generatePreSignedUrl = api.example.generatePreSignedUrl.useMutation();

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
      <div className="flex w-full flex-col items-center gap-4">
        <p>Upload image using a pre-signed url.</p>
        <Button
          color="primary"
          isLoading={uploadInProgress || generatePreSignedUrl.isLoading}
          isDisabled={!!uploadRes || !image}
          onClick={() => {
            if (fileName && fileType)
              void generatePreSignedUrl.mutate(
                {
                  fileName,
                },
                {
                  onError: (e) => {
                    setUploadInProgress(false);
                    console.error(e);
                  },
                  onSuccess: (data) => {
                    setUploadInProgress(true);
                    if (image instanceof Blob && fileType) {
                      void uploadFileToBucket({
                        url: data.preSignedUrl,
                        fileContent: image,
                      })
                        .then(() => setUploadRes("ok"))
                        .catch((e: Error) => setUploadError(e))
                        .finally(() => setUploadInProgress(false));
                    } else {
                      const e = new Error("Image is not a Blob!");
                      setUploadInProgress(false);
                      setUploadError(e);
                      throw e;
                    }
                  },
                }
              );
          }}
        >
          {uploadRes ? "Uploaded image" : "Upload image"}
        </Button>
        {generatePreSignedUrl.data?.objectUrl && (
          <AnimatePresence>
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Code>{generatePreSignedUrl.data.objectUrl}</Code>
              <Button isIconOnly size="sm">
                <CopyIcon
                  className="h-3 w-3"
                  onClick={() => {
                    void navigator.clipboard.writeText(
                      generatePreSignedUrl.data.objectUrl
                    );
                  }}
                />
              </Button>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
      {/* <Accordion>
      <AccordionItem
      key="1"
      title="Details"
      isDisabled={!!generatePreSignedUrl.data?.preSignedUrl}
      >
      <p key="1">{generatePreSignedUrl.data?.preSignedUrl}</p>
      <p className="text-red-400">{generatePreSignedUrl.error?.message}</p>
      <p>{uploadRes}</p>
      <p className="text-red-400">{uploadError?.message}</p>
      </AccordionItem>
      </Accordion> */}
    </UserPageLayout>
  );
}
