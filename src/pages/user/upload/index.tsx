import { type ChangeEvent, useMemo, useRef, useState, ReactNode } from "react";
import UserPageLayout from "~/components/UserPageLayout";
import { Button } from "@nextui-org/react";
import { RefreshCwIcon, UploadIcon } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "~/utils/api";

export function FileNameLabel({ children }: { children: ReactNode }) {
  return <p className="text-zinc-500">{children}</p>;
}

export default function UploadImagePage() {
  const [image, setImage] = useState<Blob | undefined | string>();

  const { imageUrl, imageName } = useMemo(() => {
    const imageUrl = image instanceof Blob ? URL.createObjectURL(image) : image;
    const imageName = image instanceof Blob ? image.name : "image";
    return { imageUrl, imageName };
  }, [image]);

  const filePickerInput = useRef<HTMLInputElement>(null);

  const uploadTestFile = api.example.uploadTestFile.useMutation();

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
          key={imageUrl}
          className="flex h-96 flex-col items-center justify-center gap-2"
          layout
          layoutId={imageUrl}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              className="block aspect-auto max-h-72 max-w-full rounded-lg"
              src={imageUrl}
              alt=""
            />
          ) : (
            <div className="h-72 w-48 rounded-lg bg-zinc-900"></div>
          )}
          <FileNameLabel>{imageName}</FileNameLabel>
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
        <Button color="primary" onClick={() => uploadTestFile.mutate()}>
          Upload test file
        </Button>
        <p>{uploadTestFile.data?.message}</p>
        <p className="text-red-400">{uploadTestFile.error?.message}</p>
      </div>
    </UserPageLayout>
  );
}
